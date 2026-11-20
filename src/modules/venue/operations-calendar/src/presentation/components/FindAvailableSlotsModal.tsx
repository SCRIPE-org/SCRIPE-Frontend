"use client";

import { useState } from "react";
import { Search, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { localToUtcInstant } from "../viewmodels/useCalendarLayout";
import { useFindAvailableSlotsViewModel } from "../viewmodels/useFindAvailableSlotsViewModel";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface FindAvailableSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: CalendarResource[];
  currentDate: string;
  timeZoneId: string;
  onSelectSlot: (resource: CalendarResource, startIso: string, durationMinutes?: number) => void;
}

/**
 * Dialog for checking court availability before launching the click-to-book flow.
 */
export function FindAvailableSlotsModal({
  open,
  onOpenChange,
  resources,
  currentDate,
  timeZoneId,
  onSelectSlot,
}: FindAvailableSlotsModalProps) {
  const { t } = useI18n();

  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [dateSelection, setDateSelection] = useState<{ base: string; value: string } | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const { checking, result, setResult, checkSlot } = useFindAvailableSlotsViewModel();

  const effectiveResourceId = selectedResourceId || (resources[0]?.id ?? "");
  const effectiveDate =
    dateSelection && dateSelection.base === currentDate ? dateSelection.value : currentDate;

  const resourceOptions = resources.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.facilityName})`,
  }));

  const handleCheck = () => {
    if (!effectiveResourceId) return;
    checkSlot(
      {
        resourceId: effectiveResourceId,
        selectedDate: effectiveDate,
        startTime,
        durationMinutes,
        timeZoneId,
      },
      t("operationsCalendar.findSlots.available"),
      t("operationsCalendar.findSlots.unavailable"),
      t("operationsCalendar.findSlots.verificationFailed"),
    );
  };

  const handleProceedToBooking = () => {
    const resource = resources.find((r) => r.id === effectiveResourceId);
    if (!resource) return;
    const startIso = localToUtcInstant(
      effectiveDate,
      startTime,
      resource.timeZoneId || timeZoneId || "UTC",
    );
    onOpenChange(false);
    onSelectSlot(resource, startIso, durationMinutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="size-5 text-nx-accent" aria-hidden="true" />
            {t("operationsCalendar.findSlots.title")}
          </DialogTitle>
          <DialogDescription>{t("operationsCalendar.findSlots.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("operationsCalendar.findSlots.court")}</Label>
            <GenericSelect
              id="availability-modal-resource"
              options={resourceOptions}
              value={effectiveResourceId}
              onValueChange={(val: string | string[]) => {
                setSelectedResourceId(Array.isArray(val) ? val[0] : val);
                setResult(null);
              }}
              placeholder={t("operationsCalendar.findSlots.selectCourt")}
              allowClear={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("operationsCalendar.findSlots.date")}</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => {
                setDateSelection({ base: currentDate, value: e.target.value });
                setResult(null);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("operationsCalendar.findSlots.startTime")}</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setResult(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("operationsCalendar.findSlots.duration")}</Label>
              <GenericSelect
                id="availability-modal-duration"
                allowClear={false}
                value={String(durationMinutes)}
                options={[30, 60, 90, 120].map((minutes) => ({
                  value: String(minutes),
                  label:
                    minutes >= 60 && minutes % 60 === 0
                      ? t("operationsCalendar.clickToBook.courtStep.hourDuration", {
                          minutes,
                          hours: minutes / 60,
                        })
                      : t("operationsCalendar.clickToBook.courtStep.minutes", { minutes }),
                }))}
                onValueChange={(value: string | string[]) => {
                  setDurationMinutes(Number(Array.isArray(value) ? value[0] : value));
                  setResult(null);
                }}
              />
            </div>
          </div>

          <Button
            type="button"
            className="mt-2 w-full"
            variant="outline"
            disabled={checking || !selectedResourceId}
            onClick={handleCheck}
          >
            <Search className="me-2 size-4" aria-hidden="true" />
            {checking
              ? t("operationsCalendar.findSlots.checking")
              : t("operationsCalendar.findSlots.check")}
          </Button>

          {result && (
            <div className="pt-2">
              <Alert variant={result.isAvailable ? "success" : "warning"}>
                {result.isAvailable ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-4" aria-hidden="true" />
                )}
                <AlertTitle>
                  {result.isAvailable
                    ? t("operationsCalendar.findSlots.slotAvailable")
                    : t("operationsCalendar.findSlots.slotUnavailable")}
                </AlertTitle>
                <AlertDescription className="text-xs">{result.message}</AlertDescription>
              </Alert>

              {result.isAvailable && (
                <Button
                  type="button"
                  variant="default"
                  className="mt-3 w-full font-bold"
                  onClick={handleProceedToBooking}
                >
                  {t("operationsCalendar.findSlots.proceed")}
                  <ArrowRight className="ms-2 size-4 rtl:rotate-180" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
