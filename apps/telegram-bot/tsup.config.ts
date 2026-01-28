import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node18",
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: !options.watch && "terser",

  // Bundle everything EXCEPT problematic packages
  noExternal: [/.*/],

  // Keep these external because they have dynamic requires or native modules
  external: [
    "dotenv",
    "dotenv-expand",
    // These are fine to keep external too
    "grammy",
    "@grammyjs/auto-retry",
    "srvx",
  ],

  // Handle Node.js built-ins properly
  platform: "node",

  // Don't bundle shims for node builtins
  shims: false,
}));
