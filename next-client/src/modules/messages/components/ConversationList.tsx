"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button, Badge } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import {
  getConversations,
  markAsRead,
  deleteConversation,
  type Conversation,
} from "../services/messages.service";
import {
  MessageSquare,
  Search,
  Trash2,
  AlertCircle,
  Package,
  Clock,
  Plus,
  LayoutDashboard,
  FileText,
  Wrench,
  ClipboardList,
  TrendingUp,
  Wallet,
  Ticket,
  ShoppingBag,
  Heart,
  Users,
} from "lucide-react";
import { NewMessageModal } from "./NewMessageModal";

function useMessagesNavItems(): {
  navItems: NavItem[];
  title: string;
  subtitle: string;
} {
  const { user } = useAuthStore();
  const isCreator = user?.role === "creator";

  if (isCreator) {
    return {
      title: "Creator Studio",
      subtitle: "Manage your templates & services",
      navItems: [
        {
          label: "Overview",
          icon: LayoutDashboard,
          path: "/dashboard/creator",
          section: "main",
        },
        {
          label: "Templates",
          icon: FileText,
          path: "/dashboard/creator",
          section: "Manage",
        },
        {
          label: "Services",
          icon: Wrench,
          path: "/dashboard/creator",
          section: "Manage",
        },
        {
          label: "Orders",
          icon: ClipboardList,
          path: "/dashboard/creator",
          section: "Manage",
        },
        {
          label: "Earnings",
          icon: Wallet,
          path: "/dashboard/creator",
          section: "Insights",
        },
        {
          label: "Analytics",
          icon: TrendingUp,
          path: "/dashboard/creator",
          section: "Insights",
        },
        {
          label: "Support Tickets",
          icon: Ticket,
          path: "/dashboard/tickets",
          section: "Support",
        },
        {
          label: "Messages",
          icon: MessageSquare,
          path: "/dashboard/messages",
          isActive: true,
          section: "Support",
        },
      ],
    };
  }

  return {
    title: "My Dashboard",
    subtitle: "Your templates & orders",
    navItems: [
      {
        label: "Overview",
        icon: LayoutDashboard,
        path: "/dashboard/buyer",
        section: "main",
      },
      {
        label: "Purchased Items",
        icon: FileText,
        path: "/dashboard/buyer",
        section: "Library",
      },
      {
        label: "Order History",
        icon: ShoppingBag,
        path: "/dashboard/buyer",
        section: "Library",
      },
      {
        label: "Wishlist",
        icon: Heart,
        path: "/dashboard/buyer",
        section: "Library",
      },
      {
        label: "Following",
        icon: Users,
        path: "/dashboard/buyer",
        section: "Library",
      },
      {
        label: "Service Orders",
        icon: Wrench,
        path: "/dashboard/buyer",
        section: "Services",
      },
      {
        label: "Support Tickets",
        icon: Ticket,
        path: "/dashboard/tickets",
        section: "Support",
      },
      {
        label: "Messages",
        icon: MessageSquare,
        path: "/dashboard/messages",
        isActive: true,
        section: "Support",
      },
    ],
  };
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
}

function truncateMessage(message: string, maxLength: number = 50): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
}

export function ConversationList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    navItems,
    title: sidebarTitle,
    subtitle: sidebarSubtitle,
  } = useMessagesNavItems();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      // If the backend endpoint doesn't exist yet (404), show empty state
      if (err?.response?.status === 404) {
        setConversations([]);
        setError(null);
      } else {
        setError("Failed to load conversations");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConversationClick = async (conversation: Conversation) => {
    // Mark as read when opening
    if (conversation.unreadCount > 0) {
      try {
        await markAsRead(conversation._id);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversation._id ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch {
        // Silent fail
      }
    }
    router.push(`/dashboard/messages/${conversation._id}`);
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      setDeletingId(conversationId);
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
    } catch {
      alert("Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p._id !== user?._id);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant?.name.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content.toLowerCase().includes(searchLower) ||
      conv.relatedTemplate?.title.toLowerCase().includes(searchLower)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <DashboardSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
      >
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm">
              Loading messages...
            </span>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  if (error) {
    return (
      <DashboardSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
      >
        <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            Failed to load messages
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button onClick={fetchConversations}>Try Again</Button>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar
      title={sidebarTitle}
      subtitle={sidebarSubtitle}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
              Messages
              {totalUnread > 0 && (
                <Badge variant="error" size="sm">
                  {totalUnread} unread
                </Badge>
              )}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Communicate with buyers and creators
            </p>
          </div>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setIsNewMessageOpen(true)}
          >
            New Message
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <MessageSquare
              size={48}
              className="text-neutral-300 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </h3>
            <p className="text-sm text-neutral-500">
              {searchQuery
                ? "Try adjusting your search"
                : "Your conversations with buyers and creators will appear here"}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {filteredConversations.map((conversation, index) => {
              const otherParticipant = conversation.participants.find(
                (p) => p._id !== user?._id,
              );
              const isLast = index === filteredConversations.length - 1;

              return (
                <button
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
                    !isLast ? "border-b border-neutral-100" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {otherParticipant?.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-12 h-12 rounded-full object-cover bg-neutral-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                          {otherParticipant?.name.charAt(0) || "?"}
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conversation.unreadCount > 9
                            ? "9+"
                            : conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-semibold truncate ${
                            conversation.unreadCount > 0
                              ? "text-neutral-900"
                              : "text-neutral-700"
                          }`}
                        >
                          {otherParticipant?.name || "Unknown"}
                        </h3>
                        <span className="text-xs text-neutral-400 shrink-0 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(conversation.updatedAt)}
                        </span>
                      </div>

                      {/* Related Template/Order */}
                      {(conversation.relatedTemplate ||
                        conversation.relatedOrder) && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                          <Package size={12} />
                          <span className="truncate">
                            {conversation.relatedTemplate?.title ||
                              `Order #${conversation.relatedOrder?.orderNumber}`}
                          </span>
                        </div>
                      )}

                      {/* Last Message */}
                      <p
                        className={`text-sm mt-1 truncate ${
                          conversation.unreadCount > 0
                            ? "text-neutral-900 font-medium"
                            : "text-neutral-500"
                        }`}
                      >
                        {conversation.lastMessage ? (
                          <>
                            {conversation.lastMessage.senderId ===
                              user?._id && (
                              <span className="text-neutral-400">You: </span>
                            )}
                            {truncateMessage(conversation.lastMessage.content)}
                          </>
                        ) : (
                          <span className="text-neutral-400 italic">
                            No messages yet
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => handleDelete(e, conversation._id)}
                      disabled={deletingId === conversation._id}
                      className="p-2 text-neutral-400 hover:text-error hover:bg-error-light rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* New Message Modal */}
        <NewMessageModal
          isOpen={isNewMessageOpen}
          onClose={() => setIsNewMessageOpen(false)}
        />
      </div>
    </DashboardSidebar>
  );
}
