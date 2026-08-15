/**
 * Analytics Module — Events sub-module barrel export.
 *
 * Analytics Event Foundation (Wave 2A, 2A-11) is an internal kernel:
 * events are recorded in-process by IAnalyticsRecorder from other modules,
 * never user-authored. The only user-facing surface is the read-only
 * event stream view at /analytics/events.
 */
export { AnalyticsEventStreamView } from "./src/presentation/views/AnalyticsEventStreamView";
