import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    mkcert(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
  build: {
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

          // Radix UI component library
          "radix-ui": [
            "@radix-ui/react-accessible-icon",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],

          // Form validation and schema
          form: ["zod", "@tanstack/react-form"],

          // Styling and class utilities
          styling: ["class-variance-authority", "tailwind-merge", "clsx"],

          // State management
          state: ["jotai"],

          // UI and interaction
          icons: ["lucide-react"],
          "command-ui": ["cmdk"],
          "number-input": ["react-number-format"],
          "phone-input": ["react-phone-number-input"],

          // Network and API
          network: ["axios"],
        },
      },
    },
  },
});
