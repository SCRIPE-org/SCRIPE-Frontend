"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  Clock4,
  LogIn,
  ShieldAlert,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent } from "@core/ui/card";
import type { VenueOverviewKpiData } from "../../domain/entities/VenueOverview";

interface Props {
  kpis: VenueOverviewKpiData;
  attentionCount?: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewKpiStrip({ kpis, attentionCount, t }: Props) {
  // Format expiry subtext for active holds
  let holdsSubtext = t("venueOverview.kpis.noActiveHolds", { defaultValue: "No active holds" });
  if (kpis.activeHoldsCount > 0 && kpis.nearestHoldExpiryUtc) {
    const diffMins = Math.max(
      0,
      Math.round(
        (new Date(kpis.nearestHoldExpiryUtc).getTime() - new Date().getTime()) / 60000
      )
    );
    holdsSubtext = t("venueOverview.kpis.nearestExpiry", {
      mins: diffMins,
      defaultValue: `Expires in ${diffMins}m`,
    });
  }

  const showAttentionCard = attentionCount !== undefined;

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6"
      data-testid="venue-overview-kpi-strip"
    >
      {/* Metric 1 — Bookings Today */}
      <Link href="/venue/calendar" className="block group">
        <Card className="border-nx-line bg-nx-surface hover:border-nx-accent/50 hover:shadow-nx-sm transition-all duration-nx-micro">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-nx-md border border-nx-accent/30 bg-nx-accent/10 text-nx-accent shrink-0 group-hover:bg-nx-accent/20 transition-colors">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-nx-ink-2 truncate">
                    {t("venueOverview.kpis.todayReservations", { defaultValue: "Bookings Today" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-bold tabular-nums text-nx-ink mt-0.5">
                  {kpis.todayReservationsCount}
                </div>
                <p className="text-[11px] text-nx-ink-3 truncate mt-0.5 tabular-nums">
                  {t("venueOverview.kpis.todayReservationsSubtext", {
                    confirmed: kpis.todayReservationsConfirmedCount,
                    checkedIn: kpis.todayReservationsCheckedInCount,
                    defaultValue: `${kpis.todayReservationsConfirmedCount} confirmed · ${kpis.todayReservationsCheckedInCount} checked in`,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 2 — Checked In Now */}
      <Link href="/venue/calendar" className="block group">
        <Card className="border-nx-line bg-nx-surface hover:border-success/50 hover:shadow-nx-sm transition-all duration-nx-micro">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-nx-md border border-success/30 bg-success/10 text-success shrink-0 group-hover:bg-success/20 transition-colors">
                <LogIn className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-nx-ink-2 truncate">
                    {t("venueOverview.kpis.checkedInNow", { defaultValue: "Checked In Now" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold tabular-nums text-nx-ink">
                    {kpis.checkedInNowCount}
                  </span>
                  {kpis.checkedInNowCount > 0 && (
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  )}
                </div>
                <p className="text-[11px] text-nx-ink-3 truncate mt-0.5">
                  {t("venueOverview.kpis.checkedInNowSubtext", { defaultValue: "Currently in session" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 3 — Active Holds */}
      <Link href="/venue/calendar" className="block group">
        <Card className="border-nx-line bg-nx-surface hover:border-amber-500/50 hover:shadow-nx-sm transition-all duration-nx-micro">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-nx-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Clock4 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-nx-ink-2 truncate">
                    {t("venueOverview.kpis.activeHolds", { defaultValue: "Active Holds" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-bold tabular-nums text-nx-ink mt-0.5">
                  {kpis.activeHoldsCount}
                </div>
                <p className="text-[11px] text-nx-ink-3 truncate mt-0.5 tabular-nums">
                  {holdsSubtext}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 4 — Needs Attention (or Active Resources Fallback) */}
      {showAttentionCard ? (
        <Link href="/venue/attention" className="block group">
          <Card
            className={cn(
              "border-nx-line bg-nx-surface hover:shadow-nx-sm transition-all duration-nx-micro",
              attentionCount > 0
                ? "border-amber-500/40 hover:border-amber-500 bg-amber-500/5"
                : "hover:border-nx-accent/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-nx-md border shrink-0 transition-colors",
                    attentionCount > 0
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/25"
                      : "border-nx-line bg-nx-surfaceSubtle text-nx-ink-2 group-hover:bg-nx-hover"
                  )}
                >
                  <ShieldAlert className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-nx-ink-2 truncate">
                      {t("venueOverview.kpis.needsAttention", { defaultValue: "Needs Attention" })}
                    </p>
                    <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold tabular-nums text-nx-ink">
                      {attentionCount}
                    </span>
                    {attentionCount > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                        {t("venueOverview.kpis.actionRequired", { defaultValue: "Action" })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-nx-ink-3 truncate mt-0.5">
                    {attentionCount > 0
                      ? t("venueOverview.kpis.signalsPending", {
                          count: attentionCount,
                          defaultValue: `${attentionCount} operational signal(s)`,
                        })
                      : t("venueOverview.kpis.allClear", { defaultValue: "All signals clear" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Link href="/venue/facilities" className="block group">
          <Card className="border-nx-line bg-nx-surface hover:border-nx-accent/50 hover:shadow-nx-sm transition-all duration-nx-micro">
            <CardContent className="p-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-nx-md border border-nx-line bg-nx-surfaceSubtle text-nx-ink-2 shrink-0 group-hover:bg-nx-hover transition-colors">
                  <Layers className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-nx-ink-2 truncate">
                      {t("venueOverview.kpis.activeResources", { defaultValue: "Active Resources" })}
                    </p>
                    <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold tabular-nums text-nx-ink mt-0.5">
                    {kpis.activeResourcesCount}
                  </div>
                  <p className="text-[11px] text-nx-ink-3 truncate mt-0.5">
                    {t("venueOverview.kpis.activeResourcesSubtext", { defaultValue: "Featured in today’s schedule" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
