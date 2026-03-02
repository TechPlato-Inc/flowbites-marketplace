"use client";

import { useState, useEffect } from "react";
import { Button, Badge } from "@/design-system";
import type { AffiliateDashboard as AffiliateDashboardType } from "@/types";
import { getAffiliateDashboard } from "../services/affiliates.service";
import { ReferralLinkGenerator } from "./ReferralLinkGenerator";
import { ReferralHistory } from "./ReferralHistory";
import { PayoutRequest } from "./PayoutRequest";
import {
  TrendingUp,
  DollarSign,
  MousePointer,
  Users,
  ArrowRight,
  BarChart3,
  Wallet,
  Link2,
  Clock,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

interface AffiliateDashboardProps {
  initialData?: AffiliateDashboardType;
}

export function AffiliateDashboard({ initialData }: AffiliateDashboardProps) {
  const [dashboard, setDashboard] = useState<AffiliateDashboardType | null>(
    initialData || null,
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "payouts"
  >("overview");

  useEffect(() => {
    if (!initialData) {
      loadDashboard();
    }
  }, [initialData]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAffiliateDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded w-24 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <p className="text-error-dark mb-4">{error}</p>
        <Button onClick={loadDashboard} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <BarChart3 size={48} className="text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          No Dashboard Data
        </h3>
        <p className="text-sm text-neutral-500 mb-6">
          Unable to load your affiliate dashboard. Please try again later.
        </p>
        <Button onClick={loadDashboard}>Refresh Dashboard</Button>
      </div>
    );
  }

  const { affiliate, monthly, recentConversions } = dashboard;
  const stats = affiliate.stats;

  const statCards = [
    {
      label: "Total Earnings",
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      trend:
        monthly.earnings > 0 ? `+$${monthly.earnings} this month` : undefined,
    },
    {
      label: "Pending Earnings",
      value: `$${stats.pendingEarnings.toLocaleString()}`,
      icon: Clock,
      color: "amber",
      description: "Waiting for payout",
    },
    {
      label: "Total Clicks",
      value: stats.totalClicks.toLocaleString(),
      icon: MousePointer,
      color: "blue",
      trend: monthly.clicks > 0 ? `+${monthly.clicks} this month` : undefined,
    },
    {
      label: "Total Referrals",
      value: stats.totalReferrals.toLocaleString(),
      icon: Users,
      color: "purple",
      trend:
        monthly.conversions > 0
          ? `+${monthly.conversions} this month`
          : undefined,
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    green: { bg: "bg-green-50", text: "text-green-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
  };

  return (
    <div className="space-y-8">
      {/* Header with Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Affiliate Dashboard
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Track your referrals, earnings, and performance
          </p>
        </div>
        <Badge
          variant={
            affiliate.status === "approved"
              ? "success"
              : affiliate.status === "pending"
                ? "warning"
                : affiliate.status === "suspended"
                  ? "error"
                  : "neutral"
          }
          size="md"
        >
          {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-neutral-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">{stat.label}</span>
              <div
                className={`w-8 h-8 ${colorClasses[stat.color].bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon
                  size={16}
                  className={colorClasses[stat.color].text}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            {(stat.trend || stat.description) && (
              <p className="text-xs text-neutral-400 mt-2">
                {stat.trend || stat.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Referral Link Generator */}
      <ReferralLinkGenerator
        referralCode={affiliate.referralCode}
        commissionRate={affiliate.commissionRate}
        cookieDuration={affiliate.cookieDurationDays}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "history", label: "Referral History", icon: Link2 },
          { id: "payouts", label: "Payouts", icon: Wallet },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Monthly Performance */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">
              This Month&apos;s Performance
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-neutral-900">
                  {monthly.clicks}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Clicks</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-neutral-900">
                  {monthly.conversions}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Conversions</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${monthly.earnings}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Earnings</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {monthly.conversionRate.toFixed(2)}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">Conversion Rate</p>
              </div>
            </div>
          </div>

          {/* Recent Conversions */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">
                Recent Conversions
              </h3>
              <button
                onClick={() => setActiveTab("history")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight size={14} />
              </button>
            </div>

            {recentConversions.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentConversions.slice(0, 5).map((conversion) => (
                  <div
                    key={conversion._id}
                    className="flex items-center gap-4 py-3"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                      {typeof conversion.buyerId === "object"
                        ? conversion.buyerId.name?.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {typeof conversion.buyerId === "object"
                          ? conversion.buyerId.name
                          : "Unknown User"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(conversion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +${conversion.commissionAmount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          conversion.status === "paid"
                            ? "success"
                            : conversion.status === "pending"
                              ? "warning"
                              : conversion.status === "refunded"
                                ? "error"
                                : "info"
                        }
                        size="sm"
                      >
                        {conversion.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                <TrendingUp size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversions yet</p>
                <p className="text-xs mt-1">
                  Share your referral link to start earning
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && <ReferralHistory />}

      {activeTab === "payouts" && <PayoutRequest />}
    </div>
  );
}
