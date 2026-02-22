import { api } from "@/lib/api/client";

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  }[];
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  relatedTemplate?: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  relatedOrder?: {
    _id: string;
    orderNumber: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments?: {
    url: string;
    type: "image" | "file";
    name: string;
  }[];
  readBy: string[];
  createdAt: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get("/conversations");
  return data.data.conversations;
}

export async function getConversation(conversationId: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  const { data } = await api.get(`/conversations/${conversationId}`);
  return data.data;
}

export async function createConversation(
  recipientId: string,
  initialMessage: string,
  options?: {
    relatedTemplateId?: string;
    relatedOrderId?: string;
  },
): Promise<Conversation> {
  const { data } = await api.post("/conversations", {
    recipientId,
    initialMessage,
    ...options,
  });
  return data.data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: File[],
): Promise<Message> {
  // If there are attachments, use FormData
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append("content", content);
    attachments.forEach((file) => formData.append("attachments", file));

    const { data } = await api.post(
      `/conversations/${conversationId}/messages`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.data;
  }

  const { data } = await api.post(`/conversations/${conversationId}/messages`, {
    content,
  });
  return data.data;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await api.patch(`/conversations/${conversationId}/read`);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get("/conversations/unread-count");
  return data.data.count;
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  await api.delete(`/conversations/${conversationId}`);
}
