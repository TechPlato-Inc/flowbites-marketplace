"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getUploadUrl } from "@/lib/api/client";
import { Button, Badge, Modal } from "@/design-system";
import type { Template } from "@/types";
import {
  getCreatorAnalytics,
  type TemplateAnalytics,
  type TimeRangeAnalytics,
  exportAnalytics,
} from "../services/analytics.service";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Download,
  MousePointer,
  Heart,
  ExternalLink,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

interface AnalyticsViewProps {
  templates: Template[];
}

const TIME_RANGES = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "365", label: "Last Year" },
  { value: "all", label: "All Time" },
];

export function AnalyticsView({ templates }: AnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState("30");
  const [analytics, setAnalytics] = useState<TimeRangeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  // Calculate date range based on selection
  const getDateRange = () => {
    if (timeRange === "all") return {};
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const dateRange = getDateRange();
      const data = await getCreatorAnalytics({
        ...dateRange,
        templateId: selectedTemplate || undefined,
      });

      setAnalytics(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load analytics"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedTemplate]);

  // Calculate summary stats from real data or fallback to template stats
  const stats = useMemo(() => {
    if (analytics?.summary) {
      const totalRevenue = analytics.summary.totalRevenue;
      const totalSales = analytics.summary.totalPurchases;
      const totalViews = analytics.summary.totalViews;
      const conversionRate =
        totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : "0.00";

      return { totalRevenue, totalSales, totalViews, conversionRate };
    }

    // Fallback to template stats
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
  }, [analytics, templates]);

  // Get top performing templates from analytics or fallback
  const topTemplates = useMemo((): TemplateAnalytics[] => {
    if (analytics?.templates?.length) {
      return [...analytics.templates]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }

    // Fallback: derive from props
    return templates
      .map((t) => ({
        templateId: t._id,
        title: t.title,
        thumbnail: t.thumbnail,
        views: t.stats?.views || 0,
        uniqueViews: t.stats?.views || 0,
        clicks: 0,
        purchases: t.stats?.purchases || 0,
        addToCarts: 0,
        wishlistAdds: t.stats?.likes || 0,
        previewClicks: 0,
        conversionRate: t.stats?.views
          ? (t.stats.purchases / t.stats.views) * 100
          : 0,
        revenue: t.stats?.revenue || 0,
        trend: "stable" as const,
        trendPercentage: 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [analytics, templates]);

  // Chart data from daily stats or derived
  const revenueChartData = useMemo(() => {
    const sorted = [...topTemplates].filter((t) => t.revenue > 0).slice(0, 6);

    const maxRevenue = sorted.length > 0 ? sorted[0].revenue : 0;

    return sorted.map((t) => {
      const heightPercent = maxRevenue > 0 ? (t.revenue / maxRevenue) * 100 : 0;
      const label =
        t.title.length > 12 ? t.title.slice(0, 12) + "..." : t.title;
      return { label, revenue: t.revenue, heightPercent };
    });
  }, [topTemplates]);

  // Traffic sources
  const trafficSources = useMemo(() => {
    if (analytics?.trafficSources?.length) {
      return analytics.trafficSources.slice(0, 5);
    }
    return [];
  }, [analytics]);

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    if (analytics?.deviceBreakdown?.length) {
      return analytics.deviceBreakdown;
    }
    return [];
  }, [analytics]);

  const handleExport = async (format: "csv" | "json") => {
    try {
      setExporting(true);
      const dateRange = getDateRange();
      const blob = await exportAnalytics(format, {
        ...dateRange,
        templateId: selectedTemplate || undefined,
      });

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse" />
        </div>
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

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Track your template performance, revenue, and engagement metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-neutral-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Template Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-neutral-400" />
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              <option value="">All Templates</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={loadAnalytics}
            isLoading={loading}
          >
            Refresh
          </Button>

          {/* Export Dropdown */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
              disabled={exporting}
            >
              Export
            </Button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 first:rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 last:rounded-b-lg"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}

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
          <p className="text-xs text-neutral-400 mt-2">
            {analytics?.summary ? "In selected period" : "Lifetime earnings"}
          </p>
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
          <p className="text-xs text-neutral-400 mt-2">
            {analytics?.summary ? "In selected period" : "All time"}
          </p>
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
          {analytics?.summary && (
            <p className="text-xs text-neutral-400 mt-2">
              {analytics.summary.totalUniqueViews.toLocaleString()} unique
            </p>
          )}
          {!analytics?.summary && (
            <p className="text-xs text-neutral-400 mt-2">All time</p>
          )}
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

      {/* Charts Row */}
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

        {/* Traffic Sources */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Traffic Sources
          </h3>

          {trafficSources.length > 0 ? (
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 capitalize">
                      {source.source}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {source.visitors.toLocaleString()} visitors
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 text-sm">
              <MousePointer size={32} className="mx-auto mb-3 opacity-50" />
              <p>No traffic source data available yet.</p>
              <p className="text-xs mt-1">
                Share your templates to get more traffic
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Device Breakdown */}
      {deviceBreakdown.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Device Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deviceBreakdown.map((device) => (
              <div
                key={device.device}
                className="text-center p-4 bg-neutral-50 rounded-lg"
              >
                <p className="text-2xl font-bold text-neutral-900">
                  {device.percentage}%
                </p>
                <p className="text-sm text-neutral-600 capitalize">
                  {device.device}
                </p>
                <p className="text-xs text-neutral-400">
                  {device.visitors.toLocaleString()} visitors
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                key={template.templateId}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="w-6 text-center text-sm font-semibold text-neutral-400">
                  #{index + 1}
                </span>

                {template.thumbnail ? (
                  <img
                    src={getUploadUrl(`images/${template.thumbnail}`)}
                    alt={template.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <BarChart3 size={20} className="text-neutral-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {template.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-500">
                      {template.views.toLocaleString()} views
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">
                      {template.purchases.toLocaleString()} sales
                    </span>
                    {template.trend !== "stable" && (
                      <span
                        className={`text-xs flex items-center gap-0.5 ${
                          template.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {template.trend === "up" ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {template.trendPercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-neutral-900">
                      {template.uniqueViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400">Unique Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-neutral-900">
                      {template.conversionRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-neutral-400">Conv. Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      ${template.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400">Revenue</p>
                  </div>
                </div>

                <Link
                  href={`/templates/${template.templateId}`}
                  target="_blank"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ExternalLink size={14} />}
                  >
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

      {/* Events Summary */}
      {analytics?.events && analytics.events.eventsByType && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Event Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(analytics.events.eventsByType).map(
              ([type, count]) => (
                <div key={type} className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                  <p className="text-sm text-neutral-600 capitalize">
                    {type.replace(/_/g, " ")}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
