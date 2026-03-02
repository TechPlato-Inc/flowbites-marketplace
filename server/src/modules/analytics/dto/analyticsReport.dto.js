/**
 * Shape an analytics report response from raw service data.
 * Used for template-level analytics (getTemplateAnalytics).
 */
export function toAnalyticsReportDTO(data, { period } = {}) {
  const template = data.template || {};
  const dailyStats = (data.dailyStats || []).map(day => ({
    date: day.date,
    views: day.views || 0,
    clicks: day.clicks || 0,
    purchases: day.purchases || 0,
    revenue: day.revenue || 0,
  }));

  return {
    period: period || null,
    totalViews: template.views || 0,
    totalPurchases: template.purchases || 0,
    totalRevenue: template.revenue || 0,
    conversionRate: template.conversionRate || 0,
    topTemplates: data.topReferrers
      ? data.topReferrers.map(r => ({
          source: r.source,
          visitors: r.visitors,
        }))
      : [],
    dailyStats,
  };
}

/**
 * Shape creator-specific analytics response.
 * Used for getCreatorAnalytics.
 */
export function toCreatorAnalyticsDTO(data) {
  const summary = data.summary || {};
  const templates = (data.templates || []).map(t => ({
    templateId: t.templateId,
    title: t.title,
    thumbnail: t.thumbnail || '',
    views: t.views || 0,
    uniqueViews: t.uniqueViews || 0,
    clicks: t.clicks || 0,
    purchases: t.purchases || 0,
    addToCarts: t.addToCarts || 0,
    wishlistAdds: t.wishlistAdds || 0,
    previewClicks: t.previewClicks || 0,
    conversionRate: t.conversionRate || 0,
    revenue: t.revenue || 0,
    trend: t.trend || 'stable',
    trendPercentage: t.trendPercentage || 0,
  }));

  const events = data.events || {};
  const eventsByDay = (events.eventsByDay || []).map(d => ({
    date: d.date,
    count: d.count || 0,
  }));

  return {
    summary: {
      totalViews: summary.totalViews || 0,
      totalUniqueViews: summary.totalUniqueViews || 0,
      totalClicks: summary.totalClicks || 0,
      totalPurchases: summary.totalPurchases || 0,
      totalRevenue: summary.totalRevenue || 0,
      averageConversionRate: summary.averageConversionRate || 0,
    },
    templates,
    events: {
      totalEvents: events.totalEvents || 0,
      uniqueVisitors: events.uniqueVisitors || 0,
      eventsByType: events.eventsByType || {},
      eventsByDay,
    },
    trafficSources: (data.trafficSources || []).map(t => ({
      source: t.source,
      visitors: t.visitors || 0,
      percentage: t.percentage || 0,
    })),
    geographicData: data.geographicData || [],
    deviceBreakdown: (data.deviceBreakdown || []).map(d => ({
      device: d.device,
      visitors: d.visitors || 0,
      percentage: d.percentage || 0,
    })),
  };
}
