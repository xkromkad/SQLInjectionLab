import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

type DbUser = typeof users.$inferSelect;

/**
 * Sessions are JWTs, so a token stays valid even if its `user` row disappears
 * (e.g. the database was reset or the account deleted). `stale` distinguishes
 * that from a plain anonymous visitor, which needs a forced sign-out rather
 * than another trip to the login page.
 */
export type AuthState =
  | { status: 'anonymous' }
  | { status: 'stale' }
  | { status: 'ok'; user: DbUser };

export async function getAuthState(): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'anonymous' };

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return row ? { status: 'ok', user: row } : { status: 'stale' };
}

/** The full DB user row for the current session, or null if not signed in. */
export async function getDbUser() {
  const state = await getAuthState();
  return state.status === 'ok' ? state.user : null;
}

/** The current user's id, or null. */
export async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
