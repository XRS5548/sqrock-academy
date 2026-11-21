import "dotenv/config";
import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sqrockacademy",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-18",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BUCKET: bindings.r2({ name: "sqrock-academy" }),
      DATABASE_URL: bindings.secret(),
      BETTER_AUTH_SECRET: bindings.secret(),
      R2_PUBLIC_URL: bindings.text(process.env.R2_PUBLIC_URL ?? ""),
    },
  }),
});
