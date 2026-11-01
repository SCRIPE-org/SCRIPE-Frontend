"use client";

import { useState } from "react";
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
  Trash2,
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
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import {
  type ResourceWorkspaceItem,
  evaluateCourtReadiness,
} from "../../domain/entities/ResourceWorkspaceItem";

interface Props {
  item: ResourceWorkspaceItem;
  onDeleted?: () => void;
}

function getCourtImage(sportType?: string, name?: string): string {
  const s = (sportType || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (s.includes("foot") || n.includes("foot") || n.includes("pitch") || s.includes("soccer") || s.includes("turf")) {
    return "/images/venue/football-turf-night.svg";
  }
  if (n.includes("outdoor") || s.includes("outdoor") || n.includes("panoramic")) {
    return "/images/venue/padel-court-outdoor.svg";
  }
  return "/images/venue/padel-court-indoor.svg";
}

export function ResourceCard({ item, onDeleted }: Props) {
  const { t } = useI18n();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    <>
      <Card className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-nx-line bg-nx-surface transition-all hover:border-nx-line-hi">
        {/* Top Section: Court Photo Thumbnail Banner with Overlays */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-nx-raised">
          <img
            src={item.imageUrl || getCourtImage(item.sportType, item.name)}
            alt={item.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top-Left: Sport Type Badge and Composite Badge */}
          <div className="absolute left-3 top-3 z-10 flex max-w-[75%] flex-wrap items-center gap-1.5">
            <span
              className="block truncate rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xs"
              title={item.sportType || undefined}
            >
              {item.sportType || t("resources.card.court", { defaultValue: "Court" })}
            </span>
            {item.isComposite && (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-nx-accent/40 bg-nx-accent/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-nx-accent backdrop-blur-xs"
                title={t("resources.card.compositeBadge", { defaultValue: "Composite Resource" })}
              >
                {t("resources.card.compositeBadge", { defaultValue: "Composite" })}
              </span>
            )}
          </div>

        {/* Top-Right: Readiness Status Pill */}
        <div className="absolute right-3 top-3 z-10">
          {isReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-success backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
              {t("resources.card.statusReady", { defaultValue: "Ready" })}
            </span>
          ) : isActivating ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-info backdrop-blur-xs"
              title={t("resources.card.activatingTooltip", {
                defaultValue:
                  "Pricing is activating on the network and will become effective shortly.",
              })}
            >
              <Clock className="size-3 text-info animate-pulse" />
              {t("resources.card.statusActivating", { defaultValue: "Activating" })}
            </span>
          ) : isUnavailable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-nx-ink-2 backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-nx-ink-3" />
              {t("resources.card.statusUnavailable", { defaultValue: "Unavailable" })}
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-warning backdrop-blur-xs"
              title={readiness.missingActions.map((a) => a.label).join(", ")}
            >
              <span className="size-1.5 rounded-full bg-warning shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteDialogOpen(true);
                  }}
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>{t("resources.card.delete", { defaultValue: "Delete Court" })}</span>
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
            <div className="flex items-center gap-1 rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
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
              className="h-8 flex-1 rounded-xl bg-nx-accent text-xs font-bold text-nx-on-fill hover:bg-nx-accent/90"
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
              className="h-8 flex-1 cursor-not-allowed rounded-xl border border-info/30 bg-info/10 text-xs font-bold text-info opacity-90"
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
              className="h-8 flex-1 rounded-xl border-warning/30 bg-warning/10 text-xs font-bold text-warning hover:bg-warning/20"
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

    <ConfirmationDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      variant="destructive"
      isLoading={isDeleting}
      title={t("resources.card.deleteConfirmTitle", {
        defaultValue: "Delete Court",
      })}
      description={t("resources.card.deleteConfirmDescription", {
        defaultValue:
          "Are you sure you want to delete this court? This action permanently removes the resource and cannot be undone. Please ensure no active reservations exist before proceeding.",
      })}
      confirmText={t("common.delete", { defaultValue: "Delete" })}
      cancelText={t("common.cancel", { defaultValue: "Cancel" })}
      onConfirm={async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
          const container = getVenueContainer();
          if (
            typeof (container.schedulableResourceRepository as any).deleteResource ===
            "function"
          ) {
            await (container.schedulableResourceRepository as any).deleteResource(item.id);
          } else {
            await container.schedulableResourceRepository.delete(item.id);
          }
          setDeleteDialogOpen(false);
          onDeleted?.();
        } catch (err) {
          setDeleteError(
            err instanceof Error
              ? err.message
              : t("resources.card.deleteError", {
                  defaultValue: "Failed to delete court. Please verify no active reservations exist.",
                })
          );
        } finally {
          setIsDeleting(false);
        }
      }}
    >
      {deleteError && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
          {deleteError}
        </div>
      )}
    </ConfirmationDialog>
  </>
  );
}