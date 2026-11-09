import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client for Next.js (dev HMR-safe).
 * Requires DATABASE_URL at runtime / for db push & seed.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
