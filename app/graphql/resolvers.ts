import { prisma } from '~/db.server';
import { z } from 'zod';

// Zod schemas for validation
const FieldOptionsSchema = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  rows: z.number().optional(),
});

function parseOptions(optionsStr: string) {
  try {
    return JSON.parse(optionsStr);
  } catch {
    return {};
  }
}

function serializeField(field: { id: string; type: string; order: number; options: string }) {
  return {
    ...field,
    options: parseOptions(field.options),
  };
}

function serializeForm(
  form: {
    id: string;
    title: string;
    description: string | null;
    published: boolean;
    fields: { id: string; type: string; order: number; options: string }[];
    createdAt: Date;
    updatedAt: Date;
  } & { fields: { id: string; type: string; order: number; options: string }[] },
) {
  return {
    ...form,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
    fields: form.fields
      .sort((a, b) => a.order - b.order)
      .map(serializeField),
  };
}

export const resolvers = {
  Query: {
    forms: async () => {
      const forms = await prisma.form.findMany({
        include: { fields: true },
        orderBy: { createdAt: 'desc' },
      });
      return forms.map(serializeForm);
    },

    publishedForms: async () => {
      const forms = await prisma.form.findMany({
        where: { published: true },
        include: { fields: true },
        orderBy: { createdAt: 'desc' },
      });
      return forms.map(serializeForm);
    },

    form: async (_: unknown, { id }: { id: string }) => {
      const form = await prisma.form.findUnique({
        where: { id },
        include: { fields: true },
      });
      if (!form) return null;
      return serializeForm(form);
    },
  },

  Mutation: {
    createForm: async (_: unknown, { title, description }: { title: string; description?: string }) => {
      const form = await prisma.form.create({
        data: { title, description },
        include: { fields: true },
      });
      return serializeForm(form);
    },

    updateForm: async (
      _: unknown,
      { id, title, description, published }: { id: string; title?: string; description?: string; published?: boolean },
    ) => {
      const form = await prisma.form.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(published !== undefined && { published }),
        },
        include: { fields: true },
      });
      return serializeForm(form);
    },

    deleteForm: async (_: unknown, { id }: { id: string }) => {
      await prisma.form.delete({ where: { id } });
      return true;
    },

    addField: async (
      _: unknown,
      { formId, type, options }: { formId: string; type: string; options: Record<string, unknown> },
    ) => {
      const validated = FieldOptionsSchema.parse(options);
      const existing = await prisma.field.count({ where: { formId } });
      const field = await prisma.field.create({
        data: {
          formId,
          type,
          order: existing,
          options: JSON.stringify(validated),
        },
      });
      return serializeField(field);
    },

    updateField: async (
      _: unknown,
      { id, type, order, options }: { id: string; type?: string; order?: number; options?: Record<string, unknown> },
    ) => {
      const validated = options ? FieldOptionsSchema.parse(options) : undefined;
      const field = await prisma.field.update({
        where: { id },
        data: {
          ...(type !== undefined && { type }),
          ...(order !== undefined && { order }),
          ...(validated !== undefined && { options: JSON.stringify(validated) }),
        },
      });
      return serializeField(field);
    },

    deleteField: async (_: unknown, { id }: { id: string }) => {
      await prisma.field.delete({ where: { id } });
      return true;
    },

    reorderFields: async (_: unknown, { formId, fieldIds }: { formId: string; fieldIds: string[] }) => {
      await Promise.all(
        fieldIds.map((id, index) =>
          prisma.field.update({ where: { id, formId }, data: { order: index } }),
        ),
      );
      const fields = await prisma.field.findMany({
        where: { formId },
        orderBy: { order: 'asc' },
      });
      return fields.map(serializeField);
    },

    submitForm: async (_: unknown, { formId, data }: { formId: string; data: string }) => {
      const submission = await prisma.submission.create({
        data: { formId, data },
      });
      return {
        ...submission,
        createdAt: submission.createdAt.toISOString(),
      };
    },
  },
};
