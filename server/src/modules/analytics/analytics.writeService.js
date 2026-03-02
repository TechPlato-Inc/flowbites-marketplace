import { AnalyticsEvent } from './analytics.model.js';

export class AnalyticsWriteService {
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
}
