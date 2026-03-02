"use client";

import { useState, useEffect } from "react";
import { Button, Badge } from "@/design-system";
import { getReferralHistory } from "../services/affiliates.service";
import type { ReferralConversion } from "@/types";
import {
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

const DATE_RANGES = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "", label: "All Time" },
];

export function ReferralHistory() {
  const [referrals, setReferrals] = useState<ReferralConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalReferrals: 0,
  });

  // Filters
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("");

  const loadReferrals = async () => {
    try {
      setLoading(true);
      setError("");

      const filters: Parameters<typeof getReferralHistory>[0] = {
        page,
        limit: 10,
      };

      if (status) filters.status = status;

      if (dateRange) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateRange));
        filters.startDate = startDate.toISOString();
        filters.endDate = endDate.toISOString();
      }

      const data = await getReferralHistory(filters);
      setReferrals(data.referrals);
      setTotalPages(data.pagination.pages);
      setSummary(data.summary);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load referrals"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, [page, status, dateRange]);

  const handleExport = () => {
    // Export to CSV
    const csvContent = [
      ["Date", "Customer", "Order Total", "Commission", "Status"].join(","),
      ...referrals.map((r) =>
        [
          new Date(r.createdAt).toLocaleDateString(),
          typeof r.buyerId === "object" ? r.buyerId.name : "Unknown",
          r.orderTotal,
          r.commissionAmount,
          r.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referrals-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500 mb-1">Total Earnings</p>
          <p className="text-xl font-bold text-neutral-900">
            {formatCurrency(summary.totalEarnings)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-600">
            {formatCurrency(summary.pendingEarnings)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500 mb-1">Paid</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(summary.paidEarnings)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-500 mb-1">Total Referrals</p>
          <p className="text-xl font-bold text-neutral-900">
            {summary.totalReferrals}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white border border-neutral-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-neutral-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-neutral-400" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              {DATE_RANGES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={16} />}
          onClick={handleExport}
          disabled={referrals.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error-light border border-error/20 rounded-lg p-4 text-error-dark">
          {error}
          <button
            onClick={loadReferrals}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : referrals.length > 0 ? (
        <>
          {/* Referrals Table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                    <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Order Total
                    </th>
                    <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Commission
                    </th>
                    <th className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {referrals.map((referral) => (
                    <tr
                      key={referral._id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                            {typeof referral.buyerId === "object"
                              ? referral.buyerId.name?.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span className="font-medium text-neutral-900">
                            {typeof referral.buyerId === "object"
                              ? referral.buyerId.name
                              : "Unknown User"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ShoppingCart
                            size={14}
                            className="text-neutral-400"
                          />
                          {formatCurrency(referral.orderTotal)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(referral.commissionAmount)}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1">
                          ({referral.commissionRate}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            referral.status === "paid"
                              ? "success"
                              : referral.status === "pending"
                                ? "warning"
                                : referral.status === "refunded"
                                  ? "error"
                                  : "info"
                          }
                          size="sm"
                        >
                          {referral.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <DollarSign size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            No referrals yet
          </h3>
          <p className="text-sm text-neutral-500">
            Share your referral link to start earning commissions
          </p>
        </div>
      )}
    </div>
  );
}
