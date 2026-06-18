import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Upload, Layers } from 'lucide-react';
import { getUserId } from '@/lib/auth-user';
import { getVisibleTaskSets } from '@/lib/queries/task-sets';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StartSessionButton } from '@/components/task-sets/start-session-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TaskSets' });
  return { title: t('title') };
}

export default async function TaskSetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('TaskSets');

  const userId = await getUserId();
  if (!userId) notFound();
  const sets = await getVisibleTaskSets(userId);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/task-sets/import">
            <Upload className="size-4" />
            {t('import')}
          </Link>
        </Button>
      </div>

      {sets.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <Card key={set.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={set.isBuiltin ? 'secondary' : 'outline'}>
                    {set.isBuiltin ? t('builtin') : t('custom')}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Layers className="size-3.5" />
                    {t('tasksCount', { count: set.taskCount })}
                  </span>
                </div>
                <CardTitle className="mt-2">{set.title}</CardTitle>
                {set.description && (
                  <CardDescription className="line-clamp-3">
                    {set.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <StartSessionButton taskSetId={set.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
