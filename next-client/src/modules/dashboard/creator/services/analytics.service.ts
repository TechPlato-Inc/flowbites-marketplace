import { api } from "@/lib/api/client";

// Analytics data types
export interface TemplateAnalytics {
  templateId: string;
  title: string;
  thumbnail: string;
  views: number;
  uniqueViews: number;
  clicks: number;
  purchases: number;
  addToCarts: number;
  wishlistAdds: number;
  previewClicks: number;
  conversionRate: number;
  revenue: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface EventSummary {
  totalEvents: number;
  uniqueVisitors: number;
  eventsByType: Record<string, number>;
  eventsByDay: { date: string; count: number }[];
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
}

export interface DeviceBreakdown {
  device: string;
  visitors: number;
  percentage: number;
}

export interface TimeRangeAnalytics {
  templates: TemplateAnalytics[];
  summary: {
    totalViews: number;
    totalUniqueViews: number;
    totalClicks: number;
    totalPurchases: number;
    totalRevenue: number;
    averageConversionRate: number;
  };
  events: EventSummary;
  trafficSources: TrafficSource[];
  geographicData: GeographicData[];
  deviceBreakdown: DeviceBreakdown[];
}

// Get analytics for creator's templates
export async function getCreatorAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  templateId?: string;
  period?: "day" | "week" | "month" | "year";
}): Promise<TimeRangeAnalytics> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.templateId) queryParams.append("templateId", params.templateId);
  if (params?.period) queryParams.append("period", params.period);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const { data } = await api.get(`/analytics/creator${query}`);
  return data.data;
}

// Get analytics for a specific template
export async function getTemplateAnalytics(
  templateId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    period?: "day" | "week" | "month";
  },
): Promise<{
  template: TemplateAnalytics;
  dailyStats: {
    date: string;
    views: number;
    clicks: number;
    purchases: number;
    revenue: number;
  }[];
  topReferrers: { source: string; visitors: number }[];
}> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.period) queryParams.append("period", params.period);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const { data } = await api.get(`/analytics/templates/${templateId}${query}`);
  return data.data;
}

// Get real-time analytics
export async function getRealtimeAnalytics(): Promise<{
  activeVisitors: number;
  pageViewsLastHour: number;
  topTemplates: { templateId: string; title: string; views: number }[];
}> {
  const { data } = await api.get("/analytics/realtime");
  return data.data;
}

// Export analytics data
export async function exportAnalytics(
  format: "csv" | "json",
  params?: {
    startDate?: string;
    endDate?: string;
    templateId?: string;
  },
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  queryParams.append("format", format);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.templateId) queryParams.append("templateId", params.templateId);

  const response = await api.get(
    `/analytics/export?${queryParams.toString()}`,
    {
      responseType: "blob",
    },
  );
  return response.data;
}

// Get comparison data
export async function getAnalyticsComparison(params: {
  currentPeriod: { start: string; end: string };
  previousPeriod: { start: string; end: string };
}): Promise<{
  views: { current: number; previous: number; change: number };
  revenue: { current: number; previous: number; change: number };
  conversions: { current: number; previous: number; change: number };
}> {
  const { data } = await api.post("/analytics/compare", params);
  return data.data;
}
