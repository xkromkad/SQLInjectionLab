import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getDbUser } from '@/lib/auth-user';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getDbUser();
  if (!user) {
    redirect({ href: '/login', locale });
  } else if (!user.termsAcceptedAt) {
    // First sign-in: must accept the educational-use Terms before the lab.
    redirect({ href: '/welcome', locale });
  }

  return <div className="mx-auto w-full max-w-6xl px-4 py-10">{children}</div>;
}
