import type { Metadata } from "next";
import { VerifyEmail } from "@/modules/auth/components/VerifyEmail";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
