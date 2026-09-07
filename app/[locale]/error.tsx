'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorPage');
  const nav = useTranslations('Nav');

  useEffect(() => {
    // Surfaces in the Vercel function logs alongside the digest shown below.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <Button variant="outline" asChild>
          <Link href="/">{nav('home')}</Link>
        </Button>
      </div>
    </div>
  );
}
