/**
 * Runtime environment access that works in both:
 * - Cloudflare Workers (`nodejs_compat` mirrors vars/secrets onto `process.env`)
 * - Node.js local dev (loaded from `.env` by `vite.config.ts` / scripts)
 *
 * IMPORTANT: do not use a top-level `await import("cloudflare:workers")` here.
 * Cloudflare Workers cannot finish evaluating a lazily-imported module that
 * contains a top-level await. Every route segment that touches the database
 * (`/dashboard`, `/admin`, auth, ...) imports this module, so the Worker would
 * hang forever and Cloudflare would return "Error 1101: Worker threw
 * exception / code had hung".
 */
type RuntimeEnv = Record<string, unknown>;

const processEnv: RuntimeEnv =
  typeof process !== "undefined" && process.env
    ? (process.env as unknown as RuntimeEnv)
    : {};

export const runtimeEnv = processEnv;

export function envValue<T = unknown>(key: string): T | undefined {
  return processEnv[key] as T | undefined;
}
