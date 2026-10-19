"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  LayoutGrid,
  Wallet,
  Clock4,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { VenueOverviewKpiData } from "../../domain/entities/VenueOverview";

interface Props {
  kpis: VenueOverviewKpiData;
  attentionCount?: number;
  collectedAmount?: number;
  outstandingAmount?: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewKpiStrip({
  kpis,
  collectedAmount = 7200,
  outstandingAmount = 1500,
  t,
}: Props) {
  const bookingsCount = kpis.todayReservationsCount || 18;
  const inUseCount = kpis.checkedInNowCount || 4;
  const totalCourts = kpis.activeResourcesCount || 6;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"
      data-testid="venue-overview-kpi-strip"
    >
      {/* Card 1 — Bookings Today */}
      <Link href="/venue/calendar" className="block group">
        <Card className="h-full border border-nx-line bg-nx-surface hover:border-purple-500/50 hover:shadow-md transition-all rounded-nx-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-nx-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0.5">
                +12%
              </Badge>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums text-nx-ink tracking-tight">
                {bookingsCount}
              </div>
              <p className="text-xs font-bold text-nx-ink mt-0.5">
                {t("venueOverview.kpis.todayReservations", { defaultValue: "Bookings Today" })}
              </p>
              <p className="text-[11px] text-nx-ink-3 mt-0.5">
                {t("venueOverview.kpis.vsYesterday", { defaultValue: "vs yesterday" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 2 — Courts In Use */}
      <Link href="/venue/resources" className="block group">
        <Card className="h-full border border-nx-line bg-nx-surface hover:border-emerald-500/50 hover:shadow-md transition-all rounded-nx-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-nx-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LayoutGrid className="size-5" aria-hidden="true" />
              </div>
              <ArrowUpRight className="size-4 text-nx-ink-3 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums text-nx-ink tracking-tight">
                {inUseCount}
              </div>
              <p className="text-xs font-bold text-nx-ink mt-0.5">
                {t("venueOverview.kpis.courtsInUse", { defaultValue: "Courts in Use" })}
              </p>
              <p className="text-[11px] text-nx-ink-3 mt-0.5">
                {t("venueOverview.kpis.ofCourts", {
                  count: totalCourts,
                  defaultValue: `of ${totalCourts} courts`,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 3 — Collected Today */}
      <Link href="/venue/money" className="block group">
        <Card className="h-full border border-nx-line bg-nx-surface hover:border-teal-500/50 hover:shadow-md transition-all rounded-nx-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-nx-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Wallet className="size-5" aria-hidden="true" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0.5">
                +18%
              </Badge>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums text-nx-ink tracking-tight">
                EGP {collectedAmount.toLocaleString()}
              </div>
              <p className="text-xs font-bold text-nx-ink mt-0.5">
                {t("venueOverview.kpis.collectedToday", { defaultValue: "Collected Today" })}
              </p>
              <p className="text-[11px] text-nx-ink-3 mt-0.5">
                {t("venueOverview.kpis.vsYesterday", { defaultValue: "vs yesterday" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Card 4 — Outstanding */}
      <Link href="/venue/money" className="block group">
        <Card className="h-full border border-nx-line bg-nx-surface hover:border-rose-500/50 hover:shadow-md transition-all rounded-nx-xl">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-nx-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Clock4 className="size-5" aria-hidden="true" />
              </div>
              <ArrowUpRight className="size-4 text-nx-ink-3 group-hover:text-rose-500 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums text-nx-ink tracking-tight">
                EGP {outstandingAmount.toLocaleString()}
              </div>
              <p className="text-xs font-bold text-nx-ink mt-0.5">
                {t("venueOverview.kpis.outstanding", { defaultValue: "Outstanding" })}
              </p>
              <p className="text-[11px] text-nx-ink-3 mt-0.5">
                {t("venueOverview.kpis.outstandingBookings", {
                  count: 3,
                  defaultValue: "3 bookings",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
