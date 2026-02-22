"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button, Badge } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import {
  getConversation,
  sendMessage,
  markAsRead,
  type Conversation,
  type Message,
} from "../services/messages.service";
import {
  ArrowLeft,
  Send,
  Paperclip,
  AlertCircle,
  Package,
  MoreVertical,
  Phone,
  CheckCheck,
  Clock,
} from "lucide-react";

interface MessageThreadProps {
  conversationId: string;
}

function formatMessageTime(date: string): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageDate(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const isToday = now.toDateString() === then.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    then.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return then.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const data = await getConversation(conversationId);
      setConversation(data.conversation);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();

    // Mark as read when opening
    markAsRead(conversationId).catch(() => {});

    // Poll for new messages
    const interval = setInterval(fetchConversation, 10000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await sendMessage(conversationId, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      inputRef.current?.focus();
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherParticipant = conversation?.participants.find(
    (p) => p._id !== user?._id,
  );

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>,
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          {error || "Conversation not found"}
        </h3>
        <Button
          onClick={() => router.push("/dashboard/messages")}
          className="mt-4"
        >
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => router.push("/dashboard/messages")}
          >
            Back
          </Button>

          <div className="flex items-center gap-3 ml-2">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                {otherParticipant?.name.charAt(0) || "?"}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-neutral-900">
                {otherParticipant?.name}
              </h3>
              <p className="text-xs text-neutral-500 capitalize">
                {otherParticipant?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Related Item */}
        {(conversation.relatedTemplate || conversation.relatedOrder) && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg">
            <Package size={14} className="text-neutral-400" />
            <span className="text-sm text-neutral-600 truncate max-w-[200px]">
              {conversation.relatedTemplate?.title ||
                `Order #${conversation.relatedOrder?.orderNumber}`}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-neutral-50">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center justify-center">
              <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                {date}
              </span>
            </div>

            {dateMessages.map((message, index) => {
              const isOwn = message.senderId._id === user?._id;
              const showAvatar =
                index === 0 ||
                dateMessages[index - 1].senderId._id !== message.senderId._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className="shrink-0">
                        {message.senderId.avatar ? (
                          <img
                            src={message.senderId.avatar}
                            alt={message.senderId.name}
                            className="w-8 h-8 rounded-full object-cover bg-neutral-100"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isOwn
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {message.senderId.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" /> // Spacer
                    )}

                    {/* Message bubble */}
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? "bg-primary-500 text-white rounded-br-md"
                          : "bg-white border border-neutral-200 text-neutral-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          isOwn ? "text-primary-100" : "text-neutral-400"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwn &&
                          (message.readBy.length > 1 ? (
                            <CheckCheck
                              size={12}
                              className="text-primary-200"
                            />
                          ) : (
                            <CheckCheck size={12} />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-end gap-2">
          <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none max-h-32"
              style={{ minHeight: "44px" }}
            />
          </div>

          <Button
            onClick={handleSend}
            isLoading={sending}
            disabled={!newMessage.trim()}
            leftIcon={<Send size={18} />}
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-neutral-400 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
