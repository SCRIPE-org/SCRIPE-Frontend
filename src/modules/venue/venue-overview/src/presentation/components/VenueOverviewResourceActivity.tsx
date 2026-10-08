"use client";

import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewResourceActivityItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewResourceActivityItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

function formatTimeString(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(11, 16) || "â€”";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString.slice(11, 16) || "â€”";
  }
}

/**
 * Documentation for module export
 */
export function VenueOverviewResourceActivity({ items, t }: Props) {
  return (
    <Card className="border-nx-line bg-nx-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.resourceActivity.title")}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("venueOverview.resourceActivity.subtitle")}
            </CardDescription>
          </div>
          <Link
            href="/venue/facilities"
            className="flex items-center gap-1 text-xs font-semibold text-nx-accent hover:underline"
          >
            {t("venueOverview.quickActions.title")}
            <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="bg-nx-surfaceSubtle flex h-40 items-center justify-center rounded-nx-sm border border-dashed border-nx-line p-4 text-center text-xs text-nx-ink-3">
            {t("venueOverview.resourceActivity.noResources")}
          </div>
        ) : (
          <div className="divide-y divide-nx-line overflow-hidden rounded-nx-sm border border-nx-line">
            {items.map((item) => {
              let labelText = t("venueOverview.resourceActivity.status.noActiveBooking");
              let badgeStyle = "border-nx-line bg-nx-surfaceSubtle text-nx-ink-3";

              if (item.statusLabel === "checkedIn" && item.currentOrNextEndUtc) {
                const endLocalTime = formatTimeString(item.currentOrNextEndUtc);
                labelText = t("venueOverview.resourceActivity.status.checkedIn", {
                  time: endLocalTime,
                });
                badgeStyle = "border-success/50 bg-success/15 text-success font-semibold";
              } else if (item.statusLabel === "nextBooking" && item.currentOrNextStartUtc) {
                const startLocalTime = formatTimeString(item.currentOrNextStartUtc);
                labelText = t("venueOverview.resourceActivity.status.nextBooking", {
                  time: startLocalTime,
                });
                badgeStyle = "border-info/50 bg-info/15 text-info font-medium";
              }

              return (
                <div
                  key={item.resourceId}
                  className="flex items-center justify-between gap-3 p-3 text-xs transition-colors hover:bg-nx-hover"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="rounded-nx-xs bg-nx-surfaceSubtle flex size-7 shrink-0 items-center justify-center border border-nx-line text-nx-ink-2">
                      <Layers className="size-3.5" aria-hidden="true" />
                    </div>
                    <span className="truncate font-semibold text-nx-ink">{item.resourceName}</span>
                  </div>

                  {/* Status Indicator (Never labels 'Available' from booking absence) */}
                  {item.activeReservationId ? (
                    <Link
                      href={`/venue/bookings/${encodeURIComponent(item.activeReservationId)}`}
                      className="shrink-0"
                    >
                      <Badge
                        variant="outline"
                        className={`${badgeStyle} tabular-nums hover:underline`}
                      >
                        {labelText}
                      </Badge>
                    </Link>
                  ) : (
                    <Badge variant="outline" className={`${badgeStyle} shrink-0 tabular-nums`}>
                      {labelText}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
