import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { authConfig } from './auth.config';
import { routing } from './i18n/routing';

// Edge-safe auth instance (no DB adapter) just for reading the session.
const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

// Locale-stripped path prefixes that require authentication.
const PROTECTED_PREFIXES = ['/dashboard', '/task-sets', '/lab', '/welcome'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Remove a leading /sk or /en prefix before matching protected routes.
  const pathname =
    nextUrl.pathname.replace(/^\/(sk|en)(?=\/|$)/, '') || '/';
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Hand off to next-intl for locale negotiation / rewriting.
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
