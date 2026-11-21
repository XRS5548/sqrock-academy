import "dotenv/config";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [
      vinext(
        isBuild ? { images: { optimizer: imagesOptimizer() } } : undefined,
      ),
      // Local dev runs on Node so it can reach a local Postgres instance.
      // Production builds still target Cloudflare Workers with bindings.
      ...(isBuild
        ? [
            cloudflare({
              viteEnvironment: {
                name: "rsc",
                childEnvironments: ["ssr"],
              },
            }),
          ]
        : []),
    ],
  };
});
