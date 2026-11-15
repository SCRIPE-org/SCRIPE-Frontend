"use client";

import { Lock } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@core/ui/sheet";
import type {
  CalendarResource,
  OperationsCalendarBlock,
} from "../../domain/entities/OperationsCalendar";

interface Props {
  closure: OperationsCalendarBlock | null;
  allResources: CalendarResource[];
  timeZoneId: string;
  locale: string;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function formatClosureTime(utcIso: string, timeZoneId: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZoneId || "UTC",
    }).format(new Date(utcIso));
  } catch {
    return utcIso;
  }
}

/**
 * Slide-over drawer presenting maintenance and blackout closure details.
 */
export function MaintenanceClosureDrawer({
  closure,
  allResources,
  timeZoneId,
  locale,
  onClose,
  t,
}: Props) {
  return (
    <Sheet
      open={Boolean(closure)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="end" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lock className="size-4 text-warning" aria-hidden="true" />
            {t("operationsCalendar.maintenanceDrawer.title")}
          </SheetTitle>
          <SheetDescription>
            {t("operationsCalendar.maintenanceDrawer.description")}
          </SheetDescription>
        </SheetHeader>

        {closure && (
          <div className="mt-6 space-y-4">
            <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-3">
                  {t("operationsCalendar.maintenanceDrawer.court")}
                </span>
                <span className="font-semibold text-nx-ink">
                  {allResources.find((r) => r.id === closure.resourceId)?.name || closure.resourceId}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-3">
                  {t("operationsCalendar.maintenanceDrawer.status")}
                </span>
                <Badge variant="warning">{t(`operationsCalendar.status.${closure.status}`)}</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-3">
                  {t("operationsCalendar.maintenanceDrawer.reference")}
                </span>
                <span className="font-mono text-xs text-nx-ink-2">
                  {closure.reservationNumber || closure.reservationId}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-3">
                  {t("operationsCalendar.maintenanceDrawer.start")}
                </span>
                <span className="text-nx-ink">
                  {formatClosureTime(closure.startUtc, timeZoneId, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-3">
                  {t("operationsCalendar.maintenanceDrawer.end")}
                </span>
                <span className="text-nx-ink">
                  {formatClosureTime(closure.endUtc, timeZoneId, locale)}
                </span>
              </div>
            </div>
          </div>
        )}

        <SheetFooter className="mt-8 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("operationsCalendar.maintenanceDrawer.close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
