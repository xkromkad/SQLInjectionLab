import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { labSessions, taskSets, submissions } from '@/lib/db/schema';

// One built-in SQLite file per language: same schema, translated row data.
const BUILTIN_DB_URLS: Record<string, string> = {
  sk: '/db/SQLInjectionLab.db',
  en: '/db/SQLInjectionLab.en.db',
};
const DEFAULT_BUILTIN_DB_URL = BUILTIN_DB_URLS.sk;

/** A lab session joined with its task set, scoped to the owning user. */
export async function getSessionForUser(sessionId: string, userId: string) {
  const [row] = await db
    .select({ session: labSessions, taskSet: taskSets })
    .from(labSessions)
    .innerJoin(taskSets, eq(labSessions.taskSetId, taskSets.id))
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** Distinct task ids the user has already solved in this session. */
export async function getSolvedTaskIds(sessionId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ taskId: submissions.taskId })
    .from(submissions)
    .where(
      and(eq(submissions.sessionId, sessionId), eq(submissions.isCorrect, true))
    );
  return rows.map((r) => r.taskId);
}

/**
 * Resolves which SQLite file the lab should run against: an uploaded blob for
 * custom sets, otherwise the built-in database matching the set's language.
 */
export function resolveDbUrl(taskSet: {
  dbSource: string;
  dbBlobUrl: string | null;
  language: string;
}): string {
  if (taskSet.dbSource === 'blob' && taskSet.dbBlobUrl) return taskSet.dbBlobUrl;
  return BUILTIN_DB_URLS[taskSet.language] ?? DEFAULT_BUILTIN_DB_URL;
}

export type UserSession = {
  id: string;
  status: 'in_progress' | 'completed';
  solvedCount: number;
  totalCount: number;
  startedAt: Date;
  title: string;
};

/** All of a user's lab sessions, newest first, with their task set title. */
export async function getUserSessions(userId: string): Promise<UserSession[]> {
  const rows = await db
    .select({
      id: labSessions.id,
      status: labSessions.status,
      solvedCount: labSessions.solvedCount,
      totalCount: labSessions.totalCount,
      startedAt: labSessions.startedAt,
      title: taskSets.title,
    })
    .from(labSessions)
    .innerJoin(taskSets, eq(labSessions.taskSetId, taskSets.id))
    .where(eq(labSessions.userId, userId))
    .orderBy(desc(labSessions.startedAt));
  return rows;
}

/** Full submission history for a session, newest first. */
export async function getSubmissions(sessionId: string) {
  return db
    .select()
    .from(submissions)
    .where(eq(submissions.sessionId, sessionId))
    .orderBy(desc(submissions.createdAt));
}
