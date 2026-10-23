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
  if (s.includes("5-a-side") || n.includes("5-a-side") || n.includes("5a")) {
    return "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("foot") || n.includes("foot") || n.includes("pitch") || s.includes("soccer")) {
    return "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("tennis") || n.includes("tennis") || n.includes("clay") || n.includes("hardcourt")) {
    return "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("swim") || n.includes("swim") || n.includes("pool") || n.includes("lane") || s.includes("aqua")) {
    return "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("squash") || n.includes("squash")) {
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("basket") || n.includes("basket") || n.includes("fieldhouse")) {
    return "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("badmin") || n.includes("badmin")) {
    return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("volley") || n.includes("volley") || n.includes("beach")) {
    return "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("gym") || s.includes("crossfit") || s.includes("fit") || n.includes("gym") || n.includes("crossfit")) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("run") || s.includes("track") || s.includes("athletic") || n.includes("track")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80";
  }
  if (n.includes("outdoor") || s.includes("outdoor") || n.includes("panoramic")) {
    return "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("padel") || n.includes("padel")) {
    return "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=1200&q=80";
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
  const isUnavailable = readiness.state === "Unavailable";

  return (
    <Card className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-nx-line bg-nx-surface shadow-xs transition-all hover:border-nx-line-hi hover:shadow-md">
      {/* Top Section: Court Photo Thumbnail Banner with Overlays */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-nx-raised">
        <img
          src={getCourtImage(item.sportType, item.name)}
          alt={item.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-Left: Sport Type Badge */}
        <div className="absolute left-3 top-3 z-10 max-w-[65%]">
          <span
            className="block truncate rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xs"
            title={item.sportType || undefined}
          >
            {item.sportType || t("resources.card.court", { defaultValue: "Court" })}
          </span>
        </div>

        {/* Top-Right: Readiness Status Pill */}
        <div className="absolute right-3 top-3 z-10">
          {isReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300 shadow-xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              {t("resources.card.statusReady", { defaultValue: "Ready" })}
            </span>
          ) : isActivating ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-950/80 px-2.5 py-1 text-[11px] font-bold text-sky-300 shadow-xs backdrop-blur-xs"
              title={t("resources.card.activatingTooltip", {
                defaultValue:
                  "Pricing is activating on the network and will become effective shortly.",
              })}
            >
              <Clock className="size-3 text-sky-400 animate-pulse" />
              {t("resources.card.statusActivating", { defaultValue: "Activating" })}
            </span>
          ) : isUnavailable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-nx-ink-2 shadow-xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-nx-ink-3" />
              {t("resources.card.statusUnavailable", { defaultValue: "Unavailable" })}
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-950/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-xs backdrop-blur-xs"
              title={readiness.missingActions.map((a) => a.label).join(", ")}
            >
              <span className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}
            </span>
          )}
        </div>

        {/* Bottom overlay inside thumbnail: Facility / Complex Name */}
        {item.facilityName && (
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center gap-1.5 text-xs font-semibold text-white/95">
            <MapPin className="size-3.5 shrink-0 text-white/80" />
            <span className="truncate" title={item.facilityName}>
              {item.facilityName}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section: Court Details, Specs & Actions */}
      <div className="flex flex-1 flex-col justify-between space-y-3.5 p-4">
        <div className="space-y-2.5">
          {/* Court Title & Options Menu */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="line-clamp-2 text-sm font-bold text-nx-ink tracking-tight"
              title={item.name}
            >
              {item.name}
            </h3>

            {/* Functional Options Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="size-7 shrink-0 rounded-lg p-1 text-nx-ink-3 transition-colors hover:bg-nx-raised hover:text-nx-ink"
                  aria-label={t("resources.card.optionsFor", {
                    defaultValue: "Options for {{name}}",
                    name: item.name,
                  })}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-xs">
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

          {/* Specs / Metadata Grid */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Operating Schedule */}
            <div className="flex items-center gap-1.5 rounded-lg border border-nx-line bg-nx-raised/50 px-2.5 py-1 text-[11px] font-semibold text-nx-ink">
              <Clock className="size-3 text-nx-ink-3 shrink-0" />
              <span className="truncate max-w-[140px]">
                {item.workingHoursSummary ||
                  (item.isOpen247
                    ? t("resources.card.open247", { defaultValue: "Open 24/7" })
                    : t("resources.card.scheduleNotSet", { defaultValue: "Schedule Not Set" }))}
              </span>
            </div>

            {/* Slot duration */}
            <div className="flex items-center gap-1 rounded-lg border border-nx-line bg-nx-raised/50 px-2.5 py-1 text-[11px] font-semibold text-nx-ink">
              <span>
                {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
              </span>
            </div>

            {/* Price per slot */}
            <div className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-nx-accent/20 dark:bg-nx-accent/10 dark:text-nx-accent">
              <CircleDollarSign className="size-3 shrink-0" />
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
                    {t("resources.card.notConfigured", { defaultValue: "Not configured" })}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 border-t border-nx-line pt-3">
          {isReady ? (
            <Button
              asChild
              size="sm"
              className="h-8 flex-1 rounded-xl bg-nx-accent text-xs font-bold text-nx-on-fill shadow-sm hover:bg-nx-accent/90"
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
              className="h-8 flex-1 rounded-xl border-amber-400/40 bg-amber-500/10 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
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
            className="h-8 flex-1 rounded-xl border-nx-line text-xs font-semibold hover:bg-nx-raised"
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
            className="size-8 shrink-0 rounded-xl text-nx-ink-3 hover:text-nx-ink"
            title={t("resources.card.calendar", { defaultValue: "Calendar" })}
          >
            <Link href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`}>
              <CalendarDays className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}