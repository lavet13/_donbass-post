import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/server.ts"],
  format: ["cjs"],
  target: "node18",
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: !options.watch && "terser",
  noExternal: [/.*/],
  external: [
    "grammy",
    "@grammyjs/auto-retry",
    "srvx",
  ],
  platform: "node",
  shims: false,
}));
