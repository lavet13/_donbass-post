import { PrismaClient } from "@/lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log({ databaseUrl: process.env.DATABASE_URL });
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["info", "query", "warn", "error"]
      : undefined,
  errorFormat: "pretty",
});
