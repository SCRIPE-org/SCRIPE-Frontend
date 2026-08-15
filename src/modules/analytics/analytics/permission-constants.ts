/**
 * Analytics Events Module Permissions
 *
 * Covers: Analytics Events (distinct from the Monitoring module's dashboard
 * "analytics.*" permissions — this covers the analytics-events tracking
 * configuration feature under src/modules/analytics/analytics/events).
 */
export const ANALYTICS_EVENTS_PERMISSIONS = {
  ANALYTICS_EVENTS_VIEW: "analytics-events.view",
} as const;
