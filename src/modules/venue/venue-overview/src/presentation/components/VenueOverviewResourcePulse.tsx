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
    <Card className="border-nx-line bg-nx-surface overflow-hidden" data-testid="resource-pulse-card">
      <CardHeader className="pb-3 border-b border-nx-line">
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
            className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t("venueOverview.resourcePulse.viewAll", { defaultValue: "Facilities" })}</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Compact Summary Metric Pills */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center">
          <div className="p-2 rounded-nx-xs bg-nx-surfaceSubtle border border-nx-line">
            <span className="block text-xs font-bold text-nx-ink tabular-nums">{totalResources}</span>
            <span className="block text-[10px] text-nx-ink-3 truncate">
              {t("venueOverview.resourcePulse.total", { defaultValue: "Total" })}
            </span>
          </div>
          <div className="p-2 rounded-nx-xs bg-success/10 border border-success/30 text-success">
            <span className="block text-xs font-bold tabular-nums">{inUseCount}</span>
            <span className="block text-[10px] truncate">
              {t("venueOverview.resourcePulse.inUse", { defaultValue: "In Use" })}
            </span>
          </div>
          <div className="p-2 rounded-nx-xs bg-nx-accent/10 border border-nx-accent/30 text-nx-accent">
            <span className="block text-xs font-bold tabular-nums">{upcomingCount}</span>
            <span className="block text-[10px] truncate">
              {t("venueOverview.resourcePulse.upcoming", { defaultValue: "Upcoming" })}
            </span>
          </div>
          <div className="p-2 rounded-nx-xs bg-nx-surfaceSubtle border border-nx-line text-nx-ink-3">
            <span className="block text-xs font-bold tabular-nums">{noActiveCount}</span>
            <span className="block text-[10px] truncate">
              {t("venueOverview.resourcePulse.idle", { defaultValue: "No Booking" })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-36 items-center justify-center p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.resourceActivity.noResources", { defaultValue: "No schedulable resources configured." })}
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
                  defaultValue: `In use · until ${endLocalTime}`,
                });
                badgeStyle = "border-success/50 bg-success/15 text-success font-semibold";
              } else if (item.statusLabel === "nextBooking" && item.currentOrNextStartUtc) {
                const startLocalTime = item.currentOrNextStartUtc.slice(11, 16);
                labelText = t("venueOverview.resourceActivity.status.nextBooking", {
                  time: startLocalTime,
                  defaultValue: `Next · ${startLocalTime}`,
                });
                badgeStyle = "border-nx-accent/50 bg-nx-accent/15 text-nx-accent font-medium";
              }

              return (
                <div
                  key={item.resourceId}
                  className="flex items-center justify-between p-3 gap-3 text-xs hover:bg-nx-surfaceSubtle/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-nx-xs border border-nx-line bg-nx-surfaceSubtle text-nx-accent shrink-0">
                      {SportIcon}
                    </div>
                    <Link
                      href={`/venue/availability?resourceId=${encodeURIComponent(item.resourceId)}`}
                      className="font-semibold text-nx-ink truncate hover:text-nx-accent hover:underline"
                    >
                      {item.resourceName}
                    </Link>
                  </div>

                  {/* Status Indicator (Strictly NEVER labels Available from booking absence) */}
                  <div className="shrink-0 flex items-center gap-2">
                    {item.activeReservationId ? (
                      <Link
                        href={`/venue/bookings/${encodeURIComponent(item.activeReservationId)}`}
                        className="shrink-0"
                      >
                        <Badge variant="outline" className={`${badgeStyle} tabular-nums hover:underline cursor-pointer`}>
                          {labelText}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge variant="outline" className={`${badgeStyle} tabular-nums shrink-0`}>
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
