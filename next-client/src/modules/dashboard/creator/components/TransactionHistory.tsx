"use client";

import { useEffect, useState } from "react";
import { Button, Badge } from "@/design-system";
import {
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface EarningsTransaction {
  _id: string;
  orderNumber: string;
  templateTitle: string;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const fetchTransactions = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/earnings/transactions?page=${page}&limit=20`,
      );
      setTransactions(data.data.transactions || []);
      setPagination(data.data.pagination);
    } catch (err) {
      setError("Failed to load transactions");
      showToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchTransactions(newPage);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Order Number",
      "Template",
      "Amount",
      "Platform Fee",
      "Payout",
      "Status",
      "Date",
    ];
    const rows = transactions.map((t) => [
      t.orderNumber,
      t.templateTitle,
      t.amount,
      t.platformFee,
      t.creatorPayout,
      t.status,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast("Transactions exported", "success");
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <Loader2
          size={32}
          className="text-primary-500 animate-spin mx-auto mb-3"
        />
        <p className="text-neutral-500">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">{error}</p>
        <Button onClick={() => fetchTransactions(1)}>Retry</Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <Receipt size={48} className="text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          No transactions yet
        </h3>
        <p className="text-sm text-neutral-500">
          Your transaction history will appear here once you start making sales
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          Transaction History
        </h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Order
              </th>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Template
              </th>
              <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Amount
              </th>
              <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Platform Fee
              </th>
              <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Your Payout
              </th>
              <th className="text-center text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <tr
                key={transaction._id}
                className={idx > 0 ? "border-t border-neutral-100" : ""}
              >
                <td className="px-4 py-3">
                  <code className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">
                    {transaction.orderNumber}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-neutral-900 truncate max-w-[200px]">
                    {transaction.templateTitle}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-neutral-600">
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-neutral-500">
                    -{formatCurrency(transaction.platformFee)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-success">
                    {formatCurrency(transaction.creatorPayout)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    size="sm"
                    variant={
                      transaction.status === "completed"
                        ? "success"
                        : transaction.status === "pending"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-neutral-500">
                    {formatDate(transaction.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-neutral-200">
          <span className="text-sm text-neutral-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeft size={14} />}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              Prev
            </Button>
            <span className="text-sm text-neutral-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
