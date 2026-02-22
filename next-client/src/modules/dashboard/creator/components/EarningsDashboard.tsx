"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/design-system";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface MonthlyBreakdown {
  month: string;
  earnings: number;
  orderCount: number;
}

interface TopTemplate {
  templateId: string;
  title: string;
  earnings: number;
  sales: number;
}

interface EarningsSummary {
  totalEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  monthlyBreakdown: MonthlyBreakdown[];
  topTemplates: TopTemplate[];
}

export function EarningsDashboard() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/earnings/summary");
      setSummary(data.data);
    } catch (err) {
      setError("Failed to load earnings data");
      showToast("Failed to load earnings data", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate month-over-month change
  const momChange =
    summary && summary.lastMonthEarnings > 0
      ? ((summary.thisMonthEarnings - summary.lastMonthEarnings) /
          summary.lastMonthEarnings) *
        100
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse h-64" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <p className="text-neutral-600 mb-4">
          {error || "Failed to load earnings"}
        </p>
        <Button onClick={fetchSummary}>Retry</Button>
      </div>
    );
  }

  const maxEarnings = Math.max(
    ...summary.monthlyBreakdown.map((m) => m.earnings),
    1,
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">
                {formatCurrency(summary.totalEarnings)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <p className="text-emerald-100 text-sm mt-2">Lifetime earnings</p>
        </div>

        {/* This Month */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(summary.thisMonthEarnings)}
              </p>
              {momChange !== 0 && (
                <div
                  className={`flex items-center gap-1 mt-1 text-sm ${momChange > 0 ? "text-success" : "text-error"}`}
                >
                  {momChange > 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  <span>{Math.abs(momChange).toFixed(1)}% vs last month</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-primary-500" />
            </div>
          </div>
        </div>

        {/* Top Template */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-neutral-500 text-sm mb-1">Top Template</p>
              {summary.topTemplates.length > 0 ? (
                <>
                  <p className="text-lg font-bold text-neutral-900 truncate">
                    {summary.topTemplates[0].title}
                  </p>
                  <p className="text-success font-medium">
                    {formatCurrency(summary.topTemplates[0].earnings)}
                  </p>
                </>
              ) : (
                <p className="text-neutral-400">No sales yet</p>
              )}
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Monthly Earnings
          </h3>
          <Badge variant="info" size="sm">
            <TrendingUp size={12} className="mr-1" />
            Last 12 Months
          </Badge>
        </div>

        {summary.monthlyBreakdown.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              No earnings data
            </h3>
            <p className="text-sm text-neutral-500">
              Start selling templates to see your earnings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {summary.monthlyBreakdown.map((month) => {
              const percentage = (month.earnings / maxEarnings) * 100;
              return (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-neutral-500">
                    {formatMonth(month.month)}
                  </div>
                  <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-lg transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <p className="font-semibold text-neutral-900">
                      {formatCurrency(month.earnings)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {month.orderCount} sales
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Performing Templates */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Top Performing Templates
        </h3>

        {summary.topTemplates.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              No sales yet
            </h3>
            <p className="text-sm text-neutral-500">
              Template sales will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.topTemplates.map((template, index) => (
              <div
                key={template.templateId}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {template.title}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {template.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    {formatCurrency(template.earnings)}
                  </p>
                  <p className="text-xs text-neutral-400">earned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
