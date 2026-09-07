import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShieldCheck } from 'lucide-react';
import { redirect } from '@/i18n/navigation';
import { getAuthState } from '@/lib/auth-user';
import { WelcomeForm } from '@/components/auth/welcome-form';
import { ForceSignOut } from '@/components/auth/force-sign-out';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function WelcomePage({
  params,
}: {
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
  } else if (state.user.termsAcceptedAt) {
    redirect({ href: '/dashboard', locale });
  }

  const t = await getTranslations('Welcome');
  const ruleKeys = ['educational', 'noRealSystems', 'responsibility'] as const;

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h2 className="mb-2 text-sm font-semibold">{t('rulesTitle')}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {ruleKeys.map((key) => (
                <li key={key}>{t(`rules.${key}`)}</li>
              ))}
            </ul>
          </div>
          <WelcomeForm />
        </CardContent>
      </Card>
    </div>
  );
}
