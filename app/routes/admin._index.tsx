import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  AppBar,
  Toolbar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { requireAdmin } from '~/utils/requireAdmin.server';
import { prisma } from '~/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  const forms = await prisma.form.findMany({
    include: { _count: { select: { fields: true, submissions: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return { user, forms };
}

export default function AdminIndex() {
  const { user, forms } = useLoaderData<typeof loader>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Form Builder Admin
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={user.avatarUrl} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2" color="text.secondary">
              {user.displayName}
            </Typography>
            <form method="post" action="/auth/logout">
              <Button size="small" variant="outlined" type="submit" color="error">
                Logout
              </Button>
            </form>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Forms
          </Typography>
          <Button
            component={Link}
            to="/admin/forms/new"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            New Form
          </Button>
        </Stack>

        {forms.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" mb={2}>
              No forms yet. Create your first one!
            </Typography>
            <Button component={Link} to="/admin/forms/new" variant="contained" startIcon={<AddIcon />}>
              Create Form
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="center">Fields</TableCell>
                  <TableCell align="center">Submissions</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form: any) => (
                  <TableRow key={form.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{form.title}</Typography>
                      {form.description && (
                        <Typography variant="caption" color="text.secondary">
                          {form.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{form._count.fields}</TableCell>
                    <TableCell align="center">{form._count.submissions}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={form.published ? 'Published' : 'Draft'}
                        color={form.published ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        component={Link}
                        to={`/admin/forms/${form.id}`}
                        color="primary"
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
