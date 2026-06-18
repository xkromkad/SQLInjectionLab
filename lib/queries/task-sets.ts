import { eq, or, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskSets } from '@/lib/db/schema';

export type TaskSetSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  isBuiltin: boolean;
  taskCount: number;
};

/** Built-in/public sets plus sets owned by the user. */
export async function getVisibleTaskSets(
  userId: string
): Promise<TaskSetSummary[]> {
  const rows = await db
    .select({
      id: taskSets.id,
      slug: taskSets.slug,
      title: taskSets.title,
      description: taskSets.description,
      language: taskSets.language,
      isBuiltin: taskSets.isBuiltin,
      tasks: taskSets.tasks,
      ownerId: taskSets.ownerId,
    })
    .from(taskSets)
    .where(or(eq(taskSets.isBuiltin, true), eq(taskSets.ownerId, userId)))
    .orderBy(desc(taskSets.isBuiltin), desc(taskSets.createdAt));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    language: r.language,
    isBuiltin: r.isBuiltin,
    taskCount: Array.isArray(r.tasks) ? r.tasks.length : 0,
  }));
}
