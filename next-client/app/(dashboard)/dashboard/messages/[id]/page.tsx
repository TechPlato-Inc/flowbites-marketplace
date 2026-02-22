import type { Metadata } from "next";
import { MessageThread } from "@/modules/messages/components/MessageThread";

interface MessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MessageDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Conversation — Flowbites",
    description: "View and reply to messages.",
    robots: { index: false, follow: false },
  };
}

export default async function MessageDetailPage({
  params,
}: MessageDetailPageProps) {
  const { id } = await params;
  return <MessageThread conversationId={id} />;
}
