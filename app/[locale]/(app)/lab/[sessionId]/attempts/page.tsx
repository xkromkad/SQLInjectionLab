import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { getUserId } from '@/lib/auth-user';
import { getSessionForUser, getSubmissions } from '@/lib/queries/session';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Attempts' });
  return { title: t('title') };
}

export default async function AttemptsPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Attempts');
  const format = await getFormatter();

  const userId = await getUserId();
  if (!userId) notFound();
  const row = await getSessionForUser(sessionId, userId);
  if (!row) notFound();

  const attempts = await getSubmissions(sessionId);
  // Map stable task ids to their human caption for display.
  const captions = new Map(
    row.taskSet.tasks.map((task, i) => [task.id, `#${i + 1} ${task.caption}`])
  );

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href={`/lab/${sessionId}`}>
          <ArrowLeft className="size-4" />
          {t('backToLab')}
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>

      {attempts.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('outcome')}</TableHead>
                <TableHead>{t('task')}</TableHead>
                <TableHead>{t('query')}</TableHead>
                <TableHead className="text-right">{t('time')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.isCorrect ? (
                      <Badge className="gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {t('correct')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <XCircle className="size-3.5" />
                        {t('incorrect')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate">
                    {captions.get(a.taskId) ?? a.taskId}
                  </TableCell>
                  <TableCell className="max-w-[28rem]">
                    <code className="block truncate font-mono text-xs">
                      {a.finalQuery}
                    </code>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {format.dateTime(a.createdAt, { timeStyle: 'short', dateStyle: 'short' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
