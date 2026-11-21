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
      R2_ACCOUNT_ID: bindings.secret(),
      R2_ACCESS_KEY_ID: bindings.secret(),
      R2_SECRET_ACCESS_KEY: bindings.secret(),
      R2_BUCKET_NAME: bindings.text(
        process.env.R2_BUCKET_NAME ?? "sqrock-academy",
      ),
      R2_PUBLIC_URL: bindings.text(process.env.R2_PUBLIC_URL ?? ""),
      RAZORPAY_MODE: bindings.text(process.env.RAZORPAY_MODE ?? "test"),
      RAZORPAY_TEST_KEY_ID: bindings.secret(),
      RAZORPAY_TEST_KEY_SECRET: bindings.secret(),
      RAZORPAY_LIVE_KEY_ID: bindings.secret(),
      RAZORPAY_LIVE_KEY_SECRET: bindings.secret(),
      DATABASE_URL: bindings.secret(),
      BETTER_AUTH_SECRET: bindings.secret(),
    },
  }),
});
