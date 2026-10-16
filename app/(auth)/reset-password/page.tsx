"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please request a new link.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <p className="mt-6 text-center text-sm text-foreground-muted">
        This reset link is missing its token.{" "}
        <Link href="/forgot-password" className="text-gold hover:underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-6 text-center text-sm text-foreground-muted">
        Your password has been updated and all other sessions were signed out.{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-5">
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16">
      <h1 className="font-serif text-3xl text-foreground">Choose a new password</h1>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
