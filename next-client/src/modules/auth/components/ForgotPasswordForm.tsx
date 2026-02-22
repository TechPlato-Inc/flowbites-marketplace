"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Button, Input } from "@/design-system";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-neutral-600">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            password reset link.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-neutral-600 mb-6">
            The link will expire in 1 hour. Check your spam folder if you
            don&apos;t see it.
          </p>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-neutral-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          {error && (
            <div className="text-sm text-error bg-error-light p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={loading}
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
