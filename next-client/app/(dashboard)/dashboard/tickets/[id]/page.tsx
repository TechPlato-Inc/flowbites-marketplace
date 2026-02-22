import type { Metadata } from "next";
import { TicketDetail } from "@/modules/tickets/components/TicketDetail";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TicketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Ticket #${id.slice(-6)} — Flowbites`,
    description: "View ticket details and conversation.",
    robots: { index: false, follow: false },
  };
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;
  return <TicketDetail ticketId={id} />;
}
