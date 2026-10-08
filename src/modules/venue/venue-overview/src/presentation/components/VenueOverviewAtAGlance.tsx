"use client";

import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { Booking360Status } from "@modules/venue";
import type { VenueOverviewAtAGlanceItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewAtAGlanceItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

/** Human-readable labels for booking statuses â€” avoids cross-module i18n dependency */
const STATUS_LABELS: Record<Booking360Status, string> = {
  Confirmed: "Confirmed",
  CheckedIn: "Checked In",
  Held: "Held",
  Completed: "Completed",
  Cancelled: "Cancelled",
  NoShow: "No Show",
  Draft: "Draft",
  Requested: "Requested",
  PendingApproval: "Pending Approval",
  PartiallyFulfilled: "Partially Fulfilled",
  Rejected: "Rejected",
  Expired: "Expired",
};

function statusBadgeProps(status: Booking360Status) {
  switch (status) {
    case "Held":
      return { className: "border-warning/50 bg-warning/15 text-warning-strong" };
    case "Confirmed":
      return { className: "border-info/50 bg-info/15 text-info" };
    case "CheckedIn":
      return { className: "border-success/50 bg-success/15 text-success" };
    case "Completed":
      return { className: "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2" };
    case "NoShow":
      return { className: "border-destructive/50 bg-destructive/15 text-destructive" };
    case "Cancelled":
      return { className: "border-nx-line bg-nx-surfaceSubtle text-nx-ink-3" };
    default:
      return { className: "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2" };
  }
}

/**
 * Documentation for module export
 */
export function VenueOverviewAtAGlance({ items, t }: Props) {
  const totalCount = items.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card className="h-full border-nx-line bg-nx-surface">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-nx-ink">
          {t("venueOverview.atAGlance.title")}
        </CardTitle>
        <CardDescription className="text-xs text-nx-ink-2">
          {t("venueOverview.atAGlance.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {totalCount === 0 ? (
          <div className="bg-nx-surfaceSubtle flex h-48 items-center justify-center rounded-nx-sm border border-dashed border-nx-line p-4 text-center text-xs text-nx-ink-3">
            {t("venueOverview.atAGlance.noBookings")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.status}
                className="hover:bg-nx-surfaceSubtle flex items-center justify-between rounded-nx-sm border border-nx-line p-2.5 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusBadgeProps(item.status).className}>
                    {STATUS_LABELS[item.status] || item.status}
                  </Badge>
                </div>
                <span className="font-bold tabular-nums text-nx-ink">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
