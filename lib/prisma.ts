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

/**
 * Exécute une requête Prisma ; en cas d’échec (DB vide, lente, indisponible)
 * renvoie le fallback au lieu de faire planter la page / le process Node.
 */
export async function safeQuery<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[veote] prisma ${label} failed`, error);
    return fallback;
  }
}
