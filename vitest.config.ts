import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Route-level integration tests talk to a REAL Postgres database via
    // Prisma. Point DATABASE_URL/DIRECT_URL at a THROWAWAY test database
    // (e.g. a dedicated Neon branch) — never Production. See
    // tests/README.md. Tests only create and delete their own uniquely
    // named rows; they never truncate tables.
    testTimeout: 30_000,
    env: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "test-only-access-secret-not-for-production",
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "test-only-refresh-secret-not-for-production",
    },
  },
});
