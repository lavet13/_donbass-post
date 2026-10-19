import { react } from "@donbass-post/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  // dist-ssr: the prerender's Node build (vite build --ssr), generated like dist
  globalIgnores(["dist", "dist-ssr", "node_modules", ".tanstack", ".git", "public"]),
  ...react(),
  {
    // build scripts run in Node, not the browser
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
]);
