import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/user",
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
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

          // UI components
          "UI": [
            "@radix-ui/react-password-toggle-field",
            "@radix-ui/react-accessible-icon",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-toggle",
            "@radix-ui/react-select",
            "@radix-ui/react-visually-hidden",
            "@radix-ui/react-hover-card",
            "vaul",
            "react-resizable-panels",
          ],

          // Form validation and schema
          form: ["zod", "@tanstack/react-form"],

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

          misc: ["react-device-detect", "immer"],

          // Network and API
          network: ["axios"],

          // Browser utilities
          JWT: ["js-cookie", "jose"],
        },
      },
    },
  },
});
