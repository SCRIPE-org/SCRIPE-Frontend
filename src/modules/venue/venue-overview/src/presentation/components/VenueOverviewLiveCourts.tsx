"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@core/ui/card";
import { MoreHorizontal } from "lucide-react";
import type {
  VenueOverviewResourceActivityItem,
  VenueOverviewState,
} from "../../domain/entities/VenueOverview";

interface VenueOverviewLiveCourtsProps {
  items?: VenueOverviewResourceActivityItem[];
  overview?: VenueOverviewState | null;
  t: (key: string, options?: any) => string;
}

// Preset visual court fixtures matching the design references when backend data is sparse
const DEFAULT_PRESET_COURTS = [
  {
    name: "Padel 1",
    image: "/images/venue/padel-court-indoor.svg",
    status: "In Use",
    statusVariant: "inUse" as const,
    time: "10:00 - 11:00",
    occupant: "Ahmed Salah",
    avatar: "AS",
  },
  {
    name: "Padel 2",
    image: "/images/venue/padel-court-indoor.svg",
    status: "In Use",
    statusVariant: "inUse" as const,
    time: "10:00 - 11:00",
    occupant: "Team Warriors",
    avatar: "TW",
  },
  {
    name: "Padel 3",
    image: "/images/venue/padel-court-outdoor.svg",
    status: "Free",
    statusVariant: "free" as const,
    time: "Next: 12:00",
    occupant: "—",
    avatar: "",
  },
  {
    name: "Football A",
    image: "/images/venue/football-turf-night.svg",
    status: "In Use",
    statusVariant: "inUse" as const,
    time: "10:00 - 11:00",
    occupant: "Sara & Friends",
    avatar: "SF",
  },
  {
    name: "Football B",
    image: "/images/venue/football-turf-night.svg",
    status: "Maintenance",
    statusVariant: "maintenance" as const,
    time: "Until 16:00",
    occupant: "—",
    avatar: "",
  },
];

export function VenueOverviewLiveCourts({
  items,
  overview,
  t,
}: VenueOverviewLiveCourtsProps) {
  const backendCourts = items || overview?.resourceActivity || [];

  // Map backend courts to rich visual cards, or use presentation presets if no active bookings exist
  const displayCourts =
    backendCourts.length > 0
      ? backendCourts.slice(0, 5).map((court, idx) => {
          const isFootball = court.resourceName.toLowerCase().includes("foot") || court.resourceName.toLowerCase().includes("pitch");
          const isOutdoor = court.resourceName.toLowerCase().includes("out") || idx === 2;
          const image = isFootball
            ? "/images/venue/football-turf-night.svg"
            : isOutdoor
            ? "/images/venue/padel-court-outdoor.svg"
            : "/images/venue/padel-court-indoor.svg";

          const isCheckedIn = court.statusLabel === "checkedIn";
          const isMaintenance = court.statusLabel === ("maintenance" as string);

          let status = "Free";
          let statusVariant: "inUse" | "free" | "maintenance" = "free";
          let time = "Available";
          let occupant = "—";
          let avatar = "";

          if (isCheckedIn) {
            status = "In Use";
            statusVariant = "inUse";
            const end = court.currentOrNextEndUtc?.slice(11, 16) || "11:00";
            const start = court.currentOrNextStartUtc?.slice(11, 16) || "10:00";
            time = `${start} - ${end}`;
            occupant = "Active Match";
            avatar = "AM";
          } else if (isMaintenance) {
            status = "Maintenance";
            statusVariant = "maintenance";
            time = "Until 16:00";
          } else if (court.currentOrNextStartUtc) {
            const nextTime = court.currentOrNextStartUtc.slice(11, 16);
            time = `Next: ${nextTime}`;
          }

          return {
            name: court.resourceName,
            image,
            status,
            statusVariant,
            time,
            occupant,
            avatar,
          };
        })
      : DEFAULT_PRESET_COURTS;

  return (
    <div className="space-y-3.5" data-testid="venue-overview-live-courts">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-nx-ink">
          {t("venueOverview.liveCourts.title", { defaultValue: "Live Courts" })}
        </h2>
        <Link
          href="/venue/resources"
          className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
        >
          {t("venueOverview.liveCourts.viewAll", { defaultValue: "View All" })}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayCourts.map((court, idx) => {
          let badgeBg = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
          if (court.statusVariant === "inUse") {
            badgeBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
          } else if (court.statusVariant === "maintenance") {
            badgeBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
          }

          return (
            <Card
              key={`${court.name}-${idx}`}
              className="overflow-hidden border border-nx-line bg-nx-surface shadow-xs hover:shadow-md transition-all rounded-nx-xl flex flex-col justify-between"
            >
              <div>
                {/* Court Photo Header */}
                <div
                  className="h-24 w-full bg-cover bg-center relative p-2.5 flex items-start justify-end"
                  style={{ backgroundImage: `url(${court.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <button
                    type="button"
                    className="relative z-10 size-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                    aria-label="Court options"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>

                {/* Court Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-nx-ink truncate">
                      {court.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${badgeBg}`}
                    >
                      {court.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {court.time}
                  </div>
                </div>
              </div>

              {/* Occupant Avatar + Name */}
              <div className="px-3 pb-3 pt-1 border-t border-nx-line/50 flex items-center gap-2">
                {court.avatar ? (
                  <div className="size-5 rounded-full bg-nx-accent/20 text-nx-accent font-bold text-[9px] flex items-center justify-center shrink-0">
                    {court.avatar}
                  </div>
                ) : (
                  <div className="size-5 rounded-full bg-nx-surfaceSubtle text-nx-ink-3 font-medium text-[9px] flex items-center justify-center shrink-0">
                    —
                  </div>
                )}
                <span className="text-[11px] text-nx-ink-2 truncate font-medium">
                  {court.occupant}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
