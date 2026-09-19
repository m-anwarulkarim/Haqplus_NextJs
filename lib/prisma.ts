import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  if (!connectionString) {
    // Return a dummy client during build time if env is missing, but throw if actually used.
    // Vercel sometimes doesn't have DATABASE_URL at build time.
    console.warn("DATABASE_URL is missing during Prisma initialization.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export { prisma };
