import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginButtons } from '@/components/auth/login-buttons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });
  return { title: t('title') };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { callbackUrl } = await searchParams;
  const t = await getTranslations('Auth');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginButtons callbackUrl={callbackUrl ?? '/dashboard'} />
          <p className="text-center text-xs text-muted-foreground">
            {t.rich('termsNotice', {
              terms: (chunks) => (
                <Link
                  href="/legal/terms"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </CardContent>
      </Card>
      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
