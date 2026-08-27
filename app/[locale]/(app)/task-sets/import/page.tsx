import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ImportForm } from '@/components/task-sets/import-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Import' });
  return { title: t('title') };
}

export default async function ImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Import');

  return (
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/task-sets">
          <ArrowLeft className="size-4" />
          {t('title')}
        </Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-1 mb-8 text-muted-foreground">{t('subtitle')}</p>
      <ImportForm />
    </div>
  );
}
