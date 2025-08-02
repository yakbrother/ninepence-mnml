// @ts-check
import { defineConfig } from "astro/config";
import sanityIntegration from "@sanity/astro";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { loadEnv } from "vite";
import netlify from "@astrojs/netlify";

const { PUBLIC_SANITY_STUDIO_PROJECT_ID, PUBLIC_SANITY_STUDIO_DATASET } =
  loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

export default defineConfig({
  output: "server",
  integrations: [
    sanityIntegration({
      projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
      dataset: PUBLIC_SANITY_STUDIO_DATASET,
      useCdn: false,
      studioBasePath: "/admin",
    }),
    react(),
    mdx(),
  ],
  adapter: netlify(),
  vite: {
    ssr: {
      external: ["styled-components"],
    },
    optimizeDeps: {
      include: ["styled-components"],
    },
  },
});
