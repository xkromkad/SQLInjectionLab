'use server';

import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { labSessions, taskSets } from '@/lib/db/schema';

/** Creates a new lab session for the current user over a given task set. */
export async function createSession(
  taskSetId: string
): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const [ts] = await db
    .select({
      id: taskSets.id,
      tasks: taskSets.tasks,
      ownerId: taskSets.ownerId,
      isBuiltin: taskSets.isBuiltin,
      visibility: taskSets.visibility,
    })
    .from(taskSets)
    .where(eq(taskSets.id, taskSetId))
    .limit(1);

  if (!ts) throw new Error('Task set not found');

  const allowed =
    ts.isBuiltin || ts.visibility === 'public' || ts.ownerId === userId;
  if (!allowed) throw new Error('Forbidden');

  const [created] = await db
    .insert(labSessions)
    .values({
      userId,
      taskSetId,
      totalCount: Array.isArray(ts.tasks) ? ts.tasks.length : 0,
      solvedCount: 0,
      status: 'in_progress',
    })
    .returning({ id: labSessions.id });

  return { id: created.id };
}
