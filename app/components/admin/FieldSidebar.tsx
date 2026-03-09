import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { FormField, FieldType, FieldOptions } from '~/types';

interface Props {
  field: FormField;
  onUpdate: (id: string, type: FieldType, options: FieldOptions) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function FieldSidebar({ field, onUpdate, onDelete, onClose }: Props) {
  const [type, setType] = useState<FieldType>(field.type as FieldType);
  const [opts, setOpts] = useState<FieldOptions>(field.options);

  // Sync when field changes
  useEffect(() => {
    setType(field.type as FieldType);
    setOpts(field.options);
  }, [field.id, field.type, field.options]);

  const set = (key: keyof FieldOptions, value: unknown) => {
    const next = { ...opts, [key]: value } as FieldOptions;
    setOpts(next);
    onUpdate(field.id, type, next);
  };

  const setTypeAndUpdate = (newType: FieldType) => {
    setType(newType);
    onUpdate(field.id, newType, opts);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" p={2} pb={1}>
        <Typography variant="subtitle2" fontWeight={700} flexGrow={1}>
          FIELD SETTINGS
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
        <Stack spacing={2.5}>
          {/* Type selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              Field Type
            </Typography>
            <Select
              size="small"
              fullWidth
              value={type}
              onChange={(e) => setTypeAndUpdate(e.target.value as FieldType)}
            >
              <MenuItem value="text">Text (single line)</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="textarea">Textarea (multi-line)</MenuItem>
            </Select>
          </Box>

          {/* Common fields */}
          <TextField
            label="Label"
            size="small"
            fullWidth
            value={opts.label ?? ''}
            onChange={(e) => set('label', e.target.value)}
          />
          <TextField
            label="Placeholder"
            size="small"
            fullWidth
            value={opts.placeholder ?? ''}
            onChange={(e) => set('placeholder', e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!opts.required}
                onChange={(e) => set('required', e.target.checked)}
                color="primary"
              />
            }
            label="Required"
          />

          {/* Text / Textarea specific */}
          {(type === 'text' || type === 'textarea') && (
            <>
              <TextField
                label="Min Length"
                size="small"
                fullWidth
                type="number"
                value={opts.minLength ?? ''}
                onChange={(e) => set('minLength', e.target.value ? Number(e.target.value) : undefined)}
              />
              <TextField
                label="Max Length"
                size="small"
                fullWidth
                type="number"
                value={opts.maxLength ?? ''}
                onChange={(e) => set('maxLength', e.target.value ? Number(e.target.value) : undefined)}
              />
            </>
          )}

          {/* Textarea specific */}
          {type === 'textarea' && (
            <TextField
              label="Rows"
              size="small"
              fullWidth
              type="number"
              value={opts.rows ?? ''}
              onChange={(e) => set('rows', e.target.value ? Number(e.target.value) : undefined)}
            />
          )}

          {/* Number specific */}
          {type === 'number' && (
            <>
              <TextField
                label="Min"
                size="small"
                fullWidth
                type="number"
                value={opts.min ?? ''}
                onChange={(e) => set('min', e.target.value ? Number(e.target.value) : undefined)}
              />
              <TextField
                label="Max"
                size="small"
                fullWidth
                type="number"
                value={opts.max ?? ''}
                onChange={(e) => set('max', e.target.value ? Number(e.target.value) : undefined)}
              />
              <TextField
                label="Step"
                size="small"
                fullWidth
                type="number"
                value={opts.step ?? ''}
                onChange={(e) => set('step', e.target.value ? Number(e.target.value) : undefined)}
              />
            </>
          )}
        </Stack>
      </Box>

      <Divider />
      <Box p={2}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete Field
        </Button>
      </Box>
    </Box>
  );
}
