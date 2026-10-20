"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarCheck2, Clock4, Layers, LogIn, ShieldAlert } from "lucide-react";
import { cn } from "@core/common/utils";
import { Card, CardContent } from "@core/ui/card";
import type { VenueOverviewKpiData } from "../../domain/entities/VenueOverview";

interface Props {
  kpis: VenueOverviewKpiData;
  attentionCount?: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/** Renders the operational summary metrics for the current venue. */
export function VenueOverviewKpiStrip({ kpis, attentionCount, t }: Props) {
  let holdsSubtext = t("venueOverview.kpis.noActiveHolds", { defaultValue: "No active holds" });
  if (kpis.activeHoldsCount > 0 && kpis.nearestHoldExpiryUtc) {
    const expiryTimestamp = Date.parse(kpis.nearestHoldExpiryUtc);
    if (Number.isFinite(expiryTimestamp)) {
      const expiryTimeUtc = `${new Date(expiryTimestamp).toISOString().slice(11, 16)} UTC`;
      holdsSubtext = t("venueOverview.kpis.nearestExpiry", { time: expiryTimeUtc });
    }
  }

  return (
    <div
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="venue-overview-kpi-strip"
    >
      <Link href="/venue/calendar" className="group block">
        <Card className="hover:border-nx-accent/50 border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm">
          <CardContent className="flex items-center gap-3.5 p-4">
            <div className="border-nx-accent/30 bg-nx-accent/10 group-hover:bg-nx-accent/20 flex size-11 shrink-0 items-center justify-center rounded-nx-md border text-nx-accent transition-colors">
              <CalendarCheck2 className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <MetricHeading t={t} label="todayReservations" />
              <MetricValue>{kpis.todayReservationsCount}</MetricValue>
              <MetricSubtext>
                {t("venueOverview.kpis.todayReservationsSubtext", {
                  confirmed: kpis.todayReservationsConfirmedCount,
                  checkedIn: kpis.todayReservationsCheckedInCount,
                  defaultValue: `${kpis.todayReservationsConfirmedCount} confirmed · ${kpis.todayReservationsCheckedInCount} checked in`,
                })}
              </MetricSubtext>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/venue/calendar" className="group block">
        <Card className="border-nx-line bg-nx-surface transition-all duration-nx-micro hover:border-success/50 hover:shadow-nx-sm">
          <CardContent className="flex items-center gap-3.5 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-success/30 bg-success/10 text-success transition-colors group-hover:bg-success/20">
              <LogIn className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <MetricHeading t={t} label="checkedInNow" />
              <MetricValue>{kpis.checkedInNowCount}</MetricValue>
              <MetricSubtext>
                {t("venueOverview.kpis.checkedInNowSubtext", {
                  defaultValue: "Currently in session",
                })}
              </MetricSubtext>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/venue/calendar" className="group block">
        <Card className="border-nx-line bg-nx-surface transition-all duration-nx-micro hover:border-amber-500/50 hover:shadow-nx-sm">
          <CardContent className="flex items-center gap-3.5 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-amber-500/30 bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:text-amber-400">
              <Clock4 className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <MetricHeading t={t} label="activeHolds" />
              <MetricValue>{kpis.activeHoldsCount}</MetricValue>
              <MetricSubtext>{holdsSubtext}</MetricSubtext>
            </div>
          </CardContent>
        </Card>
      </Link>

      {attentionCount !== undefined ? (
        <Link href="/venue/attention" className="group block">
          <Card
            className={cn(
              "border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm",
              attentionCount > 0 && "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
            )}
          >
            <CardContent className="flex items-center gap-3.5 p-4">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-nx-md border transition-colors",
                  attentionCount > 0
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-nx-surfaceSubtle border-nx-line text-nx-ink-2"
                )}
              >
                <ShieldAlert className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <MetricHeading t={t} label="needsAttention" />
                <MetricValue>{attentionCount}</MetricValue>
                <MetricSubtext>
                  {attentionCount > 0
                    ? t("venueOverview.kpis.signalsPending", {
                        count: attentionCount,
                        defaultValue: `${attentionCount} operational signal(s)`,
                      })
                    : t("venueOverview.kpis.allClear", { defaultValue: "All signals clear" })}
                </MetricSubtext>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Link href="/venue/facilities" className="group block">
          <Card className="hover:border-nx-accent/50 border-nx-line bg-nx-surface transition-all duration-nx-micro hover:shadow-nx-sm">
            <CardContent className="flex items-center gap-3.5 p-4">
              <div className="bg-nx-surfaceSubtle flex size-11 shrink-0 items-center justify-center rounded-nx-md border border-nx-line text-nx-ink-2 transition-colors group-hover:bg-nx-hover">
                <Layers className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <MetricHeading t={t} label="activeResources" />
                <MetricValue>{kpis.activeResourcesCount}</MetricValue>
                <MetricSubtext>
                  {t("venueOverview.kpis.activeResourcesSubtext", {
                    defaultValue: "Featured in today's schedule",
                  })}
                </MetricSubtext>
              </div>
              <ArrowUpRight
                className="size-3 shrink-0 text-nx-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}

function MetricHeading({ t, label }: { t: Props["t"]; label: string }) {
  return (
    <p className="truncate text-xs font-semibold text-nx-ink-2">
      {t(`venueOverview.kpis.${label}`, { defaultValue: label })}
    </p>
  );
}

function MetricValue({ children }: { children: ReactNode }) {
  return <div className="mt-0.5 text-2xl font-bold tabular-nums text-nx-ink">{children}</div>;
}

function MetricSubtext({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 truncate text-[11px] text-nx-ink-3">{children}</p>;
}
