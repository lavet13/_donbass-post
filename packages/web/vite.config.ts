import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_GITHUB_PAGES === "true" ? "/_donbass-post/" : "/user",
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    minify: "esbuild",
    cssMinify: "lightningcss",
    // https://vite.dev/config/build-options.html#build-rollupoptions
    rollupOptions: {
      input: "./index.html",
      output: {
        // https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: {
          // Core react
          "react-core": ["react", "react-dom"],

          // Tanstack ecosystem (data fetching, routing)
          "tanstack-query": [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
            "@lukemorales/query-key-factory",
          ],
          "tanstack-router": [
            "@tanstack/react-router",
            "@tanstack/react-router-devtools",
          ],

          // UI components
          UI: [
            "@radix-ui/themes",
            "vaul",
            "react-resizable-panels",
            "@radix-ui/react-navigation-menu",
          ],

          // Form validation and schema
          form: [
            "zod",
            "@tanstack/react-form",
            "@tanstack/react-form-devtools",
          ],

          devtools: ["@tanstack/react-devtools"],

          // Styling and class utilities
          styling: ["class-variance-authority", "tailwind-merge", "clsx"],

          // State management
          state: ["jotai"],

          animation: ["motion"],

          // UI and interaction
          icons: ["lucide-react"],
          "command-ui": ["cmdk"],
          "number-input": ["react-number-format"],
          "phone-input": ["react-phone-number-input"],

          misc: [
            "react-device-detect",
            "immer",
            "@tanem/react-nprogress",
            "sonner",
            "date-fns",
            "@date-fns/tz",
          ],

          // Network and API
          network: ["axios"],

          // Browser utilities
          JWT: ["js-cookie", "jose"],

          ymaps3: ["ymap3-components"],
        },
      },
    },
  },
});
