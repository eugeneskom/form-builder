import { z } from 'zod';
import type { FieldType, FieldOptions } from '~/types';

// Zod schema for field generation
export const FieldSchema = z.object({
  type: z.enum(['text', 'number', 'textarea']),
  options: z.object({
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    rows: z.number().optional(),
  }),
});

export const AiResponseSchema = z.object({
  field: FieldSchema.optional(),
  message: z.string(),
});

export type ParsedField = z.infer<typeof FieldSchema>;
export type AiResponse = z.infer<typeof AiResponseSchema>;

/**
 * Rule-based parser that works without an API key
 * Parses simple user requests into form fields
 */
export class RuleBasedFieldParser {
  parse(message: string): AiResponse {
    const lower = message.toLowerCase();

    // Common field type keywords
    const fieldTypeMap: Record<string, FieldType> = {
      email: 'text',
      phone: 'text',
      telephone: 'text',
      number: 'number',
      age: 'number',
      quantity: 'number',
      textarea: 'textarea',
      description: 'textarea',
      comment: 'textarea',
      text: 'text',
      name: 'text',
      address: 'text',
    };

    // Detect field type
    let fieldType: FieldType = 'text';
    let detectedLabel = '';

    for (const [keyword, type] of Object.entries(fieldTypeMap)) {
      if (lower.includes(keyword)) {
        fieldType = type;
        detectedLabel = this.capitalizeFirst(keyword);
        break;
      }
    }

    // If no specific type detected, try to extract from the message
    if (detectedLabel === '') {
      // Try to extract something like "add a [field name] field"
      const addMatch = lower.match(/add\s+(?:a\s+)?(?:field\s+for\s+)?(\w+)/);
      if (addMatch) {
        detectedLabel = this.capitalizeFirst(addMatch[1]);
      } else {
        return {
          message:
            "I couldn't understand that. Try: 'Add a required email field' or 'Add phone number field'",
        };
      }
    }

    // Detect if required
    const required = lower.includes('required') || lower.includes('mandatory') || lower.includes("обов'язкове");

    // Build options object with proper typing
    const options: {
      label: string;
      required: boolean;
      placeholder?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      step?: number;
      rows?: number;
    } = {
      label: detectedLabel,
      required,
    };

    // Add placeholder based on field type
    if (detectedLabel.toLowerCase() === 'email') {
      options.placeholder = 'example@email.com';
    } else if (detectedLabel.toLowerCase() === 'phone' || detectedLabel.toLowerCase() === 'telephone') {
      options.placeholder = '+380XXXXXXXXX';
      options.label = 'Phone Number';
    } else if (fieldType === 'number') {
      options.placeholder = 'Enter a number';
    } else if (fieldType === 'textarea') {
      options.placeholder = 'Enter text...';
      options.rows = 4;
    }

    // Parse min/max length for text fields
    const minLengthMatch = lower.match(/min(?:imum)?\s*(?:length)?\s*(\d+)/);
    const maxLengthMatch = lower.match(/max(?:imum)?\s*(?:length)?\s*(\d+)/);

    if (fieldType === 'text' || fieldType === 'textarea') {
      if (minLengthMatch) {
        options.minLength = parseInt(minLengthMatch[1], 10);
      }
      if (maxLengthMatch) {
        options.maxLength = parseInt(maxLengthMatch[1], 10);
      }
    }

    // Parse min/max for number fields
    const minMatch = lower.match(/min(?:imum)?\s*(?:value)?\s*(\d+)/);
    const maxMatch = lower.match(/max(?:imum)?\s*(?:value)?\s*(\d+)/);

    if (fieldType === 'number') {
      if (minMatch) {
        options.min = parseInt(minMatch[1], 10);
      }
      if (maxMatch) {
        options.max = parseInt(maxMatch[1], 10);
      }
    }

    // Generate confirmation message
    const requiredText = required ? 'required ' : '';
    const constraintsText = this.buildConstraintsText(options, fieldType);

    return {
      field: { type: fieldType, options },
      message: `✅ Added ${requiredText}${detectedLabel} field${constraintsText}`,
    };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private buildConstraintsText(options: FieldOptions, type: FieldType): string {
    const constraints: string[] = [];

    if (type === 'text' || type === 'textarea') {
      if (options.minLength) constraints.push(`min length: ${options.minLength}`);
      if (options.maxLength) constraints.push(`max length: ${options.maxLength}`);
    }

    if (type === 'number') {
      if (options.min !== undefined) constraints.push(`min: ${options.min}`);
      if (options.max !== undefined) constraints.push(`max: ${options.max}`);
    }

    return constraints.length > 0 ? ` (${constraints.join(', ')})` : '';
  }
}
