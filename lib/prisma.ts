import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Please set it in Cloudflare Environment Variables.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>;
} & typeof global;

// Use a Proxy to lazily instantiate the Prisma Client ONLY when a query is made.
// This ensures that process.env.DATABASE_URL is evaluated inside the request context
// (after OpenNext has polyfilled it), rather than at global module initialization time.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = createPrismaClient();
    }
    const realPrisma = globalThis.prismaGlobal as any;
    
    // If the accessed property is a function, bind it to the real Prisma instance
    if (typeof realPrisma[prop] === 'function') {
      return realPrisma[prop].bind(realPrisma);
    }
    
    return realPrisma[prop];
  }
});

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
