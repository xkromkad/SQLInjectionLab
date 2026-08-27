# SQL Injection Lab

An educational platform for learning SQL injection hands-on against a **real SQLite database that runs entirely in your browser** (sql.js / WebAssembly). Training is gated behind login; the landing, about and legal pages are public. Built with Next.js, deployed on Vercel.

> Made by [kromka.it](https://kromka.it). For **educational purposes only** — never use these techniques against systems without explicit authorization.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 + shadcn/ui · next-intl (sk/en) · Auth.js v5 (Google + GitHub) · Drizzle ORM + Neon Postgres · sql.js · Vercel Blob.

## Local setup

1. **Install**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — a [Neon](https://neon.tech) Postgres connection string.
   - `AUTH_SECRET` — `npx auth secret`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — [Google Cloud Console](https://console.cloud.google.com/apis/credentials); redirect URI `http://localhost:3000/api/auth/callback/google`.
   - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — [GitHub Developer settings](https://github.com/settings/developers); callback `http://localhost:3000/api/auth/callback/github`.
   - `BLOB_READ_WRITE_TOKEN` — Vercel Blob store (only needed for custom DB uploads).
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally.

3. **Database**
   ```bash
   npm run db:push     # create tables
   npm run db:seed     # load the built-in 13-task Slovak set
   ```

4. **Run**
   ```bash
   npm run dev         # http://localhost:3000
   ```

## How it works

- **Tasks are data** (`lib/seed/builtin-tasks.json`, validated by Zod). Add exercises by editing that file and re-seeding, or import a custom set in the UI (paste JSON + optionally upload a `.db`).
- **The engine** (`lib/sql/engine.ts`) substitutes user input into `{placeholder}` tokens with naive string replacement — this *is* the intentional vulnerability — and runs it via sql.js in the browser. A fresh DB copy is used per submission so destructive injections don't leak across tasks.
- **Sessions & attempts** are persisted per user in Neon: a session is one run over a task set; every submitted query is logged and the dashboard / attempts pages summarize progress.

## Deploy (Vercel)

1. Import the repo in Vercel.
2. Add all env vars from `.env.example` in **Project Settings → Environment Variables** (use your production `NEXT_PUBLIC_SITE_URL` and add production OAuth redirect URIs).
3. Create a **Vercel Blob** store and link it (provides `BLOB_READ_WRITE_TOKEN`).
4. Apply the schema to your production database once: `npm run db:push` (or `db:migrate` against `DATABASE_URL`), then `npm run db:seed`.
5. Deploy. Auth.js auto-detects the deployment URL (`trustHost: true`).

## Project layout

See `CLAUDE.md` for a full architecture map. The previous Quasar/Vue implementation lives on the `legacy-quasar` branch.

## Scripts

`dev` · `build` · `lint` · `db:generate` · `db:push` · `db:migrate` · `db:seed` · `db:studio`
