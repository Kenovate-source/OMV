// lib/server/http.ts
//
// Route-handler wrapper that turns ANY thrown error into a JSON response.
//
// WHY THIS EXISTS: before this, the auth routes had no try/catch. When the
// database was unconfigured/unreachable (or its tables didn't exist) the
// route threw, Next returned a bare HTTP 500 with no JSON body, and the UI
// fell back to the generic "Sign-in failed." / "Registration failed." —
// indistinguishable from a wrong password and impossible to diagnose.
//
// Behaviour:
//   - The CUSTOMER sees a short, non-technical message and a stable
//     `code`. No stack traces, table names, hosts or env-var names.
//   - The OPERATOR gets the real cause in the server log (Vercel →
//     Project → Logs), tagged with the route `scope`, and in /api/health.

import { NextRequest, NextResponse } from "next/server";
import { ConfigError } from "./errors";

type Handler = (request: NextRequest) => Promise<NextResponse>;

// Prisma error codes that mean "the database isn't usable", as opposed to
// "this request was bad".
const DB_UNAVAILABLE = new Set(["P1000", "P1001", "P1002", "P1003", "P1008", "P1017"]);
const SCHEMA_MISSING = new Set(["P2021", "P2022"]);

export type ServerFailureKind =
  | "not_configured"
  | "database_unavailable"
  | "schema_not_applied"
  | "duplicate"
  | "unknown";

export function classifyError(err: unknown): ServerFailureKind {
  if (err instanceof ConfigError) return "not_configured";
  const e = err as { name?: string; code?: string } | null;
  if (e?.name === "PrismaClientInitializationError") return "database_unavailable";
  if (e?.code && DB_UNAVAILABLE.has(e.code)) return "database_unavailable";
  if (e?.code && SCHEMA_MISSING.has(e.code)) return "schema_not_applied";
  if (e?.code === "P2002") return "duplicate";
  return "unknown";
}

export function serverError(scope: string, err: unknown): NextResponse {
  const kind = classifyError(err);
  const e = err as { name?: string; code?: string; message?: string } | null;
  // Operator-facing detail: logged, never returned to the browser.
  console.error(
    `[omv:${scope}] ${kind} — ${e?.name ?? "Error"}${e?.code ? ` (${e.code})` : ""}: ${String(e?.message ?? err).slice(0, 400)}`
  );

  if (kind === "duplicate") {
    return NextResponse.json(
      { error: "An account with this email already exists.", code: "duplicate" },
      { status: 409 }
    );
  }
  if (kind === "not_configured" || kind === "database_unavailable" || kind === "schema_not_applied") {
    return NextResponse.json(
      {
        error: "Our account service is temporarily unavailable. Please try again shortly.",
        code: "service_unavailable",
      },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { error: "Something went wrong on our side. Please try again.", code: "server_error" },
    { status: 500 }
  );
}

/** Wrap a handler so a thrown error becomes a JSON response (or a custom fallback). */
export function guarded(scope: string, handler: Handler, fallback?: () => NextResponse): Handler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (err) {
      if (fallback) {
        console.error(`[omv:${scope}] degraded — ${classifyError(err)}: ${String((err as Error)?.message ?? err).slice(0, 300)}`);
        return fallback();
      }
      return serverError(scope, err);
    }
  };
}
