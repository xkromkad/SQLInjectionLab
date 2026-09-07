import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getAuthState } from '@/lib/auth-user';
import { ForceSignOut } from '@/components/auth/force-sign-out';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const state = await getAuthState();
  if (state.status === 'anonymous') {
    redirect({ href: '/login', locale });
  } else if (state.status === 'stale') {
    // Valid JWT, missing user row — drop the cookie instead of looping to /login.
    return <ForceSignOut />;
  } else if (!state.user.termsAcceptedAt) {
    // First sign-in: must accept the educational-use Terms before the lab.
    redirect({ href: '/welcome', locale });
  }

  return <div className="mx-auto w-full max-w-6xl px-4 py-10">{children}</div>;
}
