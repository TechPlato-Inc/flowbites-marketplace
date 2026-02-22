import type { Metadata } from "next";
import { SettingsPage } from "@/modules/settings/components/SettingsPage";

export const metadata: Metadata = {
  title: "Settings — Flowbites",
  description: "Manage your account settings, security, and email preferences.",
  robots: { index: false, follow: false },
};

export default function SettingsPageRoute() {
  return <SettingsPage />;
}
