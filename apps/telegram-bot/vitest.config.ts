import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same mapping as tsconfig's "paths" ("@/*" → "./src/*"). Vitest doesn't
    // read tsconfig paths; tsx and tsup do, which is why only tests broke.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
