import { AnalyticsQueryService } from './analytics.queryService.js';
import { AnalyticsWriteService } from './analytics.writeService.js';

/**
 * Backwards-compatible facade.
 *
 * External modules (controller, listener, etc.) import AnalyticsService and
 * call methods such as trackEvent() or getCreatorAnalytics().  This class
 * delegates every call to either AnalyticsQueryService or AnalyticsWriteService
 * so the existing call-sites keep working without any changes.
 */
export class AnalyticsService {
  constructor() {
    this._query = new AnalyticsQueryService();
    this._write = new AnalyticsWriteService();
  }

  // ─── Write operations (delegated to writeService) ─────────────────────────

  trackEvent(eventName, userId, metadata, context) {
    return this._write.trackEvent(eventName, userId, metadata, context);
  }

  // ─── Read operations (delegated to queryService) ──────────────────────────

  getEvents(filters) {
    return this._query.getEvents(filters);
  }

  getFunnelMetrics(startDate, endDate) {
    return this._query.getFunnelMetrics(startDate, endDate);
  }

  getCreatorAnalytics(userId, opts) {
    return this._query.getCreatorAnalytics(userId, opts);
  }

  getTemplateAnalytics(templateId, opts) {
    return this._query.getTemplateAnalytics(templateId, opts);
  }

  getRealtimeAnalytics(userId) {
    return this._query.getRealtimeAnalytics(userId);
  }

  exportAnalytics(userId, opts) {
    return this._query.exportAnalytics(userId, opts);
  }

  getAnalyticsComparison(userId, opts) {
    return this._query.getAnalyticsComparison(userId, opts);
  }
}
