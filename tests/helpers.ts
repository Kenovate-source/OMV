import { NextRequest } from "next/server";
import { randomBytes } from "crypto";

let ipCounter = 0;

// Every request gets a distinct fake client IP so the in-memory rate
// limiter (keyed by IP) never couples unrelated tests together. The
// dedicated rate-limit test deliberately reuses one IP.
export function freshIp(): string {
  ipCounter += 1;
  return `10.99.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
}

export function uniqueEmail(prefix = "user"): string {
  return `${prefix}-${randomBytes(6).toString("hex")}@example.test`;
}

export function jsonRequest(
  url: string,
  opts: { method?: string; body?: unknown; cookies?: Record<string, string>; ip?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": opts.ip ?? freshIp(),
    "user-agent": "vitest",
  };
  if (opts.cookies) {
    headers.cookie = Object.entries(opts.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
  return new NextRequest(`http://localhost:3000${url}`, {
    method: opts.method ?? "POST",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

export function cookieFrom(res: Response & { cookies?: { get(n: string): { value: string } | undefined } }, name: string) {
  return res.cookies?.get(name)?.value;
}
