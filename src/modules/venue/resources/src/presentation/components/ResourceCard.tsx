"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CircleDollarSign,
  Edit,
  Plus,
  MoreHorizontal,
  MapPin,
  Sliders,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import {
  type ResourceWorkspaceItem,
  evaluateCourtReadiness,
} from "../../domain/entities/ResourceWorkspaceItem";

interface Props {
  item: ResourceWorkspaceItem;
}

const COURT_BG: Record<string, string> = {
  padel: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
  football: "linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)",
  tennis: "linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)",
  default: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
};

function getCourtBg(sportType?: string, name?: string): string {
  const s = (sportType || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (s.includes("padel") || n.includes("padel")) return COURT_BG.padel;
  if (s.includes("foot") || n.includes("foot") || n.includes("pitch")) return COURT_BG.football;
  if (s.includes("tennis") || n.includes("tennis")) return COURT_BG.tennis;
  return COURT_BG.default;
}

export function ResourceCard({ item }: Props) {
  const { t } = useI18n();

  const readiness = evaluateCourtReadiness({
    isPublished: item.isPublished,
    profileId: item.profileId,
    slotDurationMinutes: item.slotDurationMinutes,
    pricePerSlot: item.pricePerSlot,
    hasCalendar: item.isOpen247 || Boolean(item.workingHoursSummary),
  });

  const isReady = readiness.state === "Active";

  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all">
      {/* Left Column: Court Thumbnail with sports line aesthetics */}
      <div
        className="h-36 sm:h-auto sm:w-40 relative p-3 flex flex-col justify-between shrink-0 overflow-hidden"
        style={{ background: getCourtBg(item.sportType, item.name) }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
        {/* Subtle sports court line markings */}
        <div className="absolute inset-2 border border-white/25 rounded-xs pointer-events-none" />
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-white/25 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {item.sportType || "Court"}
          </span>
        </div>
      </div>

      {/* Right Column: Court Details & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Top Row: Name, Status Pill, and Options */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </h3>
                {isReady ? (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    {t("resources.card.statusPublished", { defaultValue: "Active" })}
                  </span>
                ) : (
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    title={readiness.missingActions.map((a) => a.label).join(", ")}
                  >
                    {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <span>{item.sportType ? `${item.sportType} Court` : "Court"}</span>
                {item.facilityName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-slate-400" />
                      <span>{item.facilityName}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Court options"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>

          {/* Metadata Row: Slot duration & Price */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400" />
              <span className="font-semibold">
                {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CircleDollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-900 dark:text-white">
                {item.pricePerSlot != null ? (
                  <>
                    {item.pricePerSlot} {item.currencyCode}{" "}
                    <span className="text-[11px] font-normal text-slate-400">
                      {t("resources.card.perSlot", { defaultValue: "/ slot" })}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">Not set</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {isReady ? (
            <Button
              asChild
              size="sm"
              className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex-1"
            >
              <Link href={`/venue/bookings/new?resourceId=${encodeURIComponent(item.id)}`}>
                <Plus className="size-3.5 mr-1" />
                <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs font-bold text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex-1"
              title={readiness.missingActions.map((a) => a.label).join(", ")}
            >
              <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
                <Sliders className="size-3.5 mr-1" />
                <span>{t("resources.card.completeSetup", { defaultValue: "Complete Setup" })}</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold rounded-lg flex-1"
          >
            <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
              <Edit className="size-3.5 mr-1" />
              <span>{t("resources.card.viewEdit", { defaultValue: "Edit" })}</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg shrink-0"
            title={t("resources.card.calendar", { defaultValue: "Calendar" })}
          >
            <Link href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`}>
              <CalendarDays className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
