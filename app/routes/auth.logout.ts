import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.logout(request, { redirectTo: '/' });
}
