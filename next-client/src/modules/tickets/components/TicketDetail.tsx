"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import {
  ArrowLeft,
  Send,
  Lock,
  AlertCircle,
  MessageSquare,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Heart,
  Users,
  Wrench,
  Ticket,
  TrendingUp,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  message: string;
  isStaffReply: boolean;
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface TicketDetailProps {
  ticketId: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "error" | "info" | "neutral";
  }
> = {
  open: { label: "Open", variant: "success" },
  in_progress: { label: "In Progress", variant: "warning" },
  waiting_on_user: { label: "Waiting on You", variant: "info" },
  resolved: { label: "Resolved", variant: "neutral" },
  closed: { label: "Closed", variant: "neutral" },
};

const categoryLabels: Record<string, string> = {
  billing: "Billing",
  technical: "Technical",
  account: "Account",
  template: "Template",
  refund: "Refund",
  other: "Other",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tickets/${ticketId}`);
      setTicket(data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || sending) return;

    try {
      setSending(true);
      await api.post(`/tickets/${ticketId}/reply`, {
        message: replyMessage.trim(),
      });
      setReplyMessage("");
      fetchTicket();
    } catch (err) {
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (closing) return;
    try {
      setClosing(true);
      await api.post(`/tickets/${ticketId}/close`);
      fetchTicket();
    } catch (err) {
      setError("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  const { user } = useAuthStore();
  const isCreator = user?.role === "creator";

  const sidebarTitle = isCreator ? "Creator Studio" : "My Dashboard";
  const sidebarSubtitle = isCreator
    ? "Manage your templates & services"
    : "Your templates & orders";
  const navItems: NavItem[] = isCreator
    ? [
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
          isActive: true,
          section: "Support",
        },
      ]
    : [
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
          isActive: true,
          section: "Support",
        },
      ];

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
            <span className="text-neutral-500 text-sm">Loading ticket...</span>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
      >
        <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            Failed to load ticket
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard/tickets")}>
            Back to Tickets
          </Button>
        </div>
      </DashboardSidebar>
    );
  }

  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <DashboardSidebar
      title={sidebarTitle}
      subtitle={sidebarSubtitle}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/dashboard/tickets")}
          >
            Back to Tickets
          </Button>
          {!isClosed && (
            <Button
              variant="outline"
              leftIcon={<Lock size={16} />}
              onClick={handleCloseTicket}
              isLoading={closing}
            >
              Close Ticket
            </Button>
          )}
        </div>

        {/* Ticket Info */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h1 className="text-xl font-display font-bold text-neutral-900 mb-3">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs font-medium text-neutral-600">
              {categoryLabels[ticket.category] || ticket.category}
            </span>
            <span className="text-sm text-neutral-400">
              Created {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-neutral-400" />
              Conversation
              <span className="text-xs font-normal text-neutral-400">
                ({(ticket.messages ?? []).length} message
                {(ticket.messages ?? []).length !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>

          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {(ticket.messages ?? []).map((msg) => {
              const isStaff = msg.isStaffReply;
              const senderName =
                typeof msg.senderId === "object" ? msg.senderId.name : "User";
              return (
                <div
                  key={msg._id}
                  className={`flex ${isStaff ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isStaff
                        ? "bg-neutral-50 border border-neutral-100 rounded-tl-sm"
                        : "bg-primary-50 border border-primary-100 rounded-tr-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium text-sm text-neutral-900">
                        {isStaff ? senderName : "You"}
                      </span>
                      {isStaff && (
                        <Badge variant="info" size="sm">
                          Staff
                        </Badge>
                      )}
                      <span className="text-xs text-neutral-400">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          {!isClosed ? (
            <form
              onSubmit={handleSendReply}
              className="border-t border-neutral-100 p-4"
            >
              <div className="flex gap-3">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none text-sm"
                />
                <Button
                  type="submit"
                  leftIcon={<Send size={16} />}
                  isLoading={sending}
                  disabled={!replyMessage.trim()}
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </form>
          ) : (
            <div className="border-t border-neutral-100 p-4 text-center">
              <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
                <Lock size={14} />
                This ticket is closed. Create a new ticket if you need further
                assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardSidebar>
  );
}
