import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL is not set in the environment variables!");
    // In production, we MUST have a connection string for the Edge adapter.
    // Throwing a clear error is better than Prisma's confusing edge runtime error.
  } else {
    try {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (err) {
      console.warn("Failed to initialize PrismaPg adapter, falling back to default:", err);
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

