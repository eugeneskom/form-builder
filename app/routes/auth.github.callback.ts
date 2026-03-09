import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.authenticate('github', request, {
    successRedirect: '/admin',
    failureRedirect: '/auth/github',
  });
}
