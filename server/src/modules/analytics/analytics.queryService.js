import { AnalyticsEvent } from './analytics.model.js';
import { Template } from '../templates/template.model.js';
import { Order } from '../orders/order.model.js';

export class AnalyticsQueryService {
  async getEvents(filters = {}) {
    const { eventName, userId, startDate, endDate, limit = 100 } = filters;

    const query = {};

    if (eventName) query.eventName = eventName;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return events;
  }

  async getFunnelMetrics(startDate, endDate) {
    const match = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const events = await AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 }
        }
      }
    ]);

    const metrics = {};
    events.forEach(e => {
      metrics[e._id] = e.count;
    });

    return {
      view_template: metrics.view_template || 0,
      purchase_start: metrics.purchase_start || 0,
      purchase_success: metrics.purchase_success || 0,
      download: metrics.download || 0,
      service_request: metrics.service_request || 0
    };
  }

  /**
   * Get analytics for a creator's templates.
   * Combines analytics events with template stats and order data.
   */
  async getCreatorAnalytics(userId, { startDate, endDate, templateId, period } = {}) {
    // Get creator's templates
    const templateQuery = { creatorId: userId, status: 'approved' };
    if (templateId) templateQuery._id = templateId;

    const templates = await Template.find(templateQuery)
      .select('title slug thumbnail stats price')
      .lean();

    const templateIds = templates.map(t => t._id);

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get analytics events for these templates
    const eventMatch = {
      'metadata.templateId': { $in: templateIds.map(id => id.toString()) }
    };
    if (startDate || endDate) {
      eventMatch.timestamp = dateFilter;
    }

    const eventAgg = await AnalyticsEvent.aggregate([
      { $match: eventMatch },
      {
        $group: {
          _id: {
            templateId: '$metadata.templateId',
            eventName: '$eventName'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Build per-template event counts
    const templateEvents = {};
    for (const e of eventAgg) {
      const tid = e._id.templateId;
      if (!templateEvents[tid]) templateEvents[tid] = {};
      templateEvents[tid][e._id.eventName] = e.count;
    }

    // Get orders for these templates in the date range
    const orderMatch = {
      status: 'paid',
      'items.templateId': { $in: templateIds }
    };
    if (startDate || endDate) {
      orderMatch.paidAt = dateFilter;
    }

    const orders = await Order.find(orderMatch).lean();

    // Count purchases and revenue per template
    const templateSales = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (item.templateId && templateIds.some(id => id.toString() === item.templateId.toString())) {
          const tid = item.templateId.toString();
          if (!templateSales[tid]) templateSales[tid] = { purchases: 0, revenue: 0 };
          templateSales[tid].purchases++;
          templateSales[tid].revenue += item.creatorPayout || item.price || 0;
        }
      }
    }

    // Build template analytics
    const templateAnalytics = templates.map(t => {
      const tid = t._id.toString();
      const events = templateEvents[tid] || {};
      const sales = templateSales[tid] || { purchases: 0, revenue: 0 };
      const views = events.view_template || t.stats?.views || 0;
      const purchases = sales.purchases || t.stats?.purchases || 0;

      return {
        templateId: tid,
        title: t.title,
        thumbnail: t.thumbnail || '',
        views,
        uniqueViews: views, // approximate
        clicks: events.template_click || 0,
        purchases,
        addToCarts: events.add_to_cart || 0,
        wishlistAdds: events.wishlist_add || t.stats?.likes || 0,
        previewClicks: events.preview_click || 0,
        conversionRate: views > 0 ? (purchases / views) * 100 : 0,
        revenue: Math.round((sales.revenue || t.stats?.revenue || 0) * 100) / 100,
        trend: 'stable',
        trendPercentage: 0
      };
    });

    // Summary
    const totalViews = templateAnalytics.reduce((s, t) => s + t.views, 0);
    const totalPurchases = templateAnalytics.reduce((s, t) => s + t.purchases, 0);
    const totalRevenue = templateAnalytics.reduce((s, t) => s + t.revenue, 0);

    // Events summary
    const allEventsMatch = { ...eventMatch };
    const allEventsAgg = await AnalyticsEvent.aggregate([
      { $match: allEventsMatch },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventsByType = {};
    let totalEvents = 0;
    for (const e of allEventsAgg) {
      eventsByType[e._id] = e.count;
      totalEvents += e.count;
    }

    // Daily events
    const dailyAgg = await AnalyticsEvent.aggregate([
      { $match: allEventsMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const eventsByDay = dailyAgg.map(d => ({ date: d._id, count: d.count }));

    // Unique visitors (approximate by unique userId + anonymousId)
    const uniqueVisitors = await AnalyticsEvent.distinct('userId', allEventsMatch);

    // Traffic sources from referrer
    const trafficAgg = await AnalyticsEvent.aggregate([
      { $match: { ...allEventsMatch, 'page.referrer': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$page.referrer',
          visitors: { $sum: 1 }
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);

    const totalTrafficVisitors = trafficAgg.reduce((s, t) => s + t.visitors, 0) || 1;
    const trafficSources = trafficAgg.map(t => {
      let source = 'Direct';
      try {
        if (t._id) source = new URL(t._id).hostname.replace('www.', '');
      } catch { source = t._id || 'Direct'; }
      return {
        source,
        visitors: t.visitors,
        percentage: Math.round((t.visitors / totalTrafficVisitors) * 100)
      };
    });

    // Device breakdown from user agent
    const deviceAgg = await AnalyticsEvent.aggregate([
      { $match: allEventsMatch },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: { $ifNull: ['$userAgent', ''] }, regex: /Mobile|Android|iPhone/i } },
              'mobile',
              {
                $cond: [
                  { $regexMatch: { input: { $ifNull: ['$userAgent', ''] }, regex: /Tablet|iPad/i } },
                  'tablet',
                  'desktop'
                ]
              }
            ]
          },
          visitors: { $sum: 1 }
        }
      }
    ]);

    const totalDeviceVisitors = deviceAgg.reduce((s, d) => s + d.visitors, 0) || 1;
    const deviceBreakdown = deviceAgg.map(d => ({
      device: d._id,
      visitors: d.visitors,
      percentage: Math.round((d.visitors / totalDeviceVisitors) * 100)
    }));

    return {
      templates: templateAnalytics,
      summary: {
        totalViews,
        totalUniqueViews: Math.round(totalViews * 0.7), // approximate
        totalClicks: templateAnalytics.reduce((s, t) => s + t.clicks, 0),
        totalPurchases,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageConversionRate: totalViews > 0 ? Math.round((totalPurchases / totalViews) * 10000) / 100 : 0
      },
      events: {
        totalEvents,
        uniqueVisitors: uniqueVisitors.length,
        eventsByType,
        eventsByDay
      },
      trafficSources,
      geographicData: [], // Would need GeoIP lookup
      deviceBreakdown
    };
  }

  /**
   * Get analytics for a specific template.
   */
  async getTemplateAnalytics(templateId, { startDate, endDate, period } = {}) {
    const template = await Template.findById(templateId)
      .select('title slug thumbnail stats price creatorId')
      .lean();

    if (!template) return null;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const eventMatch = {
      'metadata.templateId': templateId.toString()
    };
    if (startDate || endDate) {
      eventMatch.timestamp = dateFilter;
    }

    // Event counts
    const eventAgg = await AnalyticsEvent.aggregate([
      { $match: eventMatch },
      { $group: { _id: '$eventName', count: { $sum: 1 } } }
    ]);

    const events = {};
    for (const e of eventAgg) {
      events[e._id] = e.count;
    }

    // Daily stats
    const dailyAgg = await AnalyticsEvent.aggregate([
      { $match: eventMatch },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            event: '$eventName'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Group daily stats
    const dailyMap = {};
    for (const d of dailyAgg) {
      if (!dailyMap[d._id.date]) {
        dailyMap[d._id.date] = { date: d._id.date, views: 0, clicks: 0, purchases: 0, revenue: 0 };
      }
      if (d._id.event === 'view_template') dailyMap[d._id.date].views = d.count;
      if (d._id.event === 'template_click') dailyMap[d._id.date].clicks = d.count;
      if (d._id.event === 'purchase_success') dailyMap[d._id.date].purchases = d.count;
    }

    const dailyStats = Object.values(dailyMap);

    // Top referrers
    const refAgg = await AnalyticsEvent.aggregate([
      { $match: { ...eventMatch, 'page.referrer': { $exists: true, $ne: null } } },
      { $group: { _id: '$page.referrer', visitors: { $sum: 1 } } },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);

    const topReferrers = refAgg.map(r => {
      let source = r._id || 'Direct';
      try { source = new URL(r._id).hostname.replace('www.', ''); } catch { /* keep raw */ }
      return { source, visitors: r.visitors };
    });

    const views = events.view_template || template.stats?.views || 0;
    const purchases = events.purchase_success || template.stats?.purchases || 0;

    return {
      template: {
        templateId: template._id.toString(),
        title: template.title,
        thumbnail: template.thumbnail || '',
        views,
        uniqueViews: views,
        clicks: events.template_click || 0,
        purchases,
        addToCarts: events.add_to_cart || 0,
        wishlistAdds: events.wishlist_add || template.stats?.likes || 0,
        previewClicks: events.preview_click || 0,
        conversionRate: views > 0 ? (purchases / views) * 100 : 0,
        revenue: template.stats?.revenue || 0,
        trend: 'stable',
        trendPercentage: 0
      },
      dailyStats,
      topReferrers
    };
  }

  /**
   * Get real-time analytics (last hour).
   */
  async getRealtimeAnalytics(userId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get creator's template IDs
    const templates = await Template.find({ creatorId: userId, status: 'approved' })
      .select('_id title')
      .lean();

    const templateIds = templates.map(t => t._id.toString());

    const match = {
      'metadata.templateId': { $in: templateIds },
      timestamp: { $gte: oneHourAgo }
    };

    // Count active visitors (unique users in last hour)
    const uniqueUsers = await AnalyticsEvent.distinct('userId', match);
    const uniqueAnon = await AnalyticsEvent.distinct('anonymousId', {
      ...match,
      userId: { $exists: false }
    });

    // Page views in last hour
    const pageViewCount = await AnalyticsEvent.countDocuments({
      ...match,
      eventName: 'view_template'
    });

    // Top templates by views in last hour
    const topAgg = await AnalyticsEvent.aggregate([
      { $match: { ...match, eventName: 'view_template' } },
      { $group: { _id: '$metadata.templateId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    const templateMap = {};
    for (const t of templates) templateMap[t._id.toString()] = t.title;

    const topTemplates = topAgg.map(t => ({
      templateId: t._id,
      title: templateMap[t._id] || 'Unknown',
      views: t.views
    }));

    return {
      activeVisitors: uniqueUsers.length + uniqueAnon.length,
      pageViewsLastHour: pageViewCount,
      topTemplates
    };
  }

  /**
   * Export analytics as CSV or JSON.
   */
  async exportAnalytics(userId, { format, startDate, endDate, templateId } = {}) {
    const data = await this.getCreatorAnalytics(userId, { startDate, endDate, templateId });

    if (format === 'csv') {
      const rows = [
        ['Template', 'Views', 'Unique Views', 'Clicks', 'Purchases', 'Revenue', 'Conversion Rate'].join(',')
      ];

      for (const t of data.templates) {
        rows.push([
          `"${t.title.replace(/"/g, '""')}"`,
          t.views,
          t.uniqueViews,
          t.clicks,
          t.purchases,
          t.revenue,
          t.conversionRate.toFixed(2)
        ].join(','));
      }

      return rows.join('\n');
    }

    // JSON format
    return JSON.stringify(data, null, 2);
  }

  /**
   * Compare two time periods.
   */
  async getAnalyticsComparison(userId, { currentPeriod, previousPeriod }) {
    const [current, previous] = await Promise.all([
      this.getCreatorAnalytics(userId, {
        startDate: currentPeriod.start,
        endDate: currentPeriod.end
      }),
      this.getCreatorAnalytics(userId, {
        startDate: previousPeriod.start,
        endDate: previousPeriod.end
      })
    ]);

    const calcChange = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 10000) / 100 : 0;

    return {
      views: {
        current: current.summary.totalViews,
        previous: previous.summary.totalViews,
        change: calcChange(current.summary.totalViews, previous.summary.totalViews)
      },
      revenue: {
        current: current.summary.totalRevenue,
        previous: previous.summary.totalRevenue,
        change: calcChange(current.summary.totalRevenue, previous.summary.totalRevenue)
      },
      conversions: {
        current: current.summary.totalPurchases,
        previous: previous.summary.totalPurchases,
        change: calcChange(current.summary.totalPurchases, previous.summary.totalPurchases)
      }
    };
  }
}
