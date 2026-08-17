"use client";

import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await register(
      String(formData.get("fullName") ?? ""),
      String(formData.get("email") ?? ""),
      String(formData.get("password") ?? "")
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16">
      <Image src="/brand/logo-transparent.png" alt="" width={64} height={64} />
      <h1 className="mt-6 font-serif text-3xl text-foreground">Create your account</h1>
      <p className="mt-2 text-center text-sm text-foreground-muted">
        Every Outfit. Every Occasion. Every Family.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-5">
        <Input label="Full name" name="fullName" autoComplete="name" required />
        <Input label="Email address" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          required
        />
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
