"use client";

import { AlertCircle, Search } from "lucide-react";
import { Button } from "@core/ui/button";

interface BookingConflictStageProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  onClose: () => void;
  onSuccess: () => void;
  onFindSlots?: () => void;
}

/**
 * Conflict resolution stage displayed when a reservation collides with a concurrent booking.
 */
export function BookingConflictStage({
  t,
  onClose,
  onSuccess,
  onFindSlots,
}: BookingConflictStageProps) {
  return (
    <div className="space-y-4 py-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-warning/40 bg-warning/10 text-warning">
        <AlertCircle className="size-8" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-bold text-nx-ink">
          {t("operationsCalendar.clickToBook.conflict.title")}
        </h3>
        <p className="mt-1 text-xs text-nx-ink-2">
          {t("operationsCalendar.clickToBook.conflict.description")}
        </p>
      </div>
      <div className="space-y-2 pt-2">
        {onFindSlots && (
          <Button
            type="button"
            variant="default"
            className="h-9 w-full rounded-nx-control text-xs font-bold"
            onClick={() => {
              onClose();
              onFindSlots();
            }}
          >
            <Search className="me-2 size-3.5" aria-hidden="true" />
            {t("operationsCalendar.clickToBook.conflict.findAnother")}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full rounded-nx-control text-xs font-semibold"
          onClick={() => {
            onClose();
            onSuccess();
          }}
        >
          {t("operationsCalendar.clickToBook.conflict.returnToCalendar")}
        </Button>
      </div>
    </div>
  );
}
