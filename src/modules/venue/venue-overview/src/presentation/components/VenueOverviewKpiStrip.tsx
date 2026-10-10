"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  Clock4,
  LogIn,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
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

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-6 items-stretch"
      data-testid="venue-overview-kpi-strip"
    >
      {/* Metric 1 — Bookings Today */}
      <Link href="/venue/calendar" className="block group">
        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <ArrowUpRight className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                {kpis.todayReservationsCount}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t("venueOverview.kpis.todayReservations", { defaultValue: "Bookings Today" })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 tabular-nums">
                {t("venueOverview.kpis.todayReservationsSubtext", {
                  confirmed: kpis.todayReservationsConfirmedCount,
                  checkedIn: kpis.todayReservationsCheckedInCount,
                  defaultValue: `${kpis.todayReservationsConfirmedCount} confirmed · ${kpis.todayReservationsCheckedInCount} checked in`,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 2 — Courts In Use / Checked In Now */}
      <Link href="/venue/calendar" className="block group">
        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:shadow-md transition-all rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <LogIn className="size-5" aria-hidden="true" />
              </div>
              {kpis.checkedInNowCount > 0 ? (
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              ) : (
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              )}
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {kpis.checkedInNowCount}
                </span>
                {kpis.activeResourcesCount > 0 && (
                  <span className="text-xs text-slate-400">
                    of {kpis.activeResourcesCount} courts
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t("venueOverview.kpis.checkedInNow", { defaultValue: "Checked In Now" })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {t("venueOverview.kpis.checkedInNowSubtext", { defaultValue: "Currently on court / in play" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 3 — Active Holds */}
      <Link href="/venue/calendar" className="block group">
        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/50 hover:shadow-md transition-all rounded-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                <Clock4 className="size-5" aria-hidden="true" />
              </div>
              {kpis.activeHoldsCount > 0 ? (
                <span className="text-[11px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              ) : (
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                {kpis.activeHoldsCount}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t("venueOverview.kpis.activeHolds", { defaultValue: "Active Holds" })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 tabular-nums">
                {holdsSubtext}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Metric 4 — Needs Attention (Preferred Operational Direction) or Active Resources fallback */}
      {attentionCount !== undefined ? (
        <Link href="/venue/attention" className="block group">
          <Card
            className={cn(
              "h-full border transition-all rounded-xl",
              attentionCount > 0
                ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 hover:shadow-md"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md"
            )}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    attentionCount > 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                  )}
                >
                  <ShieldAlert className="size-5" aria-hidden="true" />
                </div>
                {attentionCount > 0 ? (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {t("venueOverview.kpis.actionRequired", { defaultValue: "Action" })}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                    {t("venueOverview.kpis.allClear", { defaultValue: "Clear" })}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {attentionCount}
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {t("venueOverview.kpis.needsAttention", { defaultValue: "Needs Attention" })}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {attentionCount > 0
                    ? t("venueOverview.kpis.signalsPending", {
                        count: attentionCount,
                        defaultValue: `${attentionCount} operational signal(s)`,
                      })
                    : t("venueOverview.kpis.allClear", { defaultValue: "All signals clear" })}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Link href="/venue/resources" className="block group">
          <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Layers className="size-5" aria-hidden="true" />
                </div>
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {kpis.activeResourcesCount}
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {t("venueOverview.kpis.activeResources", { defaultValue: "Active Resources" })}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {t("venueOverview.kpis.activeResourcesSubtext", {
                    defaultValue: "Featured in today's schedule",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Metric 5 — Sports Hero Promo Card (Keep the games going) */}
      <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white flex flex-col justify-between group">
        {/* Subtle sports court mesh pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-blue-600/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-900/40 border border-blue-700/50 px-2 py-0.5 rounded-full">
            SCRIPE Venue
          </span>
          <Sparkles className="size-4 text-blue-400" />
        </div>

        <div className="relative z-10 mt-3 space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base leading-tight text-white tracking-tight">
            {t("venueOverview.kpis.heroTitle", { defaultValue: "Keep the games going" })}
          </h3>
          <p className="text-[11px] text-slate-300 leading-snug">
            {t("venueOverview.kpis.heroSubtitle", { defaultValue: "More bookings. Happier players. A better venue." })}
          </p>
        </div>
      </div>
    </div>
  );
}
