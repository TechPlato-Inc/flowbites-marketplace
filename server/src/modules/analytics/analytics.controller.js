import { AnalyticsQueryService } from './analytics.queryService.js';
import { AnalyticsWriteService } from './analytics.writeService.js';
import { analyticsQuerySchema } from './analytics.validator.js';
import { toAnalyticsReportDTO, toCreatorAnalyticsDTO } from './dto/analyticsReport.dto.js';

const queryService = new AnalyticsQueryService();
const writeService = new AnalyticsWriteService();

/**
 * Resolve period shorthand ('7d', '30d', '90d', '1y') into startDate / endDate.
 * Falls back to explicit dateFrom / dateTo if provided.
 */
function resolveDates(query) {
  const { period, dateFrom, dateTo } = query;
  let startDate = dateFrom;
  let endDate = dateTo;

  if (period) {
    const now = new Date();
    endDate = now.toISOString();

    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = periodMap[period];
    if (days) {
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      startDate = start.toISOString();
    }
  }

  return { startDate, endDate };
}

export class AnalyticsController {
  async trackEvent(req, res, next) {
    try {
      // Body already validated by trackEventSchema middleware
      const { event, templateId, metadata = {} } = req.body;

      // Merge templateId into metadata if provided at top level
      const eventMetadata = templateId
        ? { ...metadata, templateId }
        : metadata;

      const context = {
        page: {
          url: req.headers.referer,
          path: req.path,
        },
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        anonymousId: req.body.anonymousId,
      };

      const result = await writeService.trackEvent(
        event,
        req.user?._id,
        eventMetadata,
        context
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const parsed = analyticsQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const { startDate, endDate } = resolveDates(filters);

      const metrics = await queryService.getFunnelMetrics(startDate, endDate);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorAnalytics(req, res, next) {
    try {
      const parsed = analyticsQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const { startDate, endDate } = resolveDates(filters);

      const data = await queryService.getCreatorAnalytics(req.user._id, {
        startDate,
        endDate,
        templateId: filters.templateId,
        period: filters.period,
      });

      res.json({ success: true, data: toCreatorAnalyticsDTO(data) });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateAnalytics(req, res, next) {
    try {
      const parsed = analyticsQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const { startDate, endDate } = resolveDates(filters);

      const data = await queryService.getTemplateAnalytics(req.params.templateId, {
        startDate,
        endDate,
        period: filters.period,
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        data: toAnalyticsReportDTO(data, { period: filters.period }),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRealtimeAnalytics(req, res, next) {
    try {
      const data = await queryService.getRealtimeAnalytics(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async exportAnalytics(req, res, next) {
    try {
      const parsed = analyticsQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const { startDate, endDate } = resolveDates(filters);
      const format = req.query.format || 'json';

      const data = await queryService.exportAnalytics(req.user._id, {
        format,
        startDate,
        endDate,
        templateId: filters.templateId,
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.csv`
        );
        return res.send(data);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.json`
      );
      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  async compareAnalytics(req, res, next) {
    try {
      const data = await queryService.getAnalyticsComparison(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
