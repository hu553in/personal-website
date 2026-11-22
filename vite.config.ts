import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vinext({
      cache: { cdn: { ...staticAssetsAdapter(), options: {} } },
      images: { optimizer: { ...imagesOptimizer(), options: {} } },
      prerender: { routes: "*" },
      react: { compiler: true },
    }),
    cloudflare({
      viteEnvironment: {
        childEnvironments: ["ssr"],
        name: "rsc",
      },
    }),
  ],
  preview: { host: "127.0.0.1", port: 3000, strictPort: true },
  server: { port: 3000 },
});
