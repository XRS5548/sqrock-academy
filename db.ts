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

/**
 * Hosted Postgres providers (Neon, Supabase, RDS, ...) require TLS. When the
 * connection string does not say anything about SSL we default to TLS for
 * remote hosts, otherwise `pg` opens a plain-text socket that the server
 * rejects and the request stalls.
 */
function resolveSsl(url: string | undefined): false | { rejectUnauthorized: boolean } {
  if (!url) return false;

  let hostname = "";
  let sslmode: string | null = null;
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    sslmode = parsed.searchParams.get("sslmode");
  } catch {
    return false;
  }

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local");

  if (sslmode === "disable") return false;
  if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
    return { rejectUnauthorized: false };
  }
  if (sslmode === "verify-full") return { rejectUnauthorized: true };

  return isLocal ? false : { rejectUnauthorized: false };
}

/**
 * `pg` pools are cached on `globalThis` so the Cloudflare isolate reuses one
 * pool across requests (and Vite HMR does not leak pools in local dev).
 */
const globalForDb = globalThis as typeof globalThis & {
  __sqrockPool?: Pool;
};

function createPool() {
  return new Pool({
    connectionString:
      connectionString ?? "postgres://sqrock:sqrock@127.0.0.1:5432/sqrock",
    ssl: resolveSsl(connectionString),
    max: 5,
    // Fail fast instead of leaving the Worker request hanging forever.
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 10_000,
    statement_timeout: 10_000,
    keepAlive: true,
  });
}

export const pool = globalForDb.__sqrockPool ?? createPool();
globalForDb.__sqrockPool = pool;

// A pool that emits `error` without a listener crashes the isolate.
pool.on("error", (error) => {
  console.error("[db] idle client error", error);
});

export const db = drizzle({ client: pool });
