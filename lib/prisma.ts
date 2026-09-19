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

    return new Proxy(function () {} as any, {
      get(subTarget, subProp) {
        if (subProp === "then" || typeof subProp === "symbol") return undefined;
        const realPrisma = getPrisma();
        const model = realPrisma[prop];
        if (model === undefined) return undefined;
        if (typeof model[subProp] === "function") {
          return model[subProp].bind(model);
        }
        return model[subProp];
      },
      apply(subTarget, thisArg, argArray) {
        const realPrisma = getPrisma();
        const func = realPrisma[prop];
        return func.apply(realPrisma, argArray);
      },
    });
  },
});

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
