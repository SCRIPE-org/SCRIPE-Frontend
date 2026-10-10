"use client";

import React, { useState } from "react";
import { Search, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface FindAvailableSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: CalendarResource[];
  currentDate: string;
  timeZoneId: string;
  onSelectSlot: (resource: CalendarResource, startIso: string) => void;
}

export function FindAvailableSlotsModal({
  open,
  onOpenChange,
  resources,
  currentDate,
  timeZoneId,
  onSelectSlot,
}: FindAvailableSlotsModalProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resources[0]?.id ?? ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ isAvailable: boolean; message?: string } | null>(null);

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

  const handleCheck = async () => {
    if (!selectedResourceId) return;
    setChecking(true);
    setResult(null);

    try {
      const container = getVenueContainer();
      const startLocal = `${selectedDate}T${startTime}`;
      
      // Calculate end time
      const [h, m] = startTime.split(":").map(Number);
      const totalMinutes = h * 60 + m + durationMinutes;
      const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
      const endM = String(totalMinutes % 60).padStart(2, "0");
      const endLocal = `${selectedDate}T${endH}:${endM}`;

      const res = await container.availabilityRepository.search({
        resourceId: selectedResourceId,
        timeZoneId: timeZoneId || "UTC",
        startLocal,
        endLocal,
        quantity: 1,
      });

      setResult({
        isAvailable: res.isAvailable,
        message: res.isAvailable
          ? isRtl ? "الملعب متاح في هذا الوقت المحدد" : "Court is open and available for this time"
          : isRtl ? "الملعب غير متاح في هذه الفترة" : "Court is occupied or outside operating hours",
      });
    } catch {
      // Fallback response for offline or unexpected error
      setResult({
        isAvailable: false,
        message: isRtl
          ? "تعذر التحقق من التوفر حالياً. يرجى مراجعة الجدول مباشرة."
          : "Could not verify availability at this moment. Please check the timeline.",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleProceedToBooking = () => {
    const resource = resources.find((r) => r.id === selectedResourceId);
    if (!resource) return;
    const startIso = new Date(`${selectedDate}T${startTime}:00`).toISOString();
    onOpenChange(false);
    onSelectSlot(resource, startIso);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-nx-primary" />
            {isRtl ? "البحث عن المواعيد المتاحة" : "Find Available Slots"}
          </DialogTitle>
          <DialogDescription>
            {isRtl
              ? "ابحث عن الملاعب والأوقات المتاحة للحجز المباشر دون مغادرة جدول العمليات."
              : "Search courts and available slots to book directly without leaving operations."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Court Selection */}
          <div className="space-y-1.5">
            <Label>{isRtl ? "الملعب / المساحة" : "Court / Space"}</Label>
            <GenericSelect
              id="availability-modal-resource"
              options={resourceOptions}
              value={selectedResourceId}
              onValueChange={(val: string | string[]) => {
                setSelectedResourceId(Array.isArray(val) ? val[0] : val);
                setResult(null);
              }}
              placeholder={isRtl ? "اختر الملعب" : "Select Court"}
              allowClear={false}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label>{isRtl ? "التاريخ" : "Date"}</Label>
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
              <Label>{isRtl ? "وقت البدء" : "Start Time"}</Label>
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
              <Label>{isRtl ? "المدة (بالدقائق)" : "Duration (mins)"}</Label>
              <select
                className="w-full h-9 rounded-md border border-nx-border bg-nx-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-nx-primary"
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setResult(null);
                }}
              >
                <option value={30}>30 {isRtl ? "دقيقة" : "min"}</option>
                <option value={60}>60 {isRtl ? "دقيقة" : "min (1 hr)"}</option>
                <option value={90}>90 {isRtl ? "دقيقة" : "min (1.5 hr)"}</option>
                <option value={120}>120 {isRtl ? "دقيقة" : "min (2 hr)"}</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            className="w-full mt-2"
            variant="outline"
            disabled={checking || !selectedResourceId}
            onClick={handleCheck}
          >
            <Search className="h-4 w-4 me-2" />
            {checking
              ? isRtl ? "جاري التحقق..." : "Checking availability..."
              : isRtl ? "فحص التوفر" : "Check Slot Availability"}
          </Button>

          {/* Result Feedback */}
          {result && (
            <div className="pt-2">
              <Alert variant={result.isAvailable ? "success" : "warning"}>
                {result.isAvailable ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {result.isAvailable
                    ? isRtl ? "الموعد متاح!" : "Slot is Available!"
                    : isRtl ? "غير متاح" : "Not Available"}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.isAvailable && (
                <Button
                  type="button"
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                  onClick={handleProceedToBooking}
                >
                  {isRtl ? "متابعة الحجز لهذا الموعد" : "Proceed to Book This Slot"}
                  <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
