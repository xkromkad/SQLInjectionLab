/**
 * Seeds the built-in Slovak task set from lib/seed/builtin-tasks.json.
 * Run with: npm run db:seed   (requires DATABASE_URL in .env.local or .env)
 */
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

import { eq } from 'drizzle-orm';
import { taskListSchema } from '../schemas/task-set';
import builtinTasks from '../seed/builtin-tasks.json';

const BUILTIN_SLUG = 'builtin-sk';

async function main() {
  // Import after env is loaded so the Neon client gets the real DATABASE_URL.
  const { db } = await import('./index');
  const { taskSets } = await import('./schema');

  const tasks = taskListSchema.parse(builtinTasks);

  const values = {
    slug: BUILTIN_SLUG,
    title: 'SQL Injection Lab — základné úlohy',
    description: 'Pôvodná sada 13 úloh SQL injection v slovenčine.',
    language: 'sk',
    visibility: 'public' as const,
    isBuiltin: true,
    dbSource: 'builtin' as const,
    tasks,
    updatedAt: new Date(),
  };

  await db
    .insert(taskSets)
    .values(values)
    .onConflictDoUpdate({ target: taskSets.slug, set: values });

  const [row] = await db
    .select({ id: taskSets.id })
    .from(taskSets)
    .where(eq(taskSets.slug, BUILTIN_SLUG))
    .limit(1);

  console.log(
    `✓ Seeded built-in task set "${BUILTIN_SLUG}" (${tasks.length} tasks) → ${row?.id}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
