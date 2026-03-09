import React from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData, Form as RemixForm } from '@remix-run/react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { Link } from '@remix-run/react';
import { prisma } from '~/db.server';
import type { Form as FormType, FormField } from '~/types';

export async function loader({ params }: LoaderFunctionArgs) {
  const form = await prisma.form.findFirst({
    where: { id: params.id, published: true },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  if (!form) throw new Response('Form not found or not published', { status: 404 });

  return json({
    form: {
      ...form,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      fields: form.fields.map((f: { id: string; options: string; [key: string]: any }) => ({
        ...f,
        options: JSON.parse(f.options) as FormField['options'],
      })),
    } as FormType,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const formId = params.id!;
  
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { fields: true },
  });

  if (!form) return json({ error: 'Form not found' }, { status: 404 });

  const data: Record<string, string> = {};
  form.fields.forEach((field: { id: string }) => {
    const value = formData.get(field.id) as string;
    data[field.id] = value;
  });

  await prisma.submission.create({
    data: {
      formId,
      data: JSON.stringify(data),
    },
  });

  return json({ success: true, submittedData: data, fields: form.fields });
}

export default function FormFill() {
  const { form } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setOpen(true);
    }
  }, [actionData]);

  const getFieldValue = (fieldId: string) => {
    if (actionData && 'submittedData' in actionData && actionData.submittedData) {
      return actionData.submittedData[fieldId];
    }
    return '';
  };

  const getFieldLabel = (fieldId: string) => {
    const f = form.fields.find((field: { id: string }) => field.id === fieldId);
    return f?.options?.label || 'Field';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <IconButton component={Link} to="/" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {form.title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <CardHeader
            title={form.title}
            subheader={form.description}
            titleTypographyProps={{ fontWeight: 700, variant: 'h5' }}
          />
          <Divider />
          <CardContent>
            <RemixForm method="post">
              <Stack spacing={3}>
                {form.fields.map((field) => {
                  const label = field.options.label || `${field.type} field`;
                  const placeholder = field.options.placeholder || '';
                  const required = field.options.required;

                  if (field.type === 'textarea') {
                    return (
                      <TextField
                        key={field.id}
                        name={field.id}
                        label={label}
                        placeholder={placeholder}
                        required={required}
                        multiline
                        rows={field.options.rows || 4}
                        fullWidth
                        size="medium"
                        inputProps={{
                          minLength: field.options.minLength,
                          maxLength: field.options.maxLength,
                        }}
                      />
                    );
                  }

                  return (
                    <TextField
                      key={field.id}
                      name={field.id}
                      label={label}
                      placeholder={placeholder}
                      required={required}
                      type={field.type === 'number' ? 'number' : 'text'}
                      fullWidth
                      size="medium"
                      inputProps={
                        field.type === 'number'
                          ? {
                              min: field.options.min,
                              max: field.options.max,
                              step: field.options.step,
                            }
                          : {
                              minLength: field.options.minLength,
                              maxLength: field.options.maxLength,
                            }
                      }
                    />
                  );
                })}

                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2, height: 56 }}>
                  Submit Response
                </Button>
              </Stack>
            </RemixForm>
          </CardContent>
        </Card>
      </Container>

      {/* Success Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>Submission Confirmed!</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Thank you for your response. Here is what we received:
          </Typography>
          <List dense sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
            {actionData && 'submittedData' in actionData && actionData.submittedData && Object.keys(actionData.submittedData).map((fieldId) => (
              <ListItem key={fieldId} divider>
                <ListItemText
                  primary={getFieldLabel(fieldId)}
                  secondary={getFieldValue(fieldId) || <Typography variant="caption" sx={{ fontStyle: 'italic' }}>no response</Typography>}
                  primaryTypographyProps={{ variant: 'caption', fontWeight: 600, color: 'primary.main' }}
                   secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { mt: 0.5 } }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} variant="contained" fullWidth>
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
