# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SQL Injection Lab — an educational platform that teaches SQL injection by running tasks against a **real SQLite database executed entirely in the browser via sql.js (WebAssembly)**. Originally a FIIT STU (BVI) Quasar SPA; now a production **Next.js (App Router)** app. The training is gated behind login; everything else (landing, legal, about) is public.

> The previous Quasar/Vue implementation is preserved on the `legacy-quasar` git branch.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix base; components in `components/ui`)
- **next-intl** for i18n — `sk` (default, no URL prefix) + `en` (`/en`)
- **Auth.js (NextAuth v5)** — Google + GitHub OAuth only (no passwords)
- **Drizzle ORM** + **Neon** Postgres (`@neondatabase/serverless`)
- **sql.js** (browser, loaded from `/public`) for the lab engine
- **Zod** validation · **Vercel Blob** for uploaded SQLite files
- Deployed on **Vercel**

## Commands

```bash
npm run dev          # next dev (http://localhost:3000)
npm run build        # next build (Turbopack)
npm run lint         # eslint
npm run db:generate  # generate a Drizzle migration from schema changes
npm run db:push      # push schema to the database (dev)
npm run db:migrate   # run generated migrations
npm run db:seed      # seed the built-in Slovak task set (needs DATABASE_URL)
npm run db:studio    # drizzle studio
```

Requires `.env.local` (see `.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_GITHUB_ID/SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`. There are **no tests**.

## Architecture — the lab loop

The lab is intentionally vulnerable; the vulnerability is the lesson. Key pieces:

1. **Tasks are data**, validated by Zod (`lib/schemas/task-set.ts`). Each task has a `query` template with `{placeholder}` tokens, `inputs`, an optional `checkQuery`, and a `correctAnswer` (semicolon-separated expected values). The built-in 13-task Slovak set lives in `lib/seed/builtin-tasks.json` and is seeded into Postgres by `lib/db/seed.ts`.
2. **The engine** (`lib/sql/engine.ts`, client-only) loads sql.js from `/public/sql-wasm.js` + `/public/sql-wasm.wasm`, substitutes input values into `{placeholder}` tokens with **naive string replacement** (the injection surface — do NOT "fix" with parameter binding), and runs the query.
   - `runTask()` creates a **fresh DB instance per submission from a COPY of the bytes** (`new SQL.Database(new Uint8Array(dbBytes))`) — sql.js mutates the buffer it's given, so a destructive injection (DROP/UPDATE) would otherwise corrupt the cached bytes and break later tasks. The `checkQuery` runs on the same instance after the main query, so it sees mutations within one submission.
3. **Validation** (`checkSolved` in `engine.ts`): solved if (a) the main query threw and `correctAnswer === 'error'`, or (b) `checkQuery` (or the main results) contains every semicolon-separated expected value.
4. **The UI** (`components/lab/*`): `LabRunner` loads the DB once, renders `TaskCard`s, and on each run persists a submission via `POST /api/sessions/[id]/submissions` (best-effort; the lab still works locally if it fails).
5. **Persistence**: a **session** (`lab_sessions`) is one run over a task set; every attempt is a **submission**. The submissions route recomputes solved count and marks the session completed.

## Routing & directory map

- `app/[locale]/` — locale segment is the html root (there is no `app/layout.tsx`).
  - `(app)/` route group = **auth-gated** (layout checks session + Terms acceptance): `dashboard`, `task-sets`, `task-sets/import`, `lab/[sessionId]`, `lab/[sessionId]/attempts`.
  - Public: `page.tsx` (landing), `about`, `legal/[doc]` (terms/privacy/cookies/disclaimer), `login`, `welcome` (Terms gate).
- `app/api/` — `auth/[...nextauth]`, `sessions/[id]/submissions`, `task-sets/upload` (Vercel Blob).
- `app/actions/` — server actions (`terms.ts`, `sessions.ts`, `task-sets.ts`).
- `auth.ts` (Node, with Drizzle adapter) + `auth.config.ts` (edge-safe, shared with `proxy.ts`).
- `proxy.ts` — composes next-intl middleware + auth gating (Next 16 renamed `middleware` → `proxy`).
- `lib/db/` (schema, client, seed), `lib/queries/`, `lib/sql/engine.ts`, `lib/schemas/`, `i18n/`, `messages/{sk,en}.json`.

## Conventions

- Path alias `@/*` → repo root. Use locale-aware nav from `@/i18n/navigation` (`Link`, `useRouter`, `redirect`), not `next/link` / `next/navigation`.
- Auth: JWT session strategy (so the proxy stays edge-safe) while the Drizzle adapter still persists users/accounts. `session.user.id` is augmented in `types/next-auth.d.ts`.
- Adding a lab exercise = edit `lib/seed/builtin-tasks.json` and re-run `npm run db:seed`, or import a custom set via the UI. No code changes needed.
- All UI strings live in `messages/{sk,en}.json`. Lab task content is **Slovak**. Add new keys to both files.
- shadcn/ui components support `asChild` (Radix). Prettier: single quotes.
- The DB the lab runs against: built-in sets use `/public/db/SQLInjectionLab.db`; custom sets use their uploaded Vercel Blob URL (`resolveDbUrl` in `lib/queries/session.ts`).
