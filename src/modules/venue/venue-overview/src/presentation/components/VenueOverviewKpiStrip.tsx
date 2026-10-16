"use client";

import Link from "next/link";
import { CalendarCheck2, Clock4, LogIn, ShieldAlert, Layers, ArrowUpRight } from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent } from "@core/ui/card";
import type { VenueOverviewKpiData } from "../../domain/entities/VenueOverview";

interface Props {
  kpis: VenueOverviewKpiData;
  attentionCount?: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Documentation for module export
 */
export function VenueOverviewKpiStrip({ kpis, attentionCount, t }: Props) {
  // Format expiry subtext for active holds
  let holdsSubtext = t("venueOverview.kpis.noActiveHolds", { defaultValue: "No active holds" });
  if (kpis.activeHoldsCount > 0 && kpis.nearestHoldExpiryUtc) {
    const diffMins = Math.max(
      0,
      Math.round((new Date(kpis.nearestHoldExpiryUtc).getTime() - new Date().getTime()) / 60000)
    );
    holdsSubtext = t("venueOverview.kpis.nearestExpiry", {
      mins: diffMins,
      defaultValue: `Expires in ${diffMins}m`,
    });
  }

  const showAttentionCard = attentionCount !== undefined;

  return (
    <div
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="venue-overview-kpi-strip"
    >
      {/* Metric 1 â€” Bookings Today */}
      <Link href="/venue/calendar" className="group block">
        <Card className="hover:border-nx-accent/50 border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="border-nx-accent/30 bg-nx-accent/10 group-hover:bg-nx-accent/20 flex size-11 shrink-0 items-center justify-center rounded-nx-md border text-nx-accent transition-colors">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-nx-ink-2">
                    {t("venueOverview.kpis.todayReservations", { defaultValue: "Bookings Today" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 text-2xl font-bold tabular-nums text-nx-ink">
                  {kpis.todayReservationsCount}
                </div>
                <p className="mt-0.5 truncate text-[11px] tabular-nums text-nx-ink-3">
                  {t("venueOverview.kpis.todayReservationsSubtext", {
                    confirmed: kpis.todayReservationsConfirmedCount,
                    checkedIn: kpis.todayReservationsCheckedInCount,
                    defaultValue: `${kpis.todayReservationsConfirmedCount} confirmed Â· ${kpis.todayReservationsCheckedInCount} checked in`,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 2 â€” Checked In Now */}
      <Link href="/venue/calendar" className="group block">
        <Card className="border-nx-line bg-nx-surface transition-all duration-nx-micro hover:border-success/50 hover:shadow-nx-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-success/30 bg-success/10 text-success transition-colors group-hover:bg-success/20">
                <LogIn className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-nx-ink-2">
                    {t("venueOverview.kpis.checkedInNow", { defaultValue: "Checked In Now" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-nx-ink">
                    {kpis.checkedInNowCount}
                  </span>
                  {kpis.checkedInNowCount > 0 && (
                    <span
                      className="flex size-2 animate-pulse rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
                  {t("venueOverview.kpis.checkedInNowSubtext", {
                    defaultValue: "Currently in session",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 3 â€” Active Holds */}
      <Link href="/venue/calendar" className="group block">
        <Card className="border-nx-line bg-nx-surface transition-all duration-nx-micro hover:border-amber-500/50 hover:shadow-nx-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-amber-500/30 bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:text-amber-400">
                <Clock4 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-nx-ink-2">
                    {t("venueOverview.kpis.activeHolds", { defaultValue: "Active Holds" })}
                  </p>
                  <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 text-2xl font-bold tabular-nums text-nx-ink">
                  {kpis.activeHoldsCount}
                </div>
                <p className="mt-0.5 truncate text-[11px] tabular-nums text-nx-ink-3">
                  {holdsSubtext}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 4 â€” Needs Attention (or Active Resources Fallback) */}
      {showAttentionCard ? (
        <Link href="/venue/attention" className="group block">
          <Card
            className={cn(
              "border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm",
              attentionCount > 0
                ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                : "hover:border-nx-accent/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-nx-md border transition-colors",
                    attentionCount > 0
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-600 group-hover:bg-amber-500/25 dark:text-amber-400"
                      : "bg-nx-surfaceSubtle border-nx-line text-nx-ink-2 group-hover:bg-nx-hover"
                  )}
                >
                  <ShieldAlert className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-semibold text-nx-ink-2">
                      {t("venueOverview.kpis.needsAttention", { defaultValue: "Needs Attention" })}
                    </p>
                    <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-nx-ink">
                      {attentionCount}
                    </span>
                    {attentionCount > 0 && (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {t("venueOverview.kpis.actionRequired", { defaultValue: "Action" })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
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
        <Link href="/venue/facilities" className="group block">
          <Card className="hover:border-nx-accent/50 border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3.5">
                <div className="bg-nx-surfaceSubtle flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-nx-line text-nx-ink-2 transition-colors group-hover:bg-nx-hover">
                  <Layers className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-semibold text-nx-ink-2">
                      {t("venueOverview.kpis.activeResources", {
                        defaultValue: "Active Resources",
                      })}
                    </p>
                    <ArrowUpRight className="size-3 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-0.5 text-2xl font-bold tabular-nums text-nx-ink">
                    {kpis.activeResourcesCount}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">
                    {t("venueOverview.kpis.activeResourcesSubtext", {
                      defaultValue: "Featured in todayâ€™s schedule",
                    })}
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
