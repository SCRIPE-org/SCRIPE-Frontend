"use client";

import { CalendarCheck2, Clock4, LogIn, Layers } from "lucide-react";
import { Card, CardContent } from "@core/ui/card";
import type { VenueOverviewKpiData } from "../../domain/entities/VenueOverview";

interface Props {
  kpis: VenueOverviewKpiData;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewKpiStrip({ kpis, t }: Props) {
  // Format expiry subtext for active holds
  let holdsSubtext = t("venueOverview.kpis.noActiveHolds");
  if (kpis.activeHoldsCount > 0 && kpis.nearestHoldExpiryUtc) {
    const diffMins = Math.max(
      0,
      Math.round(
        (new Date(kpis.nearestHoldExpiryUtc).getTime() - new Date().getTime()) / 60000
      )
    );
    holdsSubtext = t("venueOverview.kpis.nearestExpiry", { mins: diffMins });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Metric 1 — Today's Reservations */}
      <Card className="border-nx-line bg-nx-surface transition-shadow hover:shadow-nx-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nx-ink-2">
              {t("venueOverview.kpis.todayReservations")}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm border border-info/30 bg-info/10 text-info">
              <CalendarCheck2 className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-nx-ink">
              {kpis.todayReservationsCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-nx-ink-3 tabular-nums">
            {t("venueOverview.kpis.todayReservationsSubtext", {
              confirmed: kpis.todayReservationsConfirmedCount,
              checkedIn: kpis.todayReservationsCheckedInCount,
            })}
          </p>
        </CardContent>
      </Card>

      {/* Metric 2 — Active Holds */}
      <Card className="border-nx-line bg-nx-surface transition-shadow hover:shadow-nx-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nx-ink-2">
              {t("venueOverview.kpis.activeHolds")}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm border border-warning/30 bg-warning/10 text-warning-strong">
              <Clock4 className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-nx-ink">
              {kpis.activeHoldsCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-nx-ink-3 tabular-nums">
            {holdsSubtext}
          </p>
        </CardContent>
      </Card>

      {/* Metric 3 — Checked In Now */}
      <Card className="border-nx-line bg-nx-surface transition-shadow hover:shadow-nx-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nx-ink-2">
              {t("venueOverview.kpis.checkedInNow")}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm border border-success/30 bg-success/10 text-success">
              <LogIn className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-nx-ink">
              {kpis.checkedInNowCount}
            </span>
            {kpis.checkedInNowCount > 0 && (
              <span className="flex size-2 rounded-full bg-cyan-500 animate-pulse" aria-hidden="true" />
            )}
          </div>
          <p className="mt-1 text-xs text-nx-ink-3">
            {t("venueOverview.kpis.checkedInNowSubtext")}
          </p>
        </CardContent>
      </Card>

      {/* Metric 4 — Active Resources Today */}
      <Card className="border-nx-line bg-nx-surface transition-shadow hover:shadow-nx-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nx-ink-2">
              {t("venueOverview.kpis.activeResources")}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm border border-nx-line bg-nx-surfaceSubtle text-nx-ink-2">
              <Layers className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-nx-ink">
              {kpis.activeResourcesCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-nx-ink-3">
            {t("venueOverview.kpis.activeResourcesSubtext")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
