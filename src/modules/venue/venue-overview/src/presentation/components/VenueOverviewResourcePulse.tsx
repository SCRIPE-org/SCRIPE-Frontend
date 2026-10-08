"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { VenueOverviewResourceActivityItem } from "../../domain/entities/VenueOverview";
import { resolveSportIcon } from "@modules/venue";

interface Props {
  items: VenueOverviewResourceActivityItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Documentation for module export
 */
export function VenueOverviewResourcePulse({ items, t }: Props) {
  const totalResources = items.length;
  const inUseCount = items.filter((i) => i.statusLabel === "checkedIn").length;
  const upcomingCount = items.filter((i) => i.statusLabel === "nextBooking").length;
  const noActiveCount = items.filter((i) => i.statusLabel === "noActiveBooking").length;

  return (
    <Card
      className="overflow-hidden border-nx-line bg-nx-surface"
      data-testid="resource-pulse-card"
    >
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.resourceActivity.title", { defaultValue: "Resource Pulse" })}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("venueOverview.resourceActivity.subtitle", {
                defaultValue: "Operational status scan across courts and fields.",
              })}
            </CardDescription>
          </div>
          <Link
            href="/venue/facilities"
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-nx-accent hover:underline"
          >
            <span>{t("venueOverview.resourcePulse.viewAll", { defaultValue: "Facilities" })}</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Compact Summary Metric Pills */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center">
          <div className="rounded-nx-xs bg-nx-surfaceSubtle border border-nx-line p-2">
            <span className="block text-xs font-bold tabular-nums text-nx-ink">
              {totalResources}
            </span>
            <span className="block truncate text-[10px] text-nx-ink-3">
              {t("venueOverview.resourcePulse.total", { defaultValue: "Total" })}
            </span>
          </div>
          <div className="rounded-nx-xs border border-success/30 bg-success/10 p-2 text-success">
            <span className="block text-xs font-bold tabular-nums">{inUseCount}</span>
            <span className="block truncate text-[10px]">
              {t("venueOverview.resourcePulse.inUse", { defaultValue: "In Use" })}
            </span>
          </div>
          <div className="rounded-nx-xs bg-nx-accent/10 border-nx-accent/30 border p-2 text-nx-accent">
            <span className="block text-xs font-bold tabular-nums">{upcomingCount}</span>
            <span className="block truncate text-[10px]">
              {t("venueOverview.resourcePulse.upcoming", { defaultValue: "Upcoming" })}
            </span>
          </div>
          <div className="rounded-nx-xs bg-nx-surfaceSubtle border border-nx-line p-2 text-nx-ink-3">
            <span className="block text-xs font-bold tabular-nums">{noActiveCount}</span>
            <span className="block truncate text-[10px]">
              {t("venueOverview.resourcePulse.idle", { defaultValue: "No Booking" })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-[300px] overflow-y-auto p-0">
        {items.length === 0 ? (
          <div className="flex h-36 items-center justify-center p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.resourceActivity.noResources", {
              defaultValue: "No schedulable resources configured.",
            })}
          </div>
        ) : (
          <div className="divide-y divide-nx-line">
            {items.map((item) => {
              const SportIcon = resolveSportIcon(item.resourceName);
              let labelText = t("venueOverview.resourceActivity.status.noActiveBooking", {
                defaultValue: "No active booking",
              });
              let badgeStyle = "border-nx-line bg-nx-surfaceSubtle text-nx-ink-3";

              if (item.statusLabel === "checkedIn" && item.currentOrNextEndUtc) {
                const endLocalTime = item.currentOrNextEndUtc.slice(11, 16);
                labelText = t("venueOverview.resourceActivity.status.checkedIn", {
                  time: endLocalTime,
                  defaultValue: `In use Â· until ${endLocalTime}`,
                });
                badgeStyle = "border-success/50 bg-success/15 text-success font-semibold";
              } else if (item.statusLabel === "nextBooking" && item.currentOrNextStartUtc) {
                const startLocalTime = item.currentOrNextStartUtc.slice(11, 16);
                labelText = t("venueOverview.resourceActivity.status.nextBooking", {
                  time: startLocalTime,
                  defaultValue: `Next Â· ${startLocalTime}`,
                });
                badgeStyle = "border-nx-accent/50 bg-nx-accent/15 text-nx-accent font-medium";
              }

              return (
                <div
                  key={item.resourceId}
                  className="hover:bg-nx-surfaceSubtle/50 group flex items-center justify-between gap-3 p-3 text-xs transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="rounded-nx-xs bg-nx-surfaceSubtle flex size-7 shrink-0 items-center justify-center border border-nx-line text-nx-accent">
                      {SportIcon}
                    </div>
                    <Link
                      href={`/venue/availability?resourceId=${encodeURIComponent(item.resourceId)}`}
                      className="truncate font-semibold text-nx-ink hover:text-nx-accent hover:underline"
                    >
                      {item.resourceName}
                    </Link>
                  </div>

                  {/* Status Indicator (Strictly NEVER labels Available from booking absence) */}
                  <div className="flex shrink-0 items-center gap-2">
                    {item.activeReservationId ? (
                      <Link
                        href={`/venue/bookings/${encodeURIComponent(item.activeReservationId)}`}
                        className="shrink-0"
                      >
                        <Badge
                          variant="outline"
                          className={`${badgeStyle} cursor-pointer tabular-nums hover:underline`}
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
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
