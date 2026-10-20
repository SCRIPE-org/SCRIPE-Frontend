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
    hasCalendar:
      item.hasCalendar ??
      (item.isOpen247 ||
        Boolean(item.workingHoursSummary && item.workingHoursSummary !== "Schedule Not Set")),
  });

  const isReady = readiness.state === "Ready" || readiness.state === "Active";
  const isActivating = readiness.state === "Pricing Activating";
  const isSetupRequired = readiness.state === "Setup Required";
  const isUnavailable = readiness.state === "Unavailable";

  return (
    <Card className="border-nx-border shadow-xs group flex flex-col overflow-hidden rounded-2xl border bg-nx-surface transition-all hover:shadow-md sm:flex-row">
      {/* Left Column: Court Photo Thumbnail */}
      <div className="relative h-40 shrink-0 overflow-hidden bg-nx-raised sm:h-auto sm:w-44">
        <img
          src={getCourtImage(item.sportType, item.name)}
          alt={item.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute left-2.5 top-2.5 z-10">
          <span className="backdrop-blur-xs rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            {item.sportType || t("resources.card.court", { defaultValue: "Court" })}
          </span>
        </div>
      </div>

      {/* Right Column: Court Details & Actions */}
      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div>
          {/* Top Row: Name, Status Pill, and Options Menu */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold text-nx-ink">{item.name}</h3>
                {isReady ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {t("resources.card.statusReady", { defaultValue: "Ready" })}
                  </span>
                ) : isActivating ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400"
                    title={t("resources.card.activatingTooltip", {
                      defaultValue:
                        "Pricing is activating on the network and will become effective shortly. Bookings cannot be accepted until activation completes.",
                    })}
                  >
                    <Clock className="size-2.5 text-sky-500" />
                    {t("resources.card.statusActivating", { defaultValue: "Pricing Activating" })}
                  </span>
                ) : isUnavailable ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="size-1.5 rounded-full bg-slate-500" />
                    {t("resources.card.statusUnavailable", { defaultValue: "Unavailable" })}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                    title={readiness.missingActions.map((a) => a.label).join(", ")}
                  >
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-nx-ink-2">
                <span>
                  {item.sportType
                    ? t("resources.card.sportCourt", {
                        defaultValue: "{{sport}} Court",
                        sport: item.sportType,
                      })
                    : t("resources.card.court", { defaultValue: "Court" })}
                </span>
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
                  className="rounded-md p-1 text-nx-ink-3 transition-colors hover:bg-nx-raised hover:text-nx-ink"
                  aria-label={t("resources.card.optionsFor", {
                    defaultValue: "Options for {{name}}",
                    name: item.name,
                  })}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-nx-ink-3">
                  {t("resources.card.options", { defaultValue: "Court Options" })}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`}
                    className="cursor-pointer gap-2"
                  >
                    <Calendar className="size-3.5" />
                    <span>
                      {t("resources.card.viewCalendar", { defaultValue: "View on Calendar" })}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/resources/${encodeURIComponent(item.id)}`}
                    className="cursor-pointer gap-2"
                  >
                    <Edit className="size-3.5" />
                    <span>{t("resources.card.edit", { defaultValue: "Edit Court Details" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/resources/${encodeURIComponent(item.id)}?tab=workingHours`}
                    className="cursor-pointer gap-2"
                  >
                    <Clock className="size-3.5" />
                    <span>
                      {t("resources.card.operatingHours", { defaultValue: "Operating Hours" })}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/resources/${encodeURIComponent(item.id)}?tab=bookingRules`}
                    className="cursor-pointer gap-2"
                  >
                    <Sliders className="size-3.5" />
                    <span>
                      {t("resources.tabs.bookingRules", { defaultValue: "Booking Rules" })}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/resources/${encodeURIComponent(item.id)}?tab=pricing`}
                    className="cursor-pointer gap-2"
                  >
                    <DollarSign className="size-3.5" />
                    <span>
                      {t("resources.card.pricingRates", { defaultValue: "Pricing & Rates" })}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/venue/resources/${encodeURIComponent(item.id)}?tab=closures`}
                    className="cursor-pointer gap-2"
                  >
                    <Wrench className="size-3.5" />
                    <span>
                      {t("resources.card.maintenanceClosures", {
                        defaultValue: "Maintenance & Closures",
                      })}
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata Row: Source-Backed Schedule, Slot duration & Price */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {/* Operating Schedule */}
            <div className="bg-nx-raised/60 flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-nx-ink">
              <Clock className="size-3.5 text-nx-ink-3" />
              <span>
                {item.workingHoursSummary ||
                  (item.isOpen247
                    ? t("resources.card.open247", { defaultValue: "Open 24/7" })
                    : t("resources.card.scheduleNotSet", { defaultValue: "Schedule Not Set" }))}
              </span>
            </div>

            {/* Slot duration */}
            <div className="bg-nx-raised/60 flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-nx-ink">
              <span>
                {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
              </span>
            </div>

            {/* Price per slot */}
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-bold text-emerald-700 dark:border-[#C6FF00]/20 dark:bg-[#C6FF00]/10 dark:text-[#C6FF00]">
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
                  <span className="font-normal italic text-nx-ink-3">
                    {t("resources.card.notConfigured", { defaultValue: "Not set" })}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="border-nx-border flex items-center gap-2 border-t pt-2">
          {isReady ? (
            <Button
              asChild
              size="sm"
              className="h-8 flex-1 rounded-xl bg-[#C6FF00] text-xs font-bold text-[#0D0D0E] shadow-sm hover:bg-[#b5eb00]"
            >
              <Link
                href={`/venue/calendar?newBooking=true&resourceId=${encodeURIComponent(
                  item.id
                )}&facilityId=${encodeURIComponent(item.facilityId)}`}
              >
                <Plus className="mr-1 size-3.5" />
                <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
              </Link>
            </Button>
          ) : isActivating ? (
            <Button
              size="sm"
              disabled
              className="h-8 flex-1 cursor-not-allowed rounded-xl border border-sky-500/30 bg-sky-500/10 text-xs font-bold text-sky-600 opacity-90 dark:text-sky-400"
              title={t("resources.card.activatingTooltip", {
                defaultValue:
                  "Pricing is activating on the network and will become effective shortly. Bookings cannot be accepted until activation completes.",
              })}
            >
              <Clock className="mr-1 size-3.5 animate-pulse" />
              <span>{t("resources.card.activatingButton", { defaultValue: "Activating..." })}</span>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-xl border-amber-300 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              title={readiness.missingActions.map((a) => a.label).join(", ")}
            >
              <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
                <Sliders className="mr-1 size-3.5" />
                <span>{t("resources.card.completeSetup", { defaultValue: "Complete Setup" })}</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-nx-border h-8 flex-1 rounded-xl text-xs font-semibold hover:bg-nx-raised"
          >
            <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
              <Edit className="mr-1 size-3.5" />
              <span>{t("resources.card.viewEdit", { defaultValue: "Edit" })}</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-xl text-nx-ink-3 hover:text-nx-ink"
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
