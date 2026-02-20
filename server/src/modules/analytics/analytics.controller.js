import { AnalyticsService } from './analytics.service.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async trackEvent(req, res, next) {
    try {
      const { eventName, metadata } = req.body;

      const context = {
        page: {
          url: req.headers.referer,
          path: req.path
        },
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        anonymousId: req.body.anonymousId
      };

      const event = await analyticsService.trackEvent(
        eventName,
        req.user?._id,
        metadata,
        context
      );

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const metrics = await analyticsService.getFunnelMetrics(startDate, endDate);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}
