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

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Split off a leading /sk or /en prefix: the remainder is matched against the
  // protected list, the prefix is kept so the redirect stays in that locale.
  const locale = nextUrl.pathname.match(LOCALE_PREFIX)?.[1];
  const pathname = nextUrl.pathname.replace(LOCALE_PREFIX, '') || '/';
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // localePrefix is 'as-needed': the default locale has no prefix, others keep theirs.
  const prefix = locale && locale !== routing.defaultLocale ? `/${locale}` : '';

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL(`${prefix}/login`, nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // A signed-in user has no reason to see the login screen; the (app) layout
  // then routes them on to /welcome if they still owe Terms acceptance.
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL(`${prefix}/dashboard`, nextUrl.origin));
  }

  // Hand off to next-intl for locale negotiation / rewriting.
  return intlMiddleware(req);
});

export const config = {
  // Everything except /api, Next internals and files with an extension.
  // The dot exclusion is written as [.] on purpose: Next compiles this source
  // through path-to-regexp, which eats the backslash in a `\.` escape and
  // leaves `.*..*` — a lookahead that rejects every non-empty path, so only
  // "/" would reach the proxy and all unprefixed routes would 404.
  matcher: ['/((?!api|_next|_vercel|.*[.].*).*)'],
};
