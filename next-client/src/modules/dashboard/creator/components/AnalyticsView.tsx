"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getUploadUrl } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import type { Template } from "@/types";
import {
  TrendingUp,
  Eye,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

interface AnalyticsViewProps {
  templates: Template[];
}

export function AnalyticsView({ templates }: AnalyticsViewProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = templates.reduce(
      (sum, t) => sum + (t.stats?.revenue || 0),
      0,
    );
    const totalSales = templates.reduce(
      (sum, t) => sum + (t.stats?.purchases || 0),
      0,
    );
    const totalViews = templates.reduce(
      (sum, t) => sum + (t.stats?.views || 0),
      0,
    );
    const conversionRate =
      totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : "0.00";

    return { totalRevenue, totalSales, totalViews, conversionRate };
  }, [templates]);

  // Get top performing templates
  const topTemplates = useMemo(() => {
    return [...templates]
      .sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0))
      .slice(0, 5);
  }, [templates]);

  // Revenue breakdown by top templates for the chart
  const revenueChartData = useMemo(() => {
    const sorted = [...templates]
      .filter((t) => (t.stats?.revenue || 0) > 0)
      .sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0))
      .slice(0, 6);

    const maxRevenue = sorted.length > 0 ? sorted[0].stats?.revenue || 0 : 0;

    return sorted.map((t) => {
      const revenue = t.stats?.revenue || 0;
      const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
      const label =
        t.title.length > 12 ? t.title.slice(0, 12) + "..." : t.title;
      return { label, revenue, heightPercent };
    });
  }, [templates]);

  // Platform breakdown
  const platformStats = useMemo(() => {
    const breakdown: Record<string, { count: number; revenue: number }> = {};

    templates.forEach((t) => {
      const platform = t.platform || "other";
      if (!breakdown[platform]) {
        breakdown[platform] = { count: 0, revenue: 0 };
      }
      breakdown[platform].count += 1;
      breakdown[platform].revenue += t.stats?.revenue || 0;
    });

    return Object.entries(breakdown).sort(
      (a, b) => b[1].revenue - a[1].revenue,
    );
  }, [templates]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Analytics Dashboard
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Track your template performance, revenue, and engagement metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Total Revenue</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400 mt-2">Lifetime earnings</p>
        </div>

        {/* Sales Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Total Sales</span>
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} className="text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {stats.totalSales.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400 mt-2">All time</p>
        </div>

        {/* Views Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Total Views</span>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Eye size={16} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {stats.totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400 mt-2">All time</p>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Conversion Rate</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {stats.conversionRate}%
          </p>
          <p className="text-xs text-neutral-400 mt-2">Views to sales</p>
        </div>
      </div>

      {/* Revenue Chart & Platform Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 mb-6">
            Revenue by Template
          </h3>

          {revenueChartData.length > 0 ? (
            <div className="h-48 flex items-end justify-around gap-4 px-4">
              {revenueChartData.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="text-xs text-neutral-500 font-medium">
                    ${data.revenue.toLocaleString()}
                  </div>
                  <div
                    className="w-full max-w-16 bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                    style={{ height: `${Math.max(data.heightPercent, 10)}%` }}
                  />
                  <div className="text-xs text-neutral-400 text-center truncate w-full">
                    {data.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-neutral-400 text-sm">
              No revenue data yet. Upload your first template to start tracking.
            </div>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Platform Breakdown
          </h3>

          {platformStats.length > 0 ? (
            <div className="space-y-4">
              {platformStats.map(([platform, data]) => {
                const percentage =
                  stats.totalRevenue > 0
                    ? Math.round((data.revenue / stats.totalRevenue) * 100)
                    : 0;

                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 capitalize">
                        {platform}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {data.count} templates • ${data.revenue.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 text-sm">
              No platform data available.
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Templates */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">
            Top Performing Templates
          </h3>
          <Link href="/dashboard/creator?view=templates">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowUpRight size={14} />}
            >
              View All
            </Button>
          </Link>
        </div>

        {topTemplates.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {topTemplates.map((template, index) => (
              <div
                key={template._id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="w-6 text-center text-sm font-semibold text-neutral-400">
                  #{index + 1}
                </span>

                <img
                  src={getUploadUrl(`images/${template.thumbnail}`)}
                  alt={template.title}
                  className="w-16 h-12 object-cover rounded-lg"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {template.title}
                  </p>
                  <p className="text-sm text-neutral-500 capitalize">
                    {template.platform}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-neutral-900">
                      {template.stats?.views || 0}
                    </p>
                    <p className="text-xs text-neutral-400">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-neutral-900">
                      {template.stats?.purchases || 0}
                    </p>
                    <p className="text-xs text-neutral-400">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      ${(template.stats?.revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400">Revenue</p>
                  </div>
                </div>

                <Link href={`/templates/${template.slug}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <BarChart3 size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              No analytics data yet
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Publish your first template to see stats
            </p>
            <Link href="/dashboard/creator/upload-template">
              <Button>Upload Your First Template</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
