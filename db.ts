import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { envValue } from "@/lib/runtime-env";

const rawConnectionString = envValue<string>("DATABASE_URL");

/**
 * `localhost` can resolve to ::1 inside some runtimes, which fails against a
 * Postgres server that only accepts IPv4. Prefer 127.0.0.1 locally.
 */
const connectionString = rawConnectionString?.replace(
  /\/\/localhost(?=[:/])/,
  "//127.0.0.1",
);

/**
 * Connection string is provided through the environment (`.env` locally,
 * Worker secrets/vars in production). The fallback keeps the app renderable
 * (demo content) instead of crashing when the database is not configured.
 */
export const hasDatabase = Boolean(connectionString);

const pool = new Pool({
  connectionString:
    connectionString ?? "postgres://sqrock:sqrock@127.0.0.1:5432/sqrock",
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle({ client: pool });
