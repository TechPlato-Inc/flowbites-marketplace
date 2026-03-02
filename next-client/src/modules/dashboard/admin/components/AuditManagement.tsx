"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Badge } from "@/design-system";
import { Button } from "@/design-system";
import {
  ClipboardList,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";

interface AuditUser {
  _id: string;
  name: string | null;
  email: string | null;
}

interface AuditEntry {
  _id: string;
  action: string;
  userId: AuditUser | null;
  resource: string;
  resourceId: string | null;
  changes: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditStats {
  total: number;
  last24h: number;
  recentActions: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ACTION_COLORS: Record<
  string,
  "success" | "error" | "warning" | "info" | "neutral"
> = {
  "template.approved": "success",
  "template.rejected": "error",
  "template.deleted": "error",
  "creator.approved": "success",
  "creator.rejected": "error",
  "role.changed": "warning",
  "order.refunded": "warning",
  "withdrawal.approved": "info",
  "withdrawal.rejected": "error",
  "withdrawal.completed": "success",
  "report.resolved": "info",
  "ticket.resolved": "success",
};

const RESOURCE_OPTIONS = [
  { value: "", label: "All Resources" },
  { value: "template", label: "Template" },
  { value: "creator", label: "Creator" },
  { value: "order", label: "Order" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "report", label: "Report" },
  { value: "ticket", label: "Ticket" },
  { value: "user", label: "User" },
];

export function AuditManagement() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "25");
      if (actionFilter.trim()) params.append("action", actionFilter.trim());
      if (resourceFilter) params.append("resource", resourceFilter);

      const { data } = await api.get(`/admin/audit?${params.toString()}`);
      setLogs(data.data.logs || []);
      setPagination(data.data.pagination || null);
      setError(null);
    } catch {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/audit/stats");
      setStats(data.data);
    } catch {
      // stats are supplemental — silently fail
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [actionFilter, resourceFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const getActionBadgeVariant = (action: string) =>
    ACTION_COLORS[action] ?? "neutral";

  if (error && logs.length === 0) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load audit logs
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={() => fetchLogs(1)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Total Events</span>
              <Activity size={18} className="text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {stats.total.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Last 24h</span>
              <Activity size={18} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {stats.last24h.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500 mb-1">
                Top Actions (24h)
              </span>
              {Object.entries(stats.recentActions)
                .slice(0, 3)
                .map(([action, count]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-neutral-600 truncate">
                      {action}
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 ml-2">
                      {count}
                    </span>
                  </div>
                ))}
              {Object.keys(stats.recentActions).length === 0 && (
                <span className="text-xs text-neutral-400">
                  No recent actions
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action (e.g. template.approved)"
          className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          {RESOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading && logs.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <ClipboardList size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No audit logs found
          </h3>
          <p className="text-sm text-neutral-500">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-3">Action</div>
            <div className="col-span-2">Resource</div>
            <div className="col-span-3">Admin</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-1" />
          </div>

          <div className="divide-y divide-neutral-100">
            {logs.map((entry) => {
              const isExpanded = expandedId === entry._id;
              const hasChanges = Object.keys(entry.changes).length > 0;
              return (
                <div
                  key={entry._id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <div className="p-4 md:py-3 md:px-5">
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Action */}
                      <div className="md:col-span-3 mb-2 md:mb-0">
                        <Badge
                          variant={getActionBadgeVariant(entry.action)}
                          size="sm"
                        >
                          {entry.action}
                        </Badge>
                      </div>

                      {/* Resource */}
                      <div className="md:col-span-2 mb-2 md:mb-0">
                        <p className="text-sm font-medium text-neutral-700 capitalize">
                          {entry.resource || "—"}
                        </p>
                        {entry.resourceId && (
                          <p className="text-xs text-neutral-400 font-mono truncate">
                            {entry.resourceId.slice(-8)}
                          </p>
                        )}
                      </div>

                      {/* Admin */}
                      <div className="md:col-span-3 mb-2 md:mb-0">
                        {entry.userId ? (
                          <>
                            <p className="text-sm font-medium text-neutral-700">
                              {entry.userId.name || "Unknown"}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {entry.userId.email}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-neutral-400">
                            System
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="md:col-span-3 mb-2 md:mb-0">
                        <p className="text-sm text-neutral-500">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>

                      {/* Expand toggle */}
                      <div className="md:col-span-1 flex justify-end">
                        {hasChanges && (
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : entry._id)
                            }
                            className="text-neutral-400 hover:text-neutral-600 p-1 rounded transition-colors"
                            title="View details"
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && hasChanges && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">
                          Details
                        </p>
                        <div className="bg-neutral-50 rounded-lg p-3 text-xs font-mono text-neutral-700 overflow-auto max-h-40">
                          {JSON.stringify(entry.changes, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {pagination.page} of {pagination.pages} &middot;{" "}
            {pagination.total.toLocaleString()} total
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
