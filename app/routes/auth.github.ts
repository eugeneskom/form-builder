import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';

export async function loader({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('github', request);
}
