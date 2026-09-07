/**
 * Seeds the built-in task sets:
 *   - builtin-sk from lib/seed/builtin-tasks.json    (Slovak)
 *   - builtin-en from lib/seed/builtin-tasks.en.json (English)
 *
 * Run with: npm run db:seed   (requires DATABASE_URL in .env.local or .env)
 * Upserts by slug, so it is safe to re-run after editing either file.
 */
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

import { inArray } from 'drizzle-orm';
import { taskListSchema } from '../schemas/task-set';
import builtinTasksSk from '../seed/builtin-tasks.json';
import builtinTasksEn from '../seed/builtin-tasks.en.json';

const SETS = [
  {
    slug: 'builtin-sk',
    language: 'sk',
    title: 'SQL Injection Lab — základné úlohy',
    description: 'Pôvodná sada 13 úloh SQL injection v slovenčine.',
    tasks: builtinTasksSk,
  },
  {
    slug: 'builtin-en',
    language: 'en',
    title: 'SQL Injection Lab — Core Tasks',
    description:
      'The original 13-task SQL injection set, in English, against an English copy of the lab database.',
    tasks: builtinTasksEn,
  },
];

async function main() {
  // Import after env is loaded so the Neon client gets the real DATABASE_URL.
  const { db } = await import('./index');
  const { taskSets } = await import('./schema');

  for (const set of SETS) {
    const values = {
      slug: set.slug,
      title: set.title,
      description: set.description,
      language: set.language,
      visibility: 'public' as const,
      isBuiltin: true,
      dbSource: 'builtin' as const,
      tasks: taskListSchema.parse(set.tasks),
      updatedAt: new Date(),
    };

    await db
      .insert(taskSets)
      .values(values)
      .onConflictDoUpdate({ target: taskSets.slug, set: values });
  }

  const rows = await db
    .select({
      id: taskSets.id,
      slug: taskSets.slug,
      language: taskSets.language,
      tasks: taskSets.tasks,
    })
    .from(taskSets)
    .where(
      inArray(
        taskSets.slug,
        SETS.map((s) => s.slug)
      )
    );

  for (const row of rows) {
    console.log(
      `✓ Seeded built-in task set "${row.slug}" [${row.language}] (${row.tasks.length} tasks) → ${row.id}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
