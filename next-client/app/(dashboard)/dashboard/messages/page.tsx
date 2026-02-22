import type { Metadata } from "next";
import { ConversationList } from "@/modules/messages/components/ConversationList";

export const metadata: Metadata = {
  title: "Messages — Flowbites",
  description: "Your conversations with buyers and creators.",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return <ConversationList />;
}
