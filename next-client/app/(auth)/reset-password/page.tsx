import type { Metadata } from "next";
import { ResetPasswordForm } from "@/modules/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
