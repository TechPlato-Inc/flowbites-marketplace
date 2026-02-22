"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal, Input } from "@/design-system";
import {
  Search,
  AlertCircle,
  Flag,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

interface Report {
  _id: string;
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
  targetInfo?: {
    title?: string;
    name?: string;
  };
  reason: string;
  description?: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
  };
  status: "pending" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  adminNote?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportStats {
  total: number;
  pending: number;
  byReason: Record<string, number>;
}

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  inappropriate_content: "Inappropriate Content",
  copyright_violation: "Copyright Violation",
  misleading: "Misleading Information",
  scam: "Scam or Fraud",
  harassment: "Harassment",
  other: "Other",
};

const targetTypeLabels: Record<string, string> = {
  template: "Template",
  review: "Review",
  creator: "Creator",
  user: "User",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Resolve/Dismiss modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | null>(
    null,
  );
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "20");
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const { data } = await api.get(`/reports/admin?${params.toString()}`);
      if (pageNum === 1) {
        setReports(data.data.reports);
      } else {
        setReports((prev) => [...prev, ...data.data.reports]);
      }
      setHasMore(data.data.pagination?.hasMore || false);
      setError(null);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/reports/admin/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => {
    fetchReports(1);
    fetchStats();
  }, [statusFilter, priorityFilter]);

  const handleAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      setActionLoading(true);
      const endpoint =
        actionType === "resolve"
          ? `/reports/admin/${selectedReport._id}/resolve`
          : `/reports/admin/${selectedReport._id}/dismiss`;

      await api.post(endpoint, {
        adminNote: adminNote.trim() || undefined,
        actionTaken: actionType === "resolve" ? "content_reviewed" : undefined,
      });

      fetchReports(1);
      fetchStats();
      setActionModalOpen(false);
      setSelectedReport(null);
      setActionType(null);
      setAdminNote("");
    } catch (err) {
      setError(`Failed to ${actionType} report`);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (report: Report, action: "resolve" | "dismiss") => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNote("");
    setActionModalOpen(true);
  };

  if (loading && reports.length === 0) {
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
          Failed to load reports
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={() => fetchReports(1)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Total Reports</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Spam</p>
            <p className="text-2xl font-bold text-neutral-700">
              {stats.byReason?.spam || 0}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Copyright</p>
            <p className="text-2xl font-bold text-neutral-700">
              {stats.byReason?.copyright_violation || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
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
        </select>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Flag size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No reports found
          </h3>
          <p className="text-sm text-neutral-500">All caught up!</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-2">Target</div>
            <div className="col-span-2">Reason</div>
            <div className="col-span-2">Reporter</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Actions</div>
          </div>

          <div className="divide-y divide-neutral-100">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-4 md:py-4 md:px-5 hover:bg-neutral-50 transition-colors"
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Target */}
                  <div className="md:col-span-2 mb-2 md:mb-0">
                    <Badge variant="neutral" size="sm">
                      {targetTypeLabels[report.targetType]}
                    </Badge>
                    <p className="text-sm text-neutral-700 truncate mt-1">
                      {report.targetInfo?.title ||
                        report.targetInfo?.name ||
                        report.targetId.slice(-8)}
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-2 mb-2 md:mb-0">
                    <p className="text-sm text-neutral-700">
                      {reasonLabels[report.reason] || report.reason}
                    </p>
                    {report.description && (
                      <p className="text-xs text-neutral-400 truncate">
                        {report.description}
                      </p>
                    )}
                  </div>

                  {/* Reporter */}
                  <div className="md:col-span-2 mb-2 md:mb-0">
                    <p className="text-sm text-neutral-700">
                      {report.reporter.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {report.reporter.email}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1 mb-2 md:mb-0">
                    <Badge
                      variant={
                        report.status === "pending"
                          ? "warning"
                          : report.status === "resolved"
                            ? "success"
                            : "neutral"
                      }
                      size="sm"
                    >
                      {report.status}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 mb-2 md:mb-0">
                    <p className="text-sm text-neutral-500">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex gap-2">
                    {report.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<CheckCircle size={14} />}
                          onClick={() => openActionModal(report, "resolve")}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<XCircle size={14} />}
                          onClick={() => openActionModal(report, "dismiss")}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchReports(page + 1)}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setActionModalOpen(false);
            setSelectedReport(null);
            setActionType(null);
            setAdminNote("");
          }
        }}
        title={actionType === "resolve" ? "Resolve Report" : "Dismiss Report"}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            {actionType === "resolve"
              ? "This will mark the report as resolved. Please add a note explaining the action taken."
              : "This will dismiss the report. Please add a note explaining why."}
          </p>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Admin Note <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setActionModalOpen(false);
                setSelectedReport(null);
                setActionType(null);
                setAdminNote("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              isLoading={actionLoading}
              variant={actionType === "dismiss" ? "ghost" : "primary"}
            >
              {actionType === "resolve" ? "Resolve" : "Dismiss"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
