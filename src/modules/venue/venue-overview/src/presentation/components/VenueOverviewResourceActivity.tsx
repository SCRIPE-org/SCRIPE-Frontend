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
            className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1"
          >
            {t("venueOverview.quickActions.title")}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-nx-sm border border-dashed border-nx-line bg-nx-surfaceSubtle p-4 text-center text-xs text-nx-ink-3">
            {t("venueOverview.resourceActivity.noResources")}
          </div>
        ) : (
          <div className="divide-y divide-nx-line rounded-nx-sm border border-nx-line overflow-hidden">
            {items.map((item) => {
              let labelText = t("venueOverview.resourceActivity.status.noActiveBooking");
              let badgeStyle = "border-nx-line bg-nx-surfaceSubtle text-nx-ink-3";

              if (item.statusLabel === "checkedIn" && item.currentOrNextEndUtc) {
                const endLocalTime = item.currentOrNextEndUtc.slice(11, 16);
                labelText = t("venueOverview.resourceActivity.status.checkedIn", { time: endLocalTime });
                badgeStyle = "border-success/50 bg-success/15 text-success font-semibold";
              } else if (item.statusLabel === "nextBooking" && item.currentOrNextStartUtc) {
                const startLocalTime = item.currentOrNextStartUtc.slice(11, 16);
                labelText = t("venueOverview.resourceActivity.status.nextBooking", { time: startLocalTime });
                badgeStyle = "border-info/50 bg-info/15 text-info font-medium";
              }

              return (
                <div
                  key={item.resourceId}
                  className="flex items-center justify-between p-3 gap-3 text-xs hover:bg-nx-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-nx-xs border border-nx-line bg-nx-surfaceSubtle text-nx-ink-2 shrink-0">
                      <Layers className="size-3.5" aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-nx-ink truncate">
                      {item.resourceName}
                    </span>
                  </div>

                  {/* Status Indicator (Never labels 'Available' from booking absence) */}
                  {item.activeReservationId ? (
                    <Link
                      href={`/venue/bookings/${encodeURIComponent(item.activeReservationId)}`}
                      className="shrink-0"
                    >
                      <Badge variant="outline" className={`${badgeStyle} tabular-nums hover:underline`}>
                        {labelText}
                      </Badge>
                    </Link>
                  ) : (
                    <Badge variant="outline" className={`${badgeStyle} tabular-nums shrink-0`}>
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
