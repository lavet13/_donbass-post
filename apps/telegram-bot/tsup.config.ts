import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  // Two entry points:
  // - server.ts → dist/server.js (main app entrypoint)
  // - seed.ts   → dist/seed.js  (run directly in production via node)
  entry: ["src/server.ts", "src/prisma/seed.ts"],
  format: ["esm"],
  target: "node18",
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: !options.watch && "terser",
}));
