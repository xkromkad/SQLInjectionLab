import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  jsonb,
  boolean,
  uuid,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';
import type { TaskDef } from '@/lib/schemas/task-set';

/* ------------------------------------------------------------------ */
/* Auth.js (NextAuth) adapter tables                                   */
/* ------------------------------------------------------------------ */

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  // Set when the user accepts the Terms of Use (educational-use gate).
  termsAcceptedAt: timestamp('terms_accepted_at', { mode: 'date' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

/* ------------------------------------------------------------------ */
/* Application tables                                                   */
/* ------------------------------------------------------------------ */

export const visibilityEnum = pgEnum('visibility', ['private', 'public']);
export const dbSourceEnum = pgEnum('db_source', ['builtin', 'blob']);
export const sessionStatusEnum = pgEnum('session_status', [
  'in_progress',
  'completed',
]);

/**
 * A task set: built-in (ownerId null, isBuiltin true) or user-imported.
 * Tasks are stored as a validated JSONB array; each task carries a stable
 * string `id` used to reference submissions.
 */
export const taskSets = pgTable('task_set', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  language: text('language').default('sk').notNull(),
  visibility: visibilityEnum('visibility').default('private').notNull(),
  tasks: jsonb('tasks').$type<TaskDef[]>().notNull(),
  dbSource: dbSourceEnum('db_source').default('builtin').notNull(),
  // When dbSource === 'blob', the Vercel Blob URL of the uploaded SQLite file.
  dbBlobUrl: text('db_blob_url'),
  isBuiltin: boolean('is_builtin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/** One run of a user over a chosen task set. */
export const labSessions = pgTable(
  'lab_session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taskSetId: uuid('task_set_id')
      .notNull()
      .references(() => taskSets.id, { onDelete: 'cascade' }),
    status: sessionStatusEnum('status').default('in_progress').notNull(),
    solvedCount: integer('solved_count').default(0).notNull(),
    totalCount: integer('total_count').default(0).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (t) => [index('lab_session_user_idx').on(t.userId)]
);

/** Every attempt (the "steps") a user makes within a session. */
export const submissions = pgTable(
  'submission',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => labSessions.id, { onDelete: 'cascade' }),
    taskId: text('task_id').notNull(),
    inputs: jsonb('inputs').$type<Record<string, string>>().notNull(),
    // The fully substituted query that was actually executed in the browser.
    finalQuery: text('final_query').notNull(),
    result: jsonb('result'),
    isCorrect: boolean('is_correct').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('submission_session_idx').on(t.sessionId)]
);

export type User = typeof users.$inferSelect;
export type TaskSet = typeof taskSets.$inferSelect;
export type LabSession = typeof labSessions.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
