import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load Next.js env files so `drizzle-kit` CLI sees DATABASE_URL.
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
