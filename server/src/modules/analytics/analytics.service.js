import { AnalyticsEvent } from './analytics.model.js';

export class AnalyticsService {
  async trackEvent(eventName, userId, metadata = {}, context = {}) {
    const event = await AnalyticsEvent.create({
      eventName,
      userId,
      metadata,
      page: context.page,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      anonymousId: context.anonymousId
    });

    return event;
  }

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
}
