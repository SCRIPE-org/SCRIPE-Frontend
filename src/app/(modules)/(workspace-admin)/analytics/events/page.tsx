/**
 * Analytics Event Stream Page
 *
 * Read-only operator view over the Analytics Event Foundation.
 *
 * Events are written in-process by IAnalyticsRecorder from other modules —
 * they are never user-authored. This page shows the operator-facing read
 * surface: the append-only metric-event stream and its daily projection.
 *
 * Permission required: analytics-events.view
 * API:  GET /api/v1/analytics/events
 *       GET /api/v1/analytics/daily-metrics
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AnalyticsEventStreamView } from "@modules/analytics/events";

export const metadata: Metadata = {
  title: "Analytics Event Stream",
  description:
    "Read-only view of the metric-event stream recorded by the SCRIPE Analytics Event Foundation",
};

export default function AnalyticsEventsPage() {
  return (
    <ModuleErrorBoundary moduleName="events.title">
      <AnalyticsEventStreamView />
    </ModuleErrorBoundary>
  );
}
