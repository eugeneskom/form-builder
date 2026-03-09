import React from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link } from '@remix-run/react';
import { requireAdmin } from '~/utils/requireAdmin.server';
import { prisma } from '~/db.server';
import { z } from 'zod';

const CreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const raw = { title: formData.get('title'), description: formData.get('description') };
  const result = CreateFormSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const form = await prisma.form.create({
    data: {
      title: result.data.title,
      description: result.data.description || null,
    },
  });

  return redirect(`/admin/forms/${form.id}`);
}

export default function NewForm() {
  const actionData = useActionData<typeof action>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Button component={Link} to="/admin" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
          Back to Forms
        </Button>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Create New Form
          </Typography>
          {actionData?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionData.error}
            </Alert>
          )}
          <Form method="post">
            <Stack spacing={3}>
              <TextField
                name="title"
                label="Form Title"
                required
                fullWidth
                autoFocus
                placeholder="e.g. Contact Us, Job Application"
              />
              <TextField
                name="description"
                label="Description (optional)"
                fullWidth
                multiline
                rows={3}
                placeholder="Briefly describe what this form is for"
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Create Form & Add Fields
              </Button>
            </Stack>
          </Form>
        </Paper>
      </Container>
    </Box>
  );
}
