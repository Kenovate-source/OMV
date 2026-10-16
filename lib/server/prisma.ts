// lib/server/prisma.ts
//
// Standard Next.js singleton pattern: in dev, hot-reloading would
// otherwise create a new PrismaClient (and a new DB connection pool) on
// every file change, eventually exhausting Postgres connections. In
// production (serverless), each cold-started function instance gets its
// own client, which is correct and expected.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
