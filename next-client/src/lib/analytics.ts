/**
 * Analytics Event Tracking Helper
 *
 * Tracks user interactions and page views for analytics purposes.
 * Events are sent to the backend API for processing and storage.
 */

import { api } from "./api/client";

// Event types
export type AnalyticsEventType =
  // Template events
  | "template_view"
  | "template_click"
  | "template_purchase_start"
  | "template_purchase_complete"
  | "template_add_to_cart"
  | "template_wishlist_add"
  | "template_wishlist_remove"
  | "template_share"
  | "template_quick_view"
  | "template_preview"
  // Search events
  | "search_query"
  | "search_result_click"
  | "search_filter_apply"
  | "search_sort_change"
  // User events
  | "user_login"
  | "user_register"
  | "user_logout"
  // Navigation events
  | "page_view"
  | "category_view"
  | "creator_view"
  // Service events
  | "service_view"
  | "service_request"
  // Affiliate events
  | "affiliate_link_click"
  | "affiliate_conversion"
  // Home/Discovery events
  | "hero_cta_click"
  | "featured_template_click"
  | "category_tile_click"
  | "popular_search_click";

// Event properties interface
export interface AnalyticsEventProperties {
  // Template related
  templateId?: string;
  templateSlug?: string;
  templateTitle?: string;
  templatePrice?: number;
  platform?: string;
  category?: string;

  // Search related
  searchQuery?: string;
  searchResultsCount?: number;
  searchFilters?: Record<string, unknown>;

  // User related
  userId?: string;

  // Page related
  path?: string;
  referrer?: string;

  // Click/Interaction related
  elementId?: string;
  elementName?: string;
  position?: number;
  source?: string;

  // E-commerce related
  cartValue?: number;
  quantity?: number;

  // Custom properties
  [key: string]: unknown;
}

// Queue for batching events
interface QueuedEvent {
  type: AnalyticsEventType;
  properties: AnalyticsEventProperties;
  timestamp: string;
}

const eventQueue: QueuedEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

// Configuration
const CONFIG = {
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  enabled:
    typeof window !== "undefined" && process.env.NODE_ENV === "production",
  debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
};

/**
 * Get the current session ID from cookies or generate a new one
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  // Try to get from session storage
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Get device/browser info
 */
function getDeviceInfo() {
  if (typeof window === "undefined") return {};

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Flush the event queue to the server
 */
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0; // Clear queue

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (!CONFIG.enabled && !CONFIG.debug) return;

  try {
    if (CONFIG.debug) {
      console.log("[Analytics] Flushing events:", events);
    }

    await api.post("/analytics/events", {
      events,
      sessionId: getSessionId(),
      deviceInfo: getDeviceInfo(),
    });
  } catch (error) {
    // Silently fail in production, log in debug mode
    if (CONFIG.debug) {
      console.error("[Analytics] Failed to send events:", error);
    }
  }
}

/**
 * Schedule a flush of the event queue
 */
function scheduleFlush(): void {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    void flushEvents();
  }, CONFIG.flushInterval);
}

/**
 * Track an analytics event
 */
export function trackEvent(
  type: AnalyticsEventType,
  properties: AnalyticsEventProperties = {},
): void {
  if (typeof window === "undefined") return;

  const event: QueuedEvent = {
    type,
    properties: {
      ...properties,
      path: properties.path || window.location.pathname,
      referrer: properties.referrer || document.referrer,
      url: window.location.href,
    },
    timestamp: new Date().toISOString(),
  };

  eventQueue.push(event);

  if (CONFIG.debug) {
    console.log("[Analytics] Event queued:", event);
  }

  // Flush immediately if batch size reached
  if (eventQueue.length >= CONFIG.batchSize) {
    void flushEvents();
  } else {
    scheduleFlush();
  }
}

/**
 * Track a page view
 */
export function trackPageView(
  path?: string,
  properties: AnalyticsEventProperties = {},
): void {
  trackEvent("page_view", {
    ...properties,
    path: path || window.location.pathname,
  });
}

/**
 * Track a template view
 */
export function trackTemplateView(
  templateId: string,
  templateSlug: string,
  templateTitle: string,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateSlug" | "templateTitle"
  > = {},
): void {
  trackEvent("template_view", {
    ...properties,
    templateId,
    templateSlug,
    templateTitle,
  });
}

/**
 * Track a template click (from listing/grid)
 */
