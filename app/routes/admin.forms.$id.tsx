import React from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { Link } from '@remix-run/react';
import { requireAdmin } from '~/utils/requireAdmin.server';
import { prisma } from '~/db.server';
import type { Form, FormField, FieldType } from '~/types';
import { FieldList } from '~/components/admin/FieldList';
import { FieldSidebar } from '~/components/admin/FieldSidebar';
import { FormPreview } from '~/components/admin/FormPreview';
import { AiChat } from '~/components/admin/AiChat';

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: { fields: { orderBy: { order: 'asc' } } },
  });
  if (!form) throw new Response('Form not found', { status: 404 });

  return json({
    form: {
      ...form,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      fields: form.fields.map((f: { id: string; options: string; [key: string]: any }) => ({
        ...f,
        options: JSON.parse(f.options) as Form['fields'][number]['options'],
      })),
    } as Form,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);
  const id = params.id!;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'update-form') {
    await prisma.form.update({
      where: { id },
      data: {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || null,
      },
    });
    return json({ ok: true });
  }

  if (intent === 'toggle-publish') {
    const current = await prisma.form.findUnique({ where: { id } });
    await prisma.form.update({ where: { id }, data: { published: !current?.published } });
    return json({ ok: true });
  }

  if (intent === 'add-field') {
    const type = formData.get('type') as string;
    const count = await prisma.field.count({ where: { formId: id } });
    await prisma.field.create({
      data: { formId: id, type, order: count, options: JSON.stringify({ label: `${type} field`, required: false }) },
    });
    return json({ ok: true });
  }

  if (intent === 'update-field') {
    const fieldId = formData.get('fieldId') as string;
    const options = JSON.parse(formData.get('options') as string);
    const type = formData.get('type') as string;
    await prisma.field.update({ where: { id: fieldId }, data: { type, options: JSON.stringify(options) } });
    return json({ ok: true });
  }

  if (intent === 'delete-field') {
    await prisma.field.delete({ where: { id: formData.get('fieldId') as string } });
    return json({ ok: true });
  }

  if (intent === 'delete-form') {
    await prisma.form.delete({ where: { id } });
    return redirect('/admin');
  }

  if (intent === 'reorder-fields') {
    const fieldIds = JSON.parse(formData.get('fieldIds') as string) as string[];
    await Promise.all(fieldIds.map((fid, idx) => prisma.field.update({ where: { id: fid }, data: { order: idx } })));
    return json({ ok: true });
  }

  if (intent === 'add-ai-field') {
    const fieldJson = formData.get('field') as string;
    const field = JSON.parse(fieldJson) as { type: FieldType; options: FormField['options'] };
    const count = await prisma.field.count({ where: { formId: id } });
    await prisma.field.create({
      data: { formId: id, type: field.type, order: count, options: JSON.stringify(field.options) },
    });
    return json({ ok: true });
  }

  return json({ ok: false }, { status: 400 });
}

export default function FormEditor() {
  const { form } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || '');

  const selectedField = form.fields.find((f) => f.id === selectedFieldId) ?? null;

  const doAction = useCallback(
    async (body: Record<string, string>) => {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch(`/admin/forms/${form.id}`, { method: 'POST', body: fd });
      if (res.ok) revalidator.revalidate();
      return res.ok;
    },
    [form.id, revalidator],
  );

  const handleSave = async () => {
    const ok = await doAction({ intent: 'update-form', title, description });
    setSnackbar({ msg: ok ? 'Saved!' : 'Save failed', type: ok ? 'success' : 'error' });
  };

  const handleAddField = async (type: FieldType) => {
    setAddMenuAnchor(null);
    await doAction({ intent: 'add-field', type });
  };

  const handleDeleteForm = async () => {
    if (!confirm('Delete this form? This cannot be undone.')) return;
    await doAction({ intent: 'delete-form' });
  };

  const handleTogglePublish = () => doAction({ intent: 'toggle-publish' });

  const handleFieldUpdate = async (fieldId: string, type: FieldType, options: FormField['options']) => {
    await doAction({ intent: 'update-field', fieldId, type, options: JSON.stringify(options) });
  };

  const handleFieldDelete = async (fieldId: string) => {
    setSelectedFieldId(null);
    await doAction({ intent: 'delete-field', fieldId });
  };

  const handleReorder = async (fieldIds: string[]) => {
    await doAction({ intent: 'reorder-fields', fieldIds: JSON.stringify(fieldIds) });
  };

  const handleAiField = async (field: { type: FieldType; options: FormField['options'] }) => {
    const ok = await doAction({ intent: 'add-ai-field', field: JSON.stringify(field) });
    if (ok) setSnackbar({ msg: '✨ AI field added!', type: 'success' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <IconButton component={Link} to="/admin" size="small">
            <ArrowBackIcon />
          </IconButton>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, mx: 2, alignItems: 'center' }}>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="standard"
              fullWidth
              inputProps={{ style: { fontSize: 18, fontWeight: 700 } }}
              placeholder="Form title"
            />
          </Stack>
          <Chip
            label={form.published ? 'Published' : 'Draft'}
            color={form.published ? 'success' : 'default'}
            size="small"
            sx={{ mr: 1 }}
          />
          <Tooltip title="Toggle AI Chat">
            <IconButton onClick={() => setShowAiChat((v) => !v)} color={showAiChat ? 'primary' : 'default'}>
              <SmartToyIcon />
            </IconButton>
          </Tooltip>
          <Button startIcon={<SaveIcon />} variant="outlined" size="small" onClick={handleSave} sx={{ mr: 1 }}>
            Save
          </Button>
          <Button
            startIcon={form.published ? <UnpublishedIcon /> : <PublishIcon />}
            variant="contained"
            size="small"
            color={form.published ? 'warning' : 'success'}
            onClick={handleTogglePublish}
            sx={{ mr: 1 }}
          >
            {form.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Tooltip title="Delete form">
            <IconButton color="error" onClick={handleDeleteForm}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main editor area */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Field List */}
        <Box
          sx={{
            width: 280,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Stack p={2} pb={1} direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              FIELDS
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            >
              Add
            </Button>
            <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
              {(['text', 'number', 'textarea'] as FieldType[]).map((t) => (
                <MenuItem key={t} onClick={() => handleAddField(t)}>
                  {t}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
          <Divider />
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
            <FieldList
              fields={form.fields}
              selectedId={selectedFieldId}
              onSelect={setSelectedFieldId}
              onReorder={handleReorder}
              onDelete={handleFieldDelete}
            />
          </Box>
        </Box>

        {/* Center: Preview */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={2} textAlign="center">
            LIVE PREVIEW
          </Typography>
          <Container maxWidth="sm">
            <FormPreview form={form} />
          </Container>
        </Box>

        {/* Right: Settings Sidebar (only when field selected) */}
        {selectedField && (
          <Box
            sx={{
              width: 320,
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              bgcolor: 'background.paper',
              overflow: 'auto',
            }}
          >
            <FieldSidebar
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onDelete={() => handleFieldDelete(selectedField.id)}
              onClose={() => setSelectedFieldId(null)}
            />
          </Box>
        )}

        {/* AI Chat panel */}
        {showAiChat && (
          <Box
            sx={{
              width: 340,
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AiChat onAddField={handleAiField} />
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.type} sx={{ width: '100%' }}>
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
