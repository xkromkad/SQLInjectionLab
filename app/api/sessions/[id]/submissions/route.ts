import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { labSessions, submissions } from '@/lib/db/schema';
import { submissionInputSchema } from '@/lib/schemas/submission';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the session exists and belongs to the caller.
  const [lab] = await db
    .select()
    .from(labSessions)
    .where(and(eq(labSessions.id, id), eq(labSessions.userId, session.user.id)))
    .limit(1);
  if (!lab) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = submissionInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const data = parsed.data;

  await db.insert(submissions).values({
    sessionId: id,
    taskId: data.taskId,
    inputs: data.inputs,
    finalQuery: data.finalQuery,
    result: data.result ?? null,
    isCorrect: data.isCorrect,
  });

  // Recompute distinct solved tasks and update session progress/status.
  const [{ count }] = await db
    .select({
      count: sql<number>`count(distinct ${submissions.taskId})`.mapWith(Number),
    })
    .from(submissions)
    .where(
      and(eq(submissions.sessionId, id), eq(submissions.isCorrect, true))
    );

  const solvedCount = count ?? 0;
  const completed = lab.totalCount > 0 && solvedCount >= lab.totalCount;

  await db
    .update(labSessions)
    .set({
      solvedCount,
      status: completed ? 'completed' : 'in_progress',
      completedAt: completed ? new Date() : null,
    })
    .where(eq(labSessions.id, id));

  return NextResponse.json({ ok: true, solvedCount, completed });
}
