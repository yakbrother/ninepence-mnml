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
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separate Sanity Studio components
            if (id.includes('@sanity/astro') || id.includes('@sanity/vision')) {
              return 'sanity-studio';
            }
            // Separate React components
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Separate styled-components
            if (id.includes('styled-components')) {
              return 'styled-components';
            }
            // Separate DOMPurify
            if (id.includes('dompurify')) {
              return 'dompurify';
            }
            // Separate video player (large component)
            if (id.includes('VideoPlayer')) {
              return 'video-player';
            }
            // Default vendor chunk for other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  },
});
