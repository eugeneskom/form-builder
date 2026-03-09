import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';

export async function requireAdmin(request: Request) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/github',
  });
  return user;
}

export async function getOptionalUser(request: Request) {
  return authenticator.isAuthenticated(request);
}
