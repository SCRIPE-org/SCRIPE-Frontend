"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CircleDollarSign,
  Building2,
  Edit,
  Plus,
} from "lucide-react";
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
    <Card className="flex flex-col justify-between hover:shadow-nx-md transition-shadow border-nx-line/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-nx-ink">
              {item.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-nx-ink-2">
              <Building2 className="size-3.5 text-nx-ink-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.facilityName}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 font-medium">
            {item.sportType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-2 text-xs">
        {/* Working Hours & Booking Slot Strip */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/50">
          <div>
            <p className="text-[11px] text-nx-ink-3 font-medium flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              <span>{t("resources.tabs.workingHours", { defaultValue: "Hours" })}</span>
            </p>
            <p className="font-semibold text-nx-ink mt-0.5">
              {item.isOpen247
                ? t("resources.card.open247", { defaultValue: "Open 24/7" })
                : item.workingHoursSummary}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-nx-ink-3 font-medium flex items-center gap-1">
              <CalendarDays className="size-3" aria-hidden="true" />
              <span>{t("resources.tabs.bookingRules", { defaultValue: "Slot" })}</span>
            </p>
            <p className="font-semibold text-nx-ink mt-0.5">
              {item.slotDurationMinutes} {t("resources.card.slot", { defaultValue: "min slots" })}
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="flex items-center justify-between px-1">
          <span className="text-nx-ink-2 font-medium flex items-center gap-1.5">
            <CircleDollarSign className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>{t("resources.tabs.pricing", { defaultValue: "Price" })}</span>
          </span>
          <span className="font-bold text-sm text-nx-ink">
            {item.pricePerSlot != null ? (
              <>
                {item.pricePerSlot} {item.currencyCode}{" "}
                <span className="text-xs font-normal text-nx-ink-3">
                  {t("resources.card.perSlot", { defaultValue: "/ slot" })}
                </span>
              </>
            ) : (
              <span className="text-nx-ink-3 text-xs italic">Not configured</span>
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-nx-line/60 flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1">
          <Link href={`/venue/resources/${encodeURIComponent(item.id)}`}>
            <Edit className="size-3.5" aria-hidden="true" />
            <span>{t("resources.card.viewEdit", { defaultValue: "Edit Court" })}</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Link href={`/venue/calendar?resourceId=${encodeURIComponent(item.id)}`}>
            <CalendarDays className="size-3.5 text-nx-accent" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("resources.card.calendar", { defaultValue: "Calendar" })}
            </span>
          </Link>
        </Button>

        <Button asChild size="sm" className="h-8 text-xs gap-1.5 font-semibold">
          <Link href={`/venue/bookings/new?resourceId=${encodeURIComponent(item.id)}`}>
            <Plus className="size-3.5" aria-hidden="true" />
            <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
