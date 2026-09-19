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

const getPrisma = () => {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
  }
  return globalThis.prismaGlobal as any;
};

// Use an Advanced Double Proxy to lazily instantiate the Prisma Client.
// NextAuth PrismaAdapter destructures properties (e.g. `const { user } = prisma`)
// at global module initialization time. A single proxy would trigger client creation
// too early. This double proxy delays creation until a method is ACTUALLY invoked.
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    if (prop === "then" || typeof prop === "symbol") return undefined;

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
