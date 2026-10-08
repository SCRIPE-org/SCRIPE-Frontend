"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, User, ExternalLink } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import type { Booking360Status } from "@modules/venue";
import type { VenueOverviewUpNextItem } from "../../domain/entities/VenueOverview";
import { resolveSportIcon } from "@modules/venue";

interface Props {
  items: VenueOverviewUpNextItem[];
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

function statusBadgeClass(status: Booking360Status) {
  switch (status) {
    case "Held":
      return "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium";
    case "Confirmed":
      return "border-nx-accent/50 bg-nx-accent/15 text-nx-accent font-medium";
    case "CheckedIn":
      return "border-success/50 bg-success/15 text-success font-semibold";
    default:
      return "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2";
  }
}

/**
 * Documentation for module export
 */
export function VenueOverviewUpNext({ items, t }: Props) {
  return (
    <Card className="border-nx-line bg-nx-surface overflow-hidden" data-testid="venue-overview-up-next">
      <CardHeader className="pb-3 border-b border-nx-line">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("venueOverview.upNext.title", { defaultValue: "Up Next" })}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("venueOverview.upNext.subtitle", {
                defaultValue: "Who is arriving next? Next reservations scheduled for today.",
              })}
            </CardDescription>
          </div>
          <Link
            href="/venue/calendar"
            className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t("venueOverview.quickActions.openCalendar", { defaultValue: "View Calendar" })}</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex h-44 items-center justify-center p-6 text-center text-xs text-nx-ink-3">
            {t("venueOverview.upNext.noUpcoming", { defaultValue: "No upcoming reservations scheduled for today." })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-nx-line bg-nx-surfaceSubtle/60 text-[11px] font-semibold text-nx-ink-3 uppercase tracking-wider">
                  <th scope="col" className="px-4 py-2.5">
                    {t("venueOverview.upNext.columns.time", { defaultValue: "Time" })}
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    {t("venueOverview.upNext.columns.customer", { defaultValue: "Customer" })}
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    {t("venueOverview.upNext.columns.resource", { defaultValue: "Resource" })}
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    {t("venueOverview.upNext.columns.status", { defaultValue: "Status" })}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    {t("venueOverview.upNext.columns.action", { defaultValue: "Action" })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-line">
                {items.map((item) => {
                  const timePart = item.startLocal.split("T")[1]?.slice(0, 5) ?? item.startLocal.slice(11, 16);
                  const endTimePart = item.endLocal.split("T")[1]?.slice(0, 5) ?? item.endLocal.slice(11, 16);
                  const SportIcon = resolveSportIcon(item.resourceName);

                  return (
                    <tr
                      key={item.reservationId}
                      className="hover:bg-nx-surfaceSubtle/50 transition-colors group"
                    >
                      {/* Time */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-nx-ink tabular-nums" dir="ltr">
                          <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                          <span>{timePart} â€“ {endTimePart}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-nx-surfaceSubtle border border-nx-line text-nx-ink-2 font-bold text-[10px]">
                            <User className="size-3 text-nx-ink-3" aria-hidden="true" />
                          </div>
                          <span className="font-semibold text-nx-ink truncate max-w-[130px]">
                            {item.customerDisplayName ||
                              (item.customerPartyId
                                ? t("venueOverview.upNext.customerUnavailable", { defaultValue: "Customer unavailable" })
                                : t("venueOverview.upNext.customerRestricted", { defaultValue: "Restricted" }))}
                          </span>
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-nx-accent">{SportIcon}</span>
                          <span className="font-semibold text-nx-ink truncate max-w-[140px]">
                            {item.resourceName}
                          </span>
                        </div>
                      </td>

                      {/* Status & Reference */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusBadgeClass(item.status)}>
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                          <span className="font-mono text-[11px] text-nx-ink-3 hidden sm:inline" dir="ltr">
                            {item.reservationNumber}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1 border-nx-line hover:border-nx-accent hover:text-nx-accent"
                        >
                          <Link href={`/venue/bookings/${encodeURIComponent(item.reservationId)}`}>
                            <span>{item.status === "Held" ? "Review" : "Open"}</span>
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