export function trackTemplateClick(
  templateId: string,
  templateSlug: string,
  position: number,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateSlug" | "position"
  > = {},
): void {
  trackEvent("template_click", {
    ...properties,
    templateId,
    templateSlug,
    position,
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(
  templateId: string,
  templateTitle: string,
  price: number,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateTitle" | "cartValue"
  > = {},
): void {
  trackEvent("template_add_to_cart", {
    ...properties,
    templateId,
    templateTitle,
    cartValue: price,
  });
}

/**
 * Track search query
 */
export function trackSearch(
  query: string,
  resultsCount: number,
  properties: Omit<
    AnalyticsEventProperties,
    "searchQuery" | "searchResultsCount"
  > = {},
): void {
  trackEvent("search_query", {
    ...properties,
    searchQuery: query,
    searchResultsCount: resultsCount,
  });
}

/**
 * Track search result click
 */
export function trackSearchResultClick(
  query: string,
  templateId: string,
  position: number,
  properties: Omit<
    AnalyticsEventProperties,
    "searchQuery" | "templateId" | "position"
  > = {},
): void {
  trackEvent("search_result_click", {
    ...properties,
    searchQuery: query,
    templateId,
    position,
  });
}

/**
 * Track hero CTA click on home page
 */
export function trackHeroCTA(
  ctaName: string,
  properties: AnalyticsEventProperties = {},
): void {
  trackEvent("hero_cta_click", {
    ...properties,
    elementName: ctaName,
  });
}

/**
 * Track featured template click
 */
export function trackFeaturedTemplateClick(
  templateId: string,
  section: string,
  position: number,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "source" | "position"
  > = {},
): void {
  trackEvent("featured_template_click", {
    ...properties,
    templateId,
    source: section,
    position,
  });
}

/**
 * Track category tile click
 */
export function trackCategoryClick(
  category: string,
  position: number,
  properties: Omit<AnalyticsEventProperties, "category" | "position"> = {},
): void {
  trackEvent("category_tile_click", {
    ...properties,
    category,
    position,
  });
}

/**
 * Track quick view modal open
 */
export function trackQuickView(
  templateId: string,
  templateTitle: string,
  source: string,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateTitle" | "source"
  > = {},
): void {
  trackEvent("template_quick_view", {
    ...properties,
    templateId,
    templateTitle,
    source,
  });
}

/**
 * Track template preview/demo click
 */
export function trackPreview(
  templateId: string,
  templateTitle: string,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateTitle"
  > = {},
): void {
  trackEvent("template_preview", {
    ...properties,
    templateId,
    templateTitle,
  });
}

/**
 * Track wishlist action
 */
export function trackWishlist(
  action: "add" | "remove",
  templateId: string,
  properties: Omit<AnalyticsEventProperties, "templateId"> = {},
): void {
  trackEvent(
    action === "add" ? "template_wishlist_add" : "template_wishlist_remove",
    {
      ...properties,
      templateId,
    },
  );
}

/**
 * Track share action
 */
export function trackShare(
  templateId: string,
  platform: string,
  properties: Omit<AnalyticsEventProperties, "templateId" | "source"> = {},
): void {
  trackEvent("template_share", {
    ...properties,
    templateId,
    source: platform,
  });
}

/**
 * Track purchase funnel events
 */
export function trackPurchaseStart(
  templateId: string,
  templateTitle: string,
  price: number,
  properties: Omit<
    AnalyticsEventProperties,
    "templateId" | "templateTitle" | "cartValue"
  > = {},
): void {
  trackEvent("template_purchase_start", {
    ...properties,
    templateId,
    templateTitle,
    cartValue: price,
  });
}

/**
 * Flush all pending events (useful for page unload)
 */
export function flushPendingEvents(): void {
  if (eventQueue.length > 0) {
    // Use sendBeacon for page unload if available
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const events = [...eventQueue];
      eventQueue.length = 0;

      const blob = new Blob(
        [JSON.stringify({ events, sessionId: getSessionId() })],
        { type: "application/json" },
      );
      navigator.sendBeacon("/api/analytics/events", blob);
    } else {
      void flushEvents();
    }
  }
}

// Auto-flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushPendingEvents);
  window.addEventListener("pagehide", flushPendingEvents);
}

// Export default for convenience
export default {
  trackEvent,
  trackPageView,
  trackTemplateView,
  trackTemplateClick,
  trackAddToCart,
  trackSearch,
  trackSearchResultClick,
  trackHeroCTA,
  trackFeaturedTemplateClick,
  trackCategoryClick,
  trackQuickView,
  trackPreview,
  trackWishlist,
  trackShare,
  trackPurchaseStart,
  flushPendingEvents,
};
