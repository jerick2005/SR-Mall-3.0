import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

// Export type constants for SQLite compatibility
export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://postgres:admin123@localhost:5435/srmalldb",
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
