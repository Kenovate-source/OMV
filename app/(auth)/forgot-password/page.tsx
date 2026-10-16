"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    // The server returns the same message whether or not the email has
    // an account (by design — no enumeration). Only a rate-limit
    // response is distinguishable, and that's about the client, not the
    // account.
    if (res.status === 429) {
      setError("Too many attempts. Please try again shortly.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">Reset your password</h1>
      {submitted ? (
        <p className="mt-6 text-center text-sm text-foreground-muted">
          If an account exists for that email, a password reset link has been
          sent. The link is valid for one hour and can only be used once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-center text-sm text-foreground-muted">
            Enter the email you signed up with and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-5">
            <Input label="Email address" name="email" type="email" autoComplete="email" required />
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        </>
      )}
      <p className="mt-8 text-sm text-foreground-muted">
        <Link href="/login" className="text-gold hover:underline">
          Back to sign in
        </Link>
      </p>
    </section>
  );
}
