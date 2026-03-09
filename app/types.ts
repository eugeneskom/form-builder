import { Prisma } from '@prisma/client';

// Base model types representing the structure in schema.prisma
export interface FormBase {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldBase {
  id: string;
  formId: string;
  type: string;
  order: number;
  options: string;
}

export interface SubmissionBase {
  id: string;
  formId: string;
  data: string;
  createdAt: Date;
}

/**
 * A direct way to define types for specific Prisma queries.
 */
export type FormWithCount = FormBase & {
  _count: {
    fields: number;
    submissions: number;
  };
};

export interface FieldOptions {
  label?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export type FieldType = 'text' | 'number' | 'textarea';

export interface FormField {
  id: string;
  type: FieldType;
  order: number;
  options: FieldOptions;
}

export interface Form {
  id: string;
  title: string;
  description?: string | null;
  published: boolean;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  data: string;
  createdAt: string;
}
