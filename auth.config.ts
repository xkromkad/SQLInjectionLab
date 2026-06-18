import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

/**
 * Edge-safe auth configuration (no database adapter). Shared by the proxy
 * middleware and the full Node-runtime auth instance in `auth.ts`.
 *
 * Provider credentials are auto-detected from env:
 *   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
 *   AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
 */
export const authConfig = {
  trustHost: true,
  providers: [Google, GitHub],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
