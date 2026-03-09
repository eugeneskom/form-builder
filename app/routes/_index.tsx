import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Chip,
  Grid,
  Stack,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Article as ArticleIcon,
  ArrowForward as ArrowForwardIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { prisma } from '~/db.server';
import { getOptionalUser } from '~/utils/requireAdmin.server';
import { FormWithCount } from '~/types';



export const meta = () => [
  { title: 'Form Builder – Browse Forms' },
  { name: 'description', content: 'Browse and fill out available forms.' },
];
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getOptionalUser(request);
  const forms = await prisma.form.findMany({
    where: { published: true },
    include: { _count: { select: { fields: true } } },
    orderBy: { createdAt: 'desc' },
  }) as FormWithCount[];
  return { forms, user };
}

export default function HomePage() {
  const { forms, user } = useLoaderData<typeof loader>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <ArticleIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Form Builder
          </Typography>
          {user ? (
            <Button component={Link} to="/admin" startIcon={<AdminPanelSettingsIcon />} variant="contained" size="small">
              Admin Panel
            </Button>
          ) : (
            <Button component={Link} to="/auth/github" variant="outlined" size="small">
              Admin Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,101,132,0.1) 100%)',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h2" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
            Available Forms
          </Typography>
          <Typography color="text.secondary" variant="subtitle1">
            Select a form below to fill it out
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        {forms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No forms published yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Check back later or log in to the admin panel to create forms.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form: FormWithCount) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(108,99,255,0.25)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                      <ArticleIcon color="primary" />
                      <Chip label={`${form._count.fields} fields`} size="small" />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {form.title}
                    </Typography>
                    {form.description && (
                      <Typography variant="body2" color="text.secondary">
                        {form.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/forms/${form.id}`}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      fullWidth
                    >
                      Fill Form
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
