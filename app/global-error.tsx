'use client';

import { useEffect } from 'react';
import './globals.css';

/**
 * Last-resort boundary: it replaces the locale layout entirely, so it has no
 * translations available and must render its own <html>/<body>. Text is kept
 * bilingual (sk/en) to match the two locales the app serves.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="sk">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground antialiased">
        <div className="max-w-md text-center">
          <p className="text-6xl font-bold text-primary">500</p>
          <h1 className="mt-4 text-2xl font-semibold">
            Niečo sa pokazilo / Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Skús to prosím znova. / Please try again.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {error.digest}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Skúsiť znova / Try again
            </button>
            {/* A full document load, not client navigation: the router tree is
                what just failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Domov / Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
