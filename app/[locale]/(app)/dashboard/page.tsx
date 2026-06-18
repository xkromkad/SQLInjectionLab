import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Plus, ListChecks, ArrowRight } from 'lucide-react';
import { getUserId } from '@/lib/auth-user';
import { getUserSessions } from '@/lib/queries/session';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  return { title: t('title') };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');
  const format = await getFormatter();

  const userId = await getUserId();
  if (!userId) notFound();
  const sessions = await getUserSessions(userId);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/task-sets">
            <Plus className="size-4" />
            {t('newSession')}
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{t('empty')}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/task-sets">{t('browseSets')}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const pct = s.totalCount ? (s.solvedCount / s.totalCount) * 100 : 0;
            return (
              <Card key={s.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        s.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {t(`status.${s.status}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format.dateTime(s.startedAt, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-lg">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t('progress')}</span>
                    <span>
                      {s.solvedCount} / {s.totalCount}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                </CardContent>
                <CardFooter className="gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/lab/${s.id}`}>
                      {t('continue')}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <Link
                      href={`/lab/${s.id}/attempts`}
                      aria-label={t('viewAttempts')}
                    >
                      <ListChecks className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
