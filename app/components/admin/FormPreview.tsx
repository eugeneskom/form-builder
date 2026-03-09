import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Form } from '~/types';

interface Props {
  form: Form;
}

export function FormPreview({ form }: Props) {
  return (
    <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <CardHeader
        title={form.title}
        subheader={form.description}
        titleTypographyProps={{ fontWeight: 700 }}
      />
      {form.fields.length > 0 && <Divider />}
      <CardContent>
        {form.fields.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
            <Typography>No fields added yet</Typography>
            <Typography variant="caption">Use the left panel to add fields</Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {form.fields.map((field) => {
              const label = field.options.label || `${field.type} field`;
              const placeholder = field.options.placeholder || '';
              const required = field.options.required;

              if (field.type === 'textarea') {
                return (
                  <TextField
                    key={field.id}
                    label={`${label}${required ? ' *' : ''}`}
                    placeholder={placeholder}
                    multiline
                    rows={field.options.rows || 4}
                    fullWidth
                    disabled
                    size="small"
                  />
                );
              }

              return (
                <TextField
                  key={field.id}
                  label={`${label}${required ? ' *' : ''}`}
                  placeholder={placeholder}
                  type={field.type === 'number' ? 'number' : 'text'}
                  fullWidth
                  disabled
                  size="small"
                  inputProps={
                    field.type === 'number'
                      ? { min: field.options.min, max: field.options.max, step: field.options.step }
                      : { minLength: field.options.minLength, maxLength: field.options.maxLength }
                  }
                />
              );
            })}

            <Button variant="contained" fullWidth disabled sx={{ mt: 1 }}>
              Submit
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
