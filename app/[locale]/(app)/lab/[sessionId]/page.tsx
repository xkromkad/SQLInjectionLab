import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getUserId } from '@/lib/auth-user';
import {
  getSessionForUser,
  getSolvedTaskIds,
  resolveDbUrl,
} from '@/lib/queries/session';
import { LabRunner } from '@/components/lab/lab-runner';

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);

  const userId = await getUserId();
  if (!userId) notFound();

  const row = await getSessionForUser(sessionId, userId);
  if (!row) notFound();

  const solvedTaskIds = await getSolvedTaskIds(sessionId);

  return (
    <LabRunner
      sessionId={sessionId}
      title={row.taskSet.title}
      tasks={row.taskSet.tasks}
      dbUrl={resolveDbUrl(row.taskSet)}
      solvedTaskIds={solvedTaskIds}
    />
  );
}
