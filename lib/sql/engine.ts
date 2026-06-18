import type { Database, SqlJsStatic, QueryExecResult } from 'sql.js';
import type { TaskDef } from '@/lib/schemas/task-set';

// Loaded from /public so sql.js never has to be bundled (its Emscripten UMD
// references node built-ins that break browser bundlers).
const WASM_URL = '/sql-wasm.wasm';
const JS_URL = '/sql-wasm.js';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

/** Loads and caches the sql.js runtime (singleton). */
export async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = (async () => {
      await loadScript(JS_URL);
      const init = (
        window as unknown as {
          initSqlJs: (config?: {
            locateFile?: () => string;
          }) => Promise<SqlJsStatic>;
        }
      ).initSqlJs;
      return init({ locateFile: () => WASM_URL });
    })();
  }
  return sqlJsPromise;
}

const dbBytesCache = new Map<string, Promise<Uint8Array>>();

/** Fetches and caches the raw SQLite bytes for a given URL. */
export function loadDbBytes(url: string): Promise<Uint8Array> {
  let promise = dbBytesCache.get(url);
  if (!promise) {
    promise = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch database: ${url}`);
      return new Uint8Array(await res.arrayBuffer());
    });
    dbBytesCache.set(url, promise);
  }
  return promise;
}

/**
 * Substitutes `{name}` placeholders with raw input values.
 *
 * This is intentionally naive string replacement — it IS the injection
 * surface the lab teaches. Do not "fix" it with parameter binding.
 */
export function substitute(
  query: string,
  inputs: Record<string, string>
): string {
  let result = query;
  for (const [name, value] of Object.entries(inputs)) {
    result = result.split(`{${name}}`).join(value);
  }
  return result;
}

export type RunResult = {
  finalQuery: string;
  results: QueryExecResult[];
  errored: boolean;
  errorMessage?: string;
  isCorrect: boolean;
};

function safeExec(db: Database, sql: string): QueryExecResult[] | undefined {
  try {
    return db.exec(sql);
  } catch {
    return undefined;
  }
}

/**
 * Determines whether a task is solved, mirroring the original checkResult:
 *  - if the main query threw and the expected answer is 'error' → solved
 *  - otherwise run checkQuery (or reuse main results) and verify every
 *    semicolon-separated expected value appears in the result set.
 */
function checkSolved(
  db: Database,
  task: TaskDef,
  inputs: Record<string, string>,
  mainResults: QueryExecResult[],
  errored: boolean
): boolean {
  const expectedRaw = task.correctAnswer.trim();

  if (errored) return expectedRaw === 'error';
  if (expectedRaw === 'error') return false;

  const checkResults = task.checkQuery
    ? safeExec(db, substitute(task.checkQuery, inputs))
    : mainResults;

  if (!checkResults || checkResults.length === 0) return false;

  const expected = expectedRaw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  if (expected.length === 0) return false;

  return checkResults.some((rs) => {
    const flat = rs.values
      .flat()
      .map((v) => (v === null ? '' : String(v)));
    return expected.every((answer) => flat.includes(answer));
  });
}

/**
 * Runs a single task submission against a fresh DB instance (so destructive
 * injections don't persist across submissions) and evaluates correctness.
 * The checkQuery runs on the SAME instance, after the main query, so it sees
 * the effects of mutating injections within this one submission.
 */
export async function runTask(
  dbBytes: Uint8Array,
  task: TaskDef,
  inputs: Record<string, string>
): Promise<RunResult> {
  const SQL = await getSqlJs();
  // sql.js mutates the buffer it's given, so always hand it a fresh copy —
  // otherwise a destructive injection (DROP/UPDATE) would corrupt the cached
  // bytes and break every subsequent task in the session.
  const db = new SQL.Database(new Uint8Array(dbBytes));
  const finalQuery = substitute(task.query, inputs);

  let results: QueryExecResult[] = [];
  let errored = false;
  let errorMessage: string | undefined;

  try {
    results = db.exec(finalQuery);
  } catch (err) {
    errored = true;
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const isCorrect = checkSolved(db, task, inputs, results, errored);
  db.close();

  return { finalQuery, results, errored, errorMessage, isCorrect };
}
