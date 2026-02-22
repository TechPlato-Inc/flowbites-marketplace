"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/design-system";

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        const msg =
          err?.response?.data?.error ||
          "Verification failed. The link may have expired.";
        setMessage(msg);
      });
  }, [token]);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          {status === "loading"
            ? "Verifying..."
            : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {status === "loading" && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        )}

        {status === "success" && (
          <>
            <p className="text-neutral-600 mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full" size="lg">
                Continue to Sign In
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-neutral-600 mb-6">{message}</p>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
