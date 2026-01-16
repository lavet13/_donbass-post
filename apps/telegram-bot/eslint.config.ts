import { node } from "@donbass-post/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", ".tanstack", ".git", "public"]),
  ...node(),
]);
