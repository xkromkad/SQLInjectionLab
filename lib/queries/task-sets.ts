import { and, eq, or, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskSets } from '@/lib/db/schema';
import { routing, type Locale } from '@/i18n/routing';

export type TaskSetSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  isBuiltin: boolean;
  taskCount: number;
};

const selection = {
  id: taskSets.id,
  slug: taskSets.slug,
  title: taskSets.title,
  description: taskSets.description,
  language: taskSets.language,
  isBuiltin: taskSets.isBuiltin,
  tasks: taskSets.tasks,
  ownerId: taskSets.ownerId,
};

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  isBuiltin: boolean;
  tasks: unknown;
};

function toSummary(r: Row): TaskSetSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    language: r.language,
    isBuiltin: r.isBuiltin,
    taskCount: Array.isArray(r.tasks) ? r.tasks.length : 0,
  };
}

/**
 * Built-in sets in the current UI language, plus every set owned by the user
 * (whatever its language). There is one built-in set per locale, so filtering
 * keeps the near-identical sk/en cards from sitting side by side.
 */
export async function getVisibleTaskSets(
  userId: string,
  locale: Locale
): Promise<TaskSetSummary[]> {
  const rows = await db
    .select(selection)
    .from(taskSets)
    .where(
      or(
        and(eq(taskSets.isBuiltin, true), eq(taskSets.language, locale)),
        eq(taskSets.ownerId, userId)
      )
    )
    .orderBy(desc(taskSets.isBuiltin), desc(taskSets.createdAt));

  // A locale with no built-in set of its own falls back to the default one,
  // so the page is never empty just because a translation is missing.
  if (locale !== routing.defaultLocale && !rows.some((r) => r.isBuiltin)) {
    const fallback = await db
      .select(selection)
      .from(taskSets)
      .where(
        and(
          eq(taskSets.isBuiltin, true),
          eq(taskSets.language, routing.defaultLocale)
        )
      )
      .orderBy(desc(taskSets.createdAt));
    return [...fallback, ...rows].map(toSummary);
  }

  return rows.map(toSummary);
}
