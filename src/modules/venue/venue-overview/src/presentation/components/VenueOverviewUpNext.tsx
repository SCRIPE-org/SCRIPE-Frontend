"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, User, Hash } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { Booking360Status } from "@modules/venue/booking-360/src/domain/entities/Booking360";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewUpNextItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

function statusBadgeClass(status: Booking360Status) {
  switch (status) {
    case "Held":
      return "border-warning/50 bg-warning/15 text-warning-strong";
    case "Confirmed":
      return "border-info/50 bg-info/15 text-info";
    case "CheckedIn":
      return "border-success/50 bg-success/15 text-success";
    default:
      return "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2";
  }
}

export function VenueOverviewUpNext({ items, t }: Props) {
  return (
    <Card className="border-nx-line bg-nx-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.upNext.title")}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("venueOverview.upNext.subtitle")}
            </CardDescription>
          </div>
          <Link
            href="/venue/calendar"
            className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1"
          >
            {t("venueOverview.quickActions.openCalendar")}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-nx-sm border border-dashed border-nx-line bg-nx-surfaceSubtle p-4 text-center text-xs text-nx-ink-3">
            {t("venueOverview.upNext.noUpcoming")}
          </div>
        ) : (
          <div className="divide-y divide-nx-line rounded-nx-sm border border-nx-line overflow-hidden">
            {items.map((item) => {
              const timePart = item.startLocal.split("T")[1]?.slice(0, 5) ?? item.startLocal.slice(11, 16);
              const endTimePart = item.endLocal.split("T")[1]?.slice(0, 5) ?? item.endLocal.slice(11, 16);

              return (
                <Link
                  key={item.reservationId}
                  href={`/venue/bookings/${encodeURIComponent(item.reservationId)}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-nx-hover transition-colors text-xs group"
                >
                  <div className="flex items-center gap-3">
                    {/* Time (LTR) */}
                    <div className="flex items-center gap-1 font-mono font-semibold text-nx-ink tabular-nums shrink-0" dir="ltr">
                      <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                      <span>{timePart} – {endTimePart}</span>
                    </div>

                    {/* Resource Name */}
                    <span className="font-semibold text-nx-ink truncate max-w-[140px] sm:max-w-[180px]">
                      {item.resourceName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {/* Customer */}
                    <div className="flex items-center gap-1 text-nx-ink-2 truncate max-w-[120px]">
                      <User className="size-3.5 text-nx-ink-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {item.customerDisplayName ||
                          (item.customerPartyId
                            ? t("venueOverview.upNext.customerUnavailable")
                            : t("venueOverview.upNext.customerRestricted"))}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="outline" className={statusBadgeClass(item.status)}>
                      {t(`operationsCalendar.status.${item.status}`, { defaultValue: item.status })}
                    </Badge>

                    {/* Reservation Reference (LTR) */}
                    <span className="font-mono font-medium text-nx-accent group-hover:underline inline-flex items-center gap-0.5" dir="ltr">
                      <Hash className="size-3 text-nx-accent/70" aria-hidden="true" />
                      {item.reservationNumber}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
