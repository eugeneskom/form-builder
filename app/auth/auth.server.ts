import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import { sessionStorage } from './session.server';

export interface UserSession {
  id: string;
  login: string;
  displayName: string;
  avatarUrl: string;
}

export const authenticator = new Authenticator<UserSession>(sessionStorage);

const githubStrategy = new GitHubStrategy(
  {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectURI: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
  },
  async ({ profile }) => {
    return {
      id: profile.id,
      login: profile.displayName || profile.emails?.[0]?.value || 'unknown',
      displayName: profile.displayName || profile.emails?.[0]?.value || 'User',
      avatarUrl: profile.photos?.[0]?.value || '',
    };
  },
);

authenticator.use(githubStrategy);
