import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/mysql/schema.prisma",
  migrations: {
    path: "src/prisma/mysql/migrations",
  },
  datasource: {
    url: env("MYSQL_DATABASE_URL"),
    shadowDatabaseUrl: env("MYSQL_SHADOW_DATABASE_URL")
  },
});
