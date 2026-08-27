import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/** The full DB user row for the current session, or null if not signed in. */
export async function getDbUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  return row ?? null;
}

/** The current user's id, or null. */
export async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
