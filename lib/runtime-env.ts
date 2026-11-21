/**
 * Runtime environment access that works in both:
 * - Cloudflare Workers (`env` from `cloudflare:workers`)
 * - Node.js local dev (`process.env`, loaded from .env)
 *
 * The dynamic import is intentional so Node never tries to resolve the
 * Workers-only module and Cloudflare keeps it external.
 */
type RuntimeEnv = Record<string, unknown>;

let resolvedEnv: RuntimeEnv = {};

try {
  const moduleName = "cloudflare:" + "workers";
  const mod = (await import(/* @vite-ignore */ moduleName)) as {
    env?: RuntimeEnv;
  };
  if (mod.env) resolvedEnv = mod.env;
} catch {
  // Not running on Cloudflare — fall back to process.env.
}

export const runtimeEnv = resolvedEnv;

export function envValue<T = unknown>(key: string): T | undefined {
  const fromRuntime = runtimeEnv[key];
  if (fromRuntime !== undefined) return fromRuntime as T;
  return process.env[key] as T | undefined;
}
