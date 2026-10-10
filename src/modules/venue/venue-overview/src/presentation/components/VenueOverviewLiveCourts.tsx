"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal, User, Sparkles } from "lucide-react";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { VenueOverviewResourceActivityItem } from "../../domain/entities/VenueOverview";

interface Props {
  items: VenueOverviewResourceActivityItem[];
  t: (key: string, values?: Record<string, string | number>) => string;
}

// Sports imagery palettes for court cards
const COURT_BACKGROUNDS: Record<string, string> = {
  padel: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
  football: "linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)",
  tennis: "linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)",
  default: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
};

function getCourtBg(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("padel")) return COURT_BACKGROUNDS.padel;
  if (lower.includes("foot") || lower.includes("pitch")) return COURT_BACKGROUNDS.football;
  if (lower.includes("tennis")) return COURT_BACKGROUNDS.tennis;
  return COURT_BACKGROUNDS.default;
}

export function VenueOverviewLiveCourts({ items, t }: Props) {
  // Take up to 5 courts to match approved layout
  const displayCourts = items.slice(0, 5);

  return (
    <div className="space-y-3" data-testid="venue-overview-live-courts">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t("venueOverview.liveCourts.title", { defaultValue: "Live Courts" })}
        </h2>
        <Link
          href="/venue/resources"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
        >
          {t("venueOverview.liveCourts.viewAll", { defaultValue: "View All" })}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayCourts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {t("venueOverview.liveCourts.noCourts", { defaultValue: "No active courts configured" })}
          </div>
        ) : (
          displayCourts.map((court, idx) => {
            const isCheckedIn = court.statusLabel === "checkedIn";
            const isNext = court.statusLabel === "nextBooking";
            const isMaintenance = court.statusLabel === ("maintenance" as string);

            let statusText = t("venueOverview.liveCourts.idle", { defaultValue: "No Current Booking" });
            let statusBadge = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
            let timeText = t("venueOverview.resourceActivity.status.noActiveBooking", { defaultValue: "No Active Booking" });

            if (isCheckedIn && court.currentOrNextEndUtc) {
              statusText = t("venueOverview.liveCourts.inUse", { defaultValue: "In Use" });
              statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
              const time = court.currentOrNextEndUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.until", { time, defaultValue: `Until ${time}` });
            } else if (isNext && court.currentOrNextStartUtc) {
              statusText = t("venueOverview.liveCourts.booked", { defaultValue: "Booked" });
              statusBadge = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
              const time = court.currentOrNextStartUtc.slice(11, 16);
              timeText = t("venueOverview.liveCourts.next", { time, defaultValue: `Next: ${time}` });
            } else if (isMaintenance) {
              statusText = t("venueOverview.liveCourts.maintenance", { defaultValue: "Maintenance" });
              statusBadge = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
              timeText = t("venueOverview.liveCourts.blocked", { defaultValue: "Blocked" });
            }

            return (
              <Card
                key={court.resourceId || idx}
                className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all rounded-xl"
              >
                {/* Court Thumbnail Image with Court Line Aesthetics */}
                <div
                  className="h-20 w-full relative p-2 flex flex-col justify-between overflow-hidden"
                  style={{ background: getCourtBg(court.resourceName) }}
                >
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
                  {/* Subtle sports court line markings */}
                  <div className="absolute inset-x-2 inset-y-1 border border-white/20 rounded-xs pointer-events-none" />
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-white/20 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 bg-black/40 px-1.5 py-0.5 rounded-sm backdrop-blur-xs">
                      {court.resourceName.includes("Padel") ? "Padel" : court.resourceName.includes("Foot") ? "Football" : "Court"}
                    </span>
                  </div>
                </div>

                {/* Court Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {court.resourceName}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm"
                      aria-label="Court options"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </div>

                  {/* Status Pill */}
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  {/* Time info */}
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {timeText}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    <User className="size-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {isCheckedIn
                        ? t("venueOverview.liveCourts.activeNow", { defaultValue: "Active Match" })
                        : isNext
                        ? t("venueOverview.liveCourts.reserved", { defaultValue: "Reserved" })
                        : "—"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
