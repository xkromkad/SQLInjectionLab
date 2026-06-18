'use server';

import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/** Records the current user's acceptance of the Terms of Use. */
export async function acceptTerms() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  await db
    .update(users)
    .set({ termsAcceptedAt: new Date() })
    .where(eq(users.id, session.user.id));
}
