"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal, Input } from "@/design-system";
import type { Refund } from "@/modules/dashboard/buyer/services/refunds.service";
import { formatDate } from "@/lib/utils/format";
import { showToast } from "@/design-system/Toast";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

export function RefundManagement() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("requested");

  // Approve/Reject modal states
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/refunds/admin", {
        params: { status: statusFilter !== "all" ? statusFilter : undefined },
      });
      setRefunds(data.data.refunds || data.data);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter]);

  const openActionModal = (refund: Refund, action: "approve" | "reject") => {
    setSelectedRefund(refund);
    setActionType(action);
    setAdminNote("");
    setActionModalOpen(true);
  };

  const closeActionModal = () => {
    setActionModalOpen(false);
    setSelectedRefund(null);
    setActionType(null);
    setAdminNote("");
  };

  const handleAction = async () => {
    if (!selectedRefund || !actionType) return;

    setProcessing(true);
    try {
      const endpoint =
        actionType === "approve"
          ? `/refunds/admin/${selectedRefund._id}/approve`
          : `/refunds/admin/${selectedRefund._id}/reject`;

      await api.post(endpoint, actionType === "reject" ? { adminNote } : {});

      // Refresh the list
      fetchRefunds();
      showToast(
        `Refund ${actionType === "approve" ? "approved" : "rejected"} successfully`,
        "success",
      );
      closeActionModal();
    } catch (error) {
      console.error(`Failed to ${actionType} refund:`, error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "warning" | "success" | "error" | "info" | "neutral"
    > = {
      requested: "warning",
      approved: "success",
      rejected: "error",
      processed: "info",
    };
    return (
      <Badge variant={variants[status] || "neutral"} size="sm">
        {status}
      </Badge>
    );
  };

  const statusTabs = [
    { key: "requested", label: "Requested" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "processed", label: "Processed" },
    { key: "all", label: "All" },
  ];

  if (loading && refunds.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-900">
            Refund Management
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Review and process customer refund requests
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === tab.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Refunds Table */}
      {refunds.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Shield size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No refund requests
          </h3>
          <p className="text-sm text-neutral-500">
            There are no refunds with status &quot;{statusFilter}&quot; at this
            time.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {refunds.map((refund) => (
                  <tr key={refund._id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-neutral-700">
                        {refund.orderId.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-700">
                        {refund.buyerId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900">
                        ${refund.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-600 max-w-xs truncate">
                        {refund.reason}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-500">
                        {formatDate(refund.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(refund.status)}
                    </td>
                    <td className="px-4 py-3">
                      {refund.status === "requested" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<CheckCircle size={14} />}
                            onClick={() => openActionModal(refund, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<XCircle size={14} />}
                            onClick={() => openActionModal(refund, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {refund.adminNote && (
                        <span className="text-xs text-neutral-500">
                          Note: {refund.adminNote}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={closeActionModal}
        title={actionType === "approve" ? "Approve Refund" : "Reject Refund"}
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeActionModal}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              isLoading={processing}
              variant={actionType === "reject" ? "danger" : "primary"}
            >
              {actionType === "approve" ? "Approve Refund" : "Reject Refund"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            {actionType === "approve"
              ? `Are you sure you want to approve this refund of $${selectedRefund?.amount.toFixed(2)}?`
              : "Please provide a reason for rejecting this refund request."}
          </p>

          {actionType === "reject" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Admin Note *
              </label>
              <Input
                placeholder="Reason for rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
