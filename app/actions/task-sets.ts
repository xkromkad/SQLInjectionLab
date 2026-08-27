'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { taskSets } from '@/lib/db/schema';
import { importTaskSetSchema } from '@/lib/schemas/task-set';
import { uniqueSlug } from '@/lib/slug';

/** Validates and persists a user-imported task set. */
export async function createTaskSet(
  input: unknown,
  dbBlobUrl?: string | null
): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const parsed = importTaskSetSchema.parse(input);

  const [created] = await db
    .insert(taskSets)
    .values({
      ownerId: session.user.id,
      slug: uniqueSlug(parsed.title),
      title: parsed.title,
      description: parsed.description ?? null,
      language: parsed.language,
      visibility: parsed.visibility,
      tasks: parsed.tasks,
      dbSource: dbBlobUrl ? 'blob' : 'builtin',
      dbBlobUrl: dbBlobUrl ?? null,
      isBuiltin: false,
    })
    .returning({ id: taskSets.id });

  return { id: created.id };
}
