import { env } from "@/env";
import { PrismaClient } from "@/lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log:
    env.NODE_ENV === "development"
      ? ["info", "query", "warn", "error"]
      : undefined,
  errorFormat: "pretty",
});
