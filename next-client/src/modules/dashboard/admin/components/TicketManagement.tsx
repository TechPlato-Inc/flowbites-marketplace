"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import {
  Search,
  AlertCircle,
  UserCheck,
  CheckCircle,
  MessageSquare,
  Clock,
} from "lucide-react";

interface Ticket {
  _id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  };
  lastUpdated: string;
  messageCount: number;
  createdAt: string;
}

interface TicketStats {
  total: number;
  open: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
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
  waiting_on_user: { label: "Waiting on User", variant: "info" },
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
  general: "General",
  billing: "Billing",
  technical: "Technical",
  account: "Account",
  report: "Report",
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

export function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchTickets = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "20");
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const { data } = await api.get(`/tickets/admin/all?${params.toString()}`);
      if (pageNum === 1) {
        setTickets(data.data.tickets);
      } else {
        setTickets((prev) => [...prev, ...data.data.tickets]);
      }
      setHasMore(data.data.pagination?.hasMore || false);
      setError(null);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/tickets/admin/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => {
    fetchTickets(1);
    fetchStats();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleAssign = async (ticketId: string) => {
    try {
      await api.post(`/tickets/admin/${ticketId}/assign`, {});
      fetchTickets(1);
      fetchStats();
    } catch (err) {
      setError("Failed to assign ticket");
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await api.post(`/tickets/admin/${ticketId}/resolve`);
      fetchTickets(1);
      fetchStats();
    } catch (err) {
      setError("Failed to resolve ticket");
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userId.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load tickets
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={() => fetchTickets(1)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Total Tickets</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Open</p>
            <p className="text-2xl font-bold text-success">{stats.open}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-warning">
              {stats.byStatus?.in_progress || 0}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Waiting on User</p>
            <p className="text-2xl font-bold text-info">
              {stats.byStatus?.waiting_on_user || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_on_user">Waiting on User</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <MessageSquare size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No tickets found
          </h3>
          <p className="text-sm text-neutral-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-3">Subject</div>
            <div className="col-span-2">User</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-2">Last Updated</div>
            <div className="col-span-1">Actions</div>
          </div>

          <div className="divide-y divide-neutral-100">
            {filteredTickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const priority = priorityConfig[ticket.priority];
              const isAssigned = !!ticket.assignedTo;
              const canResolve =
                ticket.status === "open" ||
                ticket.status === "in_progress" ||
                ticket.status === "waiting_on_user";

              return (
                <div
                  key={ticket._id}
                  className="p-4 md:py-4 md:px-5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Subject */}
                    <div className="md:col-span-3 mb-2 md:mb-0">
                      <p className="font-medium text-neutral-900 line-clamp-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-neutral-500 md:hidden">
                        {categoryLabels[ticket.category]} • {priority.label}
                      </p>
                    </div>

                    {/* User */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <p className="text-sm text-neutral-700">
                        {ticket.userId.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {ticket.userId.email}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1 mb-2 md:mb-0">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Priority */}
                    <div className="md:col-span-1 mb-2 md:mb-0">
                      <span className={`text-sm ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>

                    {/* Assigned To */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      {isAssigned ? (
                        <span className="text-sm text-neutral-700">
                          {ticket.assignedTo?.name}
                        </span>
                      ) : (
                        <span className="text-sm text-neutral-400 italic">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Last Updated */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <span className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock size={14} />
                        {formatTimeAgo(ticket.lastUpdated)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex gap-2">
                      {!isAssigned && ticket.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(ticket._id)}
                          leftIcon={<UserCheck size={14} />}
                        >
                          Assign
                        </Button>
                      )}
                      {isAssigned && canResolve && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(ticket._id)}
                          leftIcon={<CheckCircle size={14} />}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchTickets(page + 1)}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
