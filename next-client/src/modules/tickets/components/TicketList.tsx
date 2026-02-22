"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import {
  Plus,
  MessageSquare,
  Clock,
  AlertCircle,
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
import { CreateTicketModal } from "./CreateTicketModal";

interface TicketItem {
  _id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  updatedAt: string;
  createdAt: string;
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

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-neutral-500" },
  medium: { label: "Medium", color: "text-info" },
  high: { label: "High", color: "text-warning" },
  urgent: { label: "Urgent", color: "text-error" },
};

const categoryLabels: Record<string, string> = {
  billing: "Billing",
  technical: "Technical",
  account: "Account",
  template: "Template",
  refund: "Refund",
  other: "Other",
};

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return then.toLocaleDateString();
}

function useTicketNavItems(): {
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
        isActive: true,
        section: "Support",
      },
    ],
  };
}

export function TicketList() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchTickets = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tickets/my?page=${pageNum}&limit=20`);
      if (pageNum === 1) {
        setTickets(data.data?.tickets ?? []);
      } else {
        setTickets((prev) => [...prev, ...(data.data?.tickets ?? [])]);
      }
      const pag = data.data?.pagination;
      setHasMore(pag ? Number(pag.page) < pag.pages : false);
      setError(null);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/tickets/${ticketId}`);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchTickets(1);
  };

  const {
    navItems,
    title: sidebarTitle,
    subtitle: sidebarSubtitle,
  } = useTicketNavItems();

  if (loading && tickets.length === 0) {
    return (
      <DashboardSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
      >
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm">Loading tickets...</span>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <DashboardSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
      >
        <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            Failed to load tickets
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button onClick={() => fetchTickets(1)}>Try Again</Button>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar
      title="My Dashboard"
      subtitle="Your templates & orders"
      navItems={navItems}
      headerActions={
        <Button
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Ticket
        </Button>
      }
    >
      <div className="space-y-6">
        <h2 className="text-xl font-display font-bold text-neutral-900">
          Support Tickets
        </h2>

        {tickets.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <MessageSquare
              size={48}
              className="text-neutral-300 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              No tickets yet
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Need help? Create a ticket and our team will assist you.
            </p>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First Ticket
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {tickets.map((ticket, index) => {
              const status = statusConfig[ticket.status];
              const priority = priorityConfig[ticket.priority];
              return (
                <button
                  key={ticket._id}
                  onClick={() => handleTicketClick(ticket._id)}
                  className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
                    index > 0 ? "border-t border-neutral-100" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {ticket.subject}
                        </h3>
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">
                          {categoryLabels[ticket.category] || ticket.category}
                        </span>
                        <span className={priority?.color || "text-neutral-500"}>
                          {priority
                            ? `${priority.label} Priority`
                            : ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimeAgo(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setPage((p) => p + 1);
                fetchTickets(page + 1);
              }}
              isLoading={loading}
            >
              Load More
            </Button>
          </div>
        )}

        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </DashboardSidebar>
  );
}
