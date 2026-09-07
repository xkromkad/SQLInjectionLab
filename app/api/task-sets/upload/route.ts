import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/auth';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

const MAX_DB_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Issues client-upload tokens for user SQLite databases stored in Vercel Blob.
 * Requires a signed-in user and enforces a size/type limit.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Uploads are 5 MB each and rare; 10/hour is generous for a real user.
  const limit = rateLimit(`upload:${session.user.id}`, 10, 60 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'application/octet-stream',
          'application/x-sqlite3',
          'application/vnd.sqlite3',
          'application/db',
        ],
        maximumSizeInBytes: MAX_DB_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // No-op: the blob URL is returned to the client and saved with the set.
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
