import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import OpenAI from 'openai';
import type { FieldType, FieldOptions } from '~/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a form builder assistant. When the user describes a form field, respond with a JSON object in this exact format:
{
  "field": {
    "type": "text" | "number" | "textarea",
    "options": {
      "label": "string",
      "placeholder": "string (optional)",
      "required": boolean,
      "minLength": number (optional, text/textarea only),
      "maxLength": number (optional, text/textarea only),
      "min": number (optional, number only),
      "max": number (optional, number only),
      "step": number (optional, number only),
      "rows": number (optional, textarea only)
    }
  },
  "message": "A friendly confirmation message describing what was added"
}

If the user asks something unrelated to form fields, respond with:
{ "message": "I can only help you add form fields. Try: 'Add a required email field'" }

Always respond with valid JSON only.`;

export async function action({ request }: ActionFunctionArgs) {
  if (!process.env.OPENAI_API_KEY) {
    return json({ message: '⚠️ OpenAI API key not configured. Set OPENAI_API_KEY in your .env file.' });
  }

  const { message } = (await request.json()) as { message: string };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const content = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(content) as {
      field?: { type: FieldType; options: FieldOptions };
      message: string;
    };

    return json(parsed);
  } catch (err) {
    console.error('AI chat error:', err);
    return json({ message: '⚠️ Failed to get AI response. Please try again.' });
  }
}
