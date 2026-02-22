import type { Metadata } from "next";
import { TicketList } from "@/modules/tickets/components/TicketList";

export const metadata: Metadata = {
  title: "Support Tickets — Flowbites",
  description:
    "View and manage your support tickets. Get help with billing, technical issues, and more.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Support Tickets — Flowbites",
    description:
      "View and manage your support tickets. Get help with billing, technical issues, and more.",
  },
};

export default function TicketsPage() {
  return <TicketList />;
}
