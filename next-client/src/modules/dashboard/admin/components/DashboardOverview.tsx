"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/design-system";
import {
  Users,
  UserCheck,
  Clock,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Star,
  Tag,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface AdminDashboardStats {
  totalUsers: number;
  verifiedCreators: number;
  pendingApplications: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRefunds: number;
  reviewsToModerate: number;
  activeCoupons: number;
  totalFollowers: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  trend?: { value: number; positive: boolean };
}

function StatCard({ title, value, icon, color, href, trend }: StatCardProps) {
  const content = (
    <div
      className={`bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-1 text-sm ${trend.positive ? "text-success" : "text-error"}`}
            >
              <TrendingUp
                size={14}
                className={trend.positive ? "" : "rotate-180"}
              />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/dashboard-stats");
      setStats(data.data);
    } catch (err) {
      setError("Failed to load dashboard stats");
      showToast("Failed to load dashboard stats", "error");
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-primary-500 animate-spin" />
          <span className="text-neutral-500 text-sm">
            Loading dashboard stats...
          </span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">
          {error || "Failed to load stats"}
        </p>
        <Button onClick={fetchStats}>Retry</Button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: <Users size={24} className="text-blue-600" />,
      color: "bg-blue-50",
      href: "/dashboard/admin/creators",
    },
    {
      title: "Verified Creators",
      value: formatNumber(stats.verifiedCreators),
      icon: <UserCheck size={24} className="text-success" />,
      color: "bg-success-light",
      href: "/dashboard/admin/creators",
    },
    {
      title: "Pending Applications",
      value: formatNumber(stats.pendingApplications),
      icon: <Clock size={24} className="text-warning" />,
      color: "bg-warning-light",
      href: "/dashboard/admin",
    },
    {
      title: "Total Orders",
      value: formatNumber(stats.totalOrders),
      icon: <ShoppingBag size={24} className="text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign size={24} className="text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      title: "Pending Refunds",
      value: formatNumber(stats.pendingRefunds),
      icon: <RefreshCw size={24} className="text-orange-600" />,
      color: "bg-orange-50",
      href: "/dashboard/admin?tab=refunds",
    },
    {
      title: "Reviews to Moderate",
      value: formatNumber(stats.reviewsToModerate),
      icon: <Star size={24} className="text-amber-500" />,
      color: "bg-amber-50",
      href: "/dashboard/admin?tab=reviews",
    },
    {
      title: "Active Coupons",
      value: formatNumber(stats.activeCoupons),
      icon: <Tag size={24} className="text-pink-600" />,
      color: "bg-pink-50",
      href: "/dashboard/admin?tab=coupons",
    },
  ];

  const quickActions = [
    {
      label: "Review Pending Templates",
      href: "/dashboard/admin?tab=templates",
      count: stats.pendingApplications,
    },
    {
      label: "Process Refunds",
      href: "/dashboard/admin?tab=refunds",
      count: stats.pendingRefunds,
    },
    {
      label: "Moderate Reviews",
      href: "/dashboard/admin?tab=reviews",
      count: stats.reviewsToModerate,
    },
    {
      label: "Manage Coupons",
      href: "/dashboard/admin?tab=coupons",
      count: stats.activeCoupons,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">
            Dashboard Overview
          </h2>
          <p className="text-neutral-500 mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button variant="outline" onClick={fetchStats}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            href={card.href}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all"
            >
              <div>
                <p className="font-medium text-neutral-900 group-hover:text-primary-700">
                  {action.label}
                </p>
                {action.count > 0 && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {action.count} pending
                  </p>
                )}
              </div>
              <ArrowRight
                size={18}
                className="text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Followers Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Total Followers</p>
              <p className="text-3xl font-bold">
                {formatNumber(stats.totalFollowers)}
              </p>
              <p className="text-primary-100 text-sm mt-2">
                Across all creators
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Revenue Growth Placeholder */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Platform Growth</h3>
            <Badge variant="success" size="sm">
              <TrendingUp size={12} className="mr-1" />
              Healthy
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {formatNumber(stats.totalUsers)}
              </p>
              <p className="text-sm text-neutral-500">Total Users</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {formatNumber(stats.verifiedCreators)}
              </p>
              <p className="text-sm text-neutral-500">Creators</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {formatNumber(stats.totalOrders)}
              </p>
              <p className="text-sm text-neutral-500">Orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
