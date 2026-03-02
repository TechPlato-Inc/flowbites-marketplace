import type { Metadata } from "next";
import { AffiliateDashboard } from "@/modules/dashboard/affiliate/components/AffiliateDashboard";

export const metadata: Metadata = {
  title: "Affiliate Dashboard",
  robots: { index: false, follow: false },
};

export default function AffiliateDashboardPage() {
  return <AffiliateDashboard />;
}
