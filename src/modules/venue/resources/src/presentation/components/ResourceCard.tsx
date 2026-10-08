"use client";

import Link from "next/link";
import { CalendarDays, Clock, CircleDollarSign, Building2, Edit, Plus } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { ResourceWorkspaceItem } from "../../domain/entities/ResourceWorkspaceItem";

interface Props {
  item: ResourceWorkspaceItem;
}

/**
 * Documentation for module export
 */
export function ResourceCard({ item }: Props) {
  const { t } = useI18n();

  return (
    <Card className="hover:shadow-nx-md border-nx-line/80 flex flex-col justify-between transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-nx-ink">{item.name}</CardTitle>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <Building2 className="size-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span className="truncate">{item.facilityName}</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs font-medium">
            {item.sportType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-2 text-xs">
        {/* Working Hours & Booking Slot Strip */}
        <div className="bg-nx-surfaceSubtle border-nx-line/50 grid grid-cols-2 gap-2 rounded-nx-md border p-2.5">
          <div>
            <p className="flex items-center gap-1 text-[11px] font-medium text-nx-ink-3">
              <Clock className="size-3" aria-hidden="true" />
              <span>{t("resources.tabs.workingHours", { defaultValue: "Hours" })}</span>
            </p>
            <p className="mt-0.5 font-semibold text-nx-ink">
              {item.isOpen247
                ? t("resources.card.open247", { defaultValue: "Open 24/7" })
                : item.workingHoursSummary}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[11px] font-medium text-nx-ink-3">
              <CalendarDays className="size-3" aria-hidden="true" />
              <span>{t("resources.tabs.bookingRules", { defaultValue: "Slot" })}</span>
            </p>
            <p className="mt-0.5 font-semibold text-nx-ink">
              {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 font-medium text-nx-ink-2">
            <CircleDollarSign
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>{t("resources.tabs.pricing", { defaultValue: "Price" })}</span>
          </span>
          <span className="text-sm font-bold text-nx-ink">
            {item.pricePerSlot != null ? (
              <>
                {item.pricePerSlot} {item.currencyCode}{" "}
                <span className="text-xs font-normal text-nx-ink-3">
                  {t("resources.card.perSlot", { defaultValue: "/ slot" })}
                </span>
              </>
            ) : (
              <span className="text-xs italic text-nx-ink-3">Not configured</span>
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-nx-line/60 flex items-center justify-between gap-2 border-t pt-3">
        <Button asChild variant="outline" size="sm" className="h-8 flex-1 gap-1.5 text-xs">
          <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
            <Edit className="size-3.5" aria-hidden="true" />
            <span>{t("resources.card.viewEdit", { defaultValue: "Edit Court" })}</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Link href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`}>
            <CalendarDays className="size-3.5 text-nx-accent" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("resources.card.calendar", { defaultValue: "Calendar" })}
            </span>
          </Link>
        </Button>

        <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
          <Link href={`/venue/bookings/new?resourceId=${encodeURIComponent(item.id)}`}>
            <Plus className="size-3.5" aria-hidden="true" />
            <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
