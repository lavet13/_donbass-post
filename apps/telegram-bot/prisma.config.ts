import { getEnv } from "./src/env";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
    seed: "tsx src/prisma/seed.ts",
  },
  datasource: {
    url: getEnv("DATABASE_URL"),
  },
});
