"use client";

import React, { useState } from "react";
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

export function FindAvailableSlotsModal({
  open,
  onOpenChange,
  resources,
  currentDate,
  timeZoneId,
  onSelectSlot,
}: FindAvailableSlotsModalProps) {
  const { t } = useI18n();

  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const { checking, result, setResult, checkSlot } = useFindAvailableSlotsViewModel();

  // Update resource default when resources load
  React.useEffect(() => {
    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  React.useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const resourceOptions = resources.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.facilityName})`,
  }));

  const handleCheck = () => {
    if (!selectedResourceId) return;
    checkSlot(
      {
        resourceId: selectedResourceId,
        selectedDate,
        startTime,
        durationMinutes,
        timeZoneId,
      },
      t("operationsCalendar.findSlots.available"),
      t("operationsCalendar.findSlots.unavailable"),
      t("operationsCalendar.findSlots.verificationFailed")
    );
  };

  const handleProceedToBooking = () => {
    const resource = resources.find((r) => r.id === selectedResourceId);
    if (!resource) return;
    const startIso = new Date(`${selectedDate}T${startTime}:00`).toISOString();
    onOpenChange(false);
    onSelectSlot(resource, startIso, durationMinutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="text-nx-primary h-5 w-5" />
            {t("operationsCalendar.findSlots.title")}
          </DialogTitle>
          <DialogDescription>{t("operationsCalendar.findSlots.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Court Selection */}
          <div className="space-y-1.5">
            <Label>{t("operationsCalendar.findSlots.court")}</Label>
            <GenericSelect
              id="availability-modal-resource"
              options={resourceOptions}
              value={selectedResourceId}
              onValueChange={(val: string | string[]) => {
                setSelectedResourceId(Array.isArray(val) ? val[0] : val);
                setResult(null);
              }}
              placeholder={t("operationsCalendar.findSlots.selectCourt")}
              allowClear={false}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label>{t("operationsCalendar.findSlots.date")}</Label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setResult(null);
                }}
              />
            </div>
          </div>

          {/* Start Time & Duration */}
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
            <Search className="me-2 h-4 w-4" />
            {checking
              ? t("operationsCalendar.findSlots.checking")
              : t("operationsCalendar.findSlots.check")}
          </Button>

          {/* Result Feedback */}
          {result && (
            <div className="pt-2">
              <Alert variant={result.isAvailable ? "success" : "warning"}>
                {result.isAvailable ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
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
                  className="mt-3 w-full bg-nx-accent font-bold text-nx-on-fill shadow-sm hover:opacity-90"
                  onClick={handleProceedToBooking}
                >
                  {t("operationsCalendar.findSlots.proceed")}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
