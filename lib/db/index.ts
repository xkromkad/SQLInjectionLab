import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// neon() only parses the connection string; it does not open a connection
// until a query runs, so a placeholder keeps `next build` from crashing when
// DATABASE_URL is absent. Queries will fail clearly at runtime if it is unset.
const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/db';

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
