import { env } from "@/env";
import { PrismaClient } from "@/lib/prisma-mysql/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(env.MYSQL_DATABASE_URL);

export const prismaMysql = new PrismaClient({
  adapter,
  log:
    env.NODE_ENV === "development"
      ? ["info", "query", "warn", "error"]
      : undefined,
  errorFormat: "pretty",
});
