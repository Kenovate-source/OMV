"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [rememberMe, setRememberMe] = useState(true);
  const { loginWithEmail, loginWithPhone, isLoading } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    if (method === "email") {
      await loginWithEmail(String(formData.get("email") ?? ""), password, rememberMe);
    } else {
      await loginWithPhone(String(formData.get("phone") ?? ""), password, rememberMe);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16">
      <Image src="/brand/logo-transparent.png" alt="" width={64} height={64} />
      <h1 className="mt-6 font-serif text-3xl text-foreground">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-foreground-muted">
        Sign in to manage your family profiles, wishlist and orders.
      </p>

      <div
        role="tablist"
        aria-label="Sign-in method"
        className="mt-8 flex w-full rounded-full border border-border bg-surface p-1"
      >
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={method === m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors ${
              method === m
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-5">
        {method === "email" ? (
          <Input label="Email address" name="email" type="email" autoComplete="email" required />
        ) : (
          <Input label="Phone number" name="phone" type="tel" autoComplete="tel" required />
        )}
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-foreground-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-gold hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-foreground-muted">
        New to OMV?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}
