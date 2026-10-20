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
  DollarSign,
  Wrench,
  Calendar,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import {
  type ResourceWorkspaceItem,
  evaluateCourtReadiness,
} from "../../domain/entities/ResourceWorkspaceItem";

interface Props {
  item: ResourceWorkspaceItem;
}

function getCourtImage(sportType?: string, name?: string): string {
  const s = (sportType || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (s.includes("foot") || n.includes("foot") || n.includes("pitch") || s.includes("soccer")) {
    return "/images/venue/football-turf-night.svg";
  }
  if (n.includes("2") || n.includes("outdoor") || s.includes("outdoor")) {
    return "/images/venue/padel-court-outdoor.svg";
  }
  return "/images/venue/padel-court-indoor.svg";
}

export function ResourceCard({ item }: Props) {
  const { t } = useI18n();

  const readiness = evaluateCourtReadiness({
    isPublished: item.isPublished,
    profileId: item.profileId,
    slotDurationMinutes: item.slotDurationMinutes,
    pricePerSlot: item.pricePerSlot,
    priceEffectiveFromUtc: item.priceEffectiveFromUtc,
    hasCalendar: item.hasCalendar ?? (item.isOpen247 || Boolean(item.workingHoursSummary && item.workingHoursSummary !== "Schedule Not Set")),
  });

  const isReady = readiness.state === "Ready" || readiness.state === "Active";
  const isActivating = readiness.state === "Pricing Activating";
  const isSetupRequired = readiness.state === "Setup Required";
  const isUnavailable = readiness.state === "Unavailable";

  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden border border-nx-border bg-nx-surface rounded-2xl shadow-xs hover:shadow-md transition-all group">
      {/* Left Column: Court Photo Thumbnail */}
      <div className="h-40 sm:h-auto sm:w-44 relative shrink-0 overflow-hidden bg-nx-raised">
        <img
          src={getCourtImage(item.sportType, item.name)}
          alt={item.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/20">
            {item.sportType || t("resources.card.court", { defaultValue: "Court" })}
          </span>
        </div>
      </div>

      {/* Right Column: Court Details & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Top Row: Name, Status Pill, and Options Menu */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-nx-ink truncate">
                  {item.name}
                </h3>
                {isReady ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {t("resources.card.statusReady", { defaultValue: "Ready" })}
                  </span>
                ) : isActivating ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                    title={t("resources.card.activatingTooltip", {
                      defaultValue:
                        "Pricing is activating on the network and will become effective shortly. Bookings cannot be accepted until activation completes.",
                    })}
                  >
                    <Clock className="size-2.5 text-sky-500" />
                    {t("resources.card.statusActivating", { defaultValue: "Pricing Activating" })}
                  </span>
                ) : isUnavailable ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                    <span className="size-1.5 rounded-full bg-slate-500" />
                    {t("resources.card.statusUnavailable", { defaultValue: "Unavailable" })}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    title={readiness.missingActions.map((a) => a.label).join(", ")}
                  >
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}
                  </span>
                )}
              </div>
              <p className="text-xs text-nx-ink-2 mt-1 flex items-center gap-1.5 font-medium">
                <span>{item.sportType ? t("resources.card.sportCourt", { defaultValue: "{{sport}} Court", sport: item.sportType }) : t("resources.card.court", { defaultValue: "Court" })}</span>
                {item.facilityName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-nx-ink-3" />
                      <span>{item.facilityName}</span>
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Functional Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="p-1 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised rounded-md transition-colors"
                  aria-label={t("resources.card.optionsFor", { defaultValue: "Options for {{name}}", name: item.name })}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-nx-ink-3">
                  {t("resources.card.options", { defaultValue: "Court Options" })}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`} className="gap-2 cursor-pointer">
                    <Calendar className="size-3.5" />
                    <span>{t("resources.card.viewCalendar", { defaultValue: "View on Calendar" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/venue/resources/${encodeURIComponent(item.id)}`} className="gap-2 cursor-pointer">
                    <Edit className="size-3.5" />
                    <span>{t("resources.card.edit", { defaultValue: "Edit Court Details" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/venue/resources/${encodeURIComponent(item.id)}?tab=workingHours`} className="gap-2 cursor-pointer">
                    <Clock className="size-3.5" />
                    <span>{t("resources.card.operatingHours", { defaultValue: "Operating Hours" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/venue/resources/${encodeURIComponent(item.id)}?tab=bookingRules`} className="gap-2 cursor-pointer">
                    <Sliders className="size-3.5" />
                    <span>{t("resources.tabs.bookingRules", { defaultValue: "Booking Rules" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/venue/resources/${encodeURIComponent(item.id)}?tab=pricing`} className="gap-2 cursor-pointer">
                    <DollarSign className="size-3.5" />
                    <span>{t("resources.card.pricingRates", { defaultValue: "Pricing & Rates" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/venue/resources/${encodeURIComponent(item.id)}?tab=closures`} className="gap-2 cursor-pointer">
                    <Wrench className="size-3.5" />
                    <span>{t("resources.card.maintenanceClosures", { defaultValue: "Maintenance & Closures" })}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata Row: Source-Backed Schedule, Slot duration & Price */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            {/* Operating Schedule */}
            <div className="flex items-center gap-1.5 bg-nx-raised/60 px-2 py-1 rounded-md text-nx-ink font-semibold">
              <Clock className="size-3.5 text-nx-ink-3" />
              <span>{item.workingHoursSummary || (item.isOpen247 ? t("resources.card.open247", { defaultValue: "Open 24/7" }) : t("resources.card.scheduleNotSet", { defaultValue: "Schedule Not Set" }))}</span>
            </div>

            {/* Slot duration */}
            <div className="flex items-center gap-1.5 bg-nx-raised/60 px-2 py-1 rounded-md text-nx-ink font-semibold">
              <span>
                {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
              </span>
            </div>

            {/* Price per slot */}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-[#C6FF00]/10 border border-emerald-500/20 dark:border-[#C6FF00]/20 px-2 py-1 rounded-md text-emerald-700 dark:text-[#C6FF00] font-bold">
              <CircleDollarSign className="size-3.5" />
              <span>
                {item.pricePerSlot != null ? (
                  <>
                    {item.pricePerSlot} {item.currencyCode}{" "}
                    <span className="text-[10px] font-normal text-nx-ink-3">
                      {t("resources.card.perSlot", { defaultValue: "/ slot" })}
                    </span>
                  </>
                ) : (
                  <span className="text-nx-ink-3 italic font-normal">{t("resources.card.notConfigured", { defaultValue: "Not set" })}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-nx-border flex items-center gap-2">
          {isReady ? (
            <Button
              asChild
              size="sm"
              className="h-8 text-xs font-bold bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0D0D0E] rounded-xl flex-1 shadow-sm"
            >
              <Link
                href={`/venue/calendar?newBooking=true&resourceId=${encodeURIComponent(
                  item.id
                )}&facilityId=${encodeURIComponent(item.facilityId)}`}
              >
                <Plus className="size-3.5 mr-1" />
                <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
              </Link>
            </Button>
          ) : isActivating ? (
            <Button
              size="sm"
              disabled
              className="h-8 text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-xl flex-1 cursor-not-allowed opacity-90"
              title={t("resources.card.activatingTooltip", {
                defaultValue:
                  "Pricing is activating on the network and will become effective shortly. Bookings cannot be accepted until activation completes.",
              })}
            >
              <Clock className="size-3.5 mr-1 animate-pulse" />
              <span>{t("resources.card.activatingButton", { defaultValue: "Activating..." })}</span>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs font-bold text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl flex-1"
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
            className="h-8 text-xs font-semibold rounded-xl flex-1 border-nx-border hover:bg-nx-raised"
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
            className="h-8 w-8 text-nx-ink-3 hover:text-nx-ink rounded-xl shrink-0"
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
