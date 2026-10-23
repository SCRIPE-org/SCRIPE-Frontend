"use client";

import { useEffect, useState } from "react";
import { Ban, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { useVenueServiceLocator } from "@modules/venue";
import type { ResourceBlockKind } from "@modules/venue";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: CalendarResource | null;
  instantUtc: string | null;
  resources: CalendarResource[];
  timeZoneId: string;
  onSuccess: () => void;
}

/**
 * Documentation for BlockTimeModal
 */
export function BlockTimeModal({
  open,
  onOpenChange,
  resource,
  instantUtc,
  resources,
  timeZoneId,
  onSuccess,
}: Props) {
  const { t } = useI18n();
  const { availabilityRepository } = useVenueServiceLocator();

  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [reasonType, setReasonType] = useState<"Maintenance" | "Unavailable">("Maintenance");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      void Promise.resolve().then(() => {
        setError(null);
        if (resource) {
          setSelectedResourceId(resource.id);
        } else if (resources.length > 0 && !selectedResourceId) {
          setSelectedResourceId(resources[0]?.id ?? "");
        }
      });

      if (instantUtc) {
        try {
          const d = new Date(instantUtc);
          const endD = new Date(d.getTime() + 60 * 60 * 1000);
          const dateStr = d.toISOString().slice(0, 10);
          void Promise.resolve().then(() => {
            setStartDate(dateStr);
            setEndDate(dateStr);

            const formatter = new Intl.DateTimeFormat("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hourCycle: "h23",
              timeZone: timeZoneId || "UTC",
            });
            setStartTime(formatter.format(d));
            setEndTime(formatter.format(endD));
          });
        } catch {
          // Fallback to default
        }
      }
    }
  }, [instantUtc, open, resource, resources, selectedResourceId, timeZoneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;
    setSubmitting(true);
    setError(null);
    try {
      const kind: ResourceBlockKind = reasonType === "Maintenance" ? "maintenance" : "blackout";
      const startLocal = `${startDate}T${startTime}:00`;
      const endLocal = `${endDate}T${endTime}:00`;

      await availabilityRepository.createBlock(kind, {
        resourceId: selectedResourceId,
        timeZoneId: timeZoneId || "UTC",
        startLocal,
        endLocal,
        hardBlock: true,
        reason:
          reason.trim() ||
          (reasonType === "Maintenance"
            ? t("resources.blockTimeModal.typeMaintenance", {
                defaultValue: "Scheduled Maintenance",
              })
            : t("resources.blockTimeModal.typeUnavailable", { defaultValue: "Court Closed" })),
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block time.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="border-b border-nx-line pb-3">
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("resources.blockTimeModal.title", { defaultValue: "Block Time" })}
          </DialogTitle>
          <p className="text-xs text-nx-ink-2">
            {t("resources.blockTimeModal.subtitle", {
              defaultValue: "Close a court temporarily for maintenance or operational reasons.",
            })}
          </p>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Resource Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("resources.blockTimeModal.resource", { defaultValue: "Court / Field" })}
            </Label>
            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
              <SelectTrigger
                className="h-9 w-full text-xs font-semibold"
                aria-label={t("resources.blockTimeModal.resource", {
                  defaultValue: "Court / Field",
                })}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.profileName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Type Toggle: Maintenance vs Unavailable */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("resources.blockTimeModal.reasonType", { defaultValue: "Reason Type" })}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                aria-pressed={reasonType === "Maintenance"}
                type="button"
                onClick={() => setReasonType("Maintenance")}
                className={`rounded-nx-md border p-2.5 text-left text-xs font-semibold transition-all ${
                  reasonType === "Maintenance"
                    ? "border-amber-500 bg-amber-500/10 text-amber-900 ring-1 ring-amber-500 dark:text-amber-200"
                    : "hover:bg-nx-surfaceSubtle border-nx-line text-nx-ink-2"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Wrench className="size-3.5" aria-hidden="true" />
                  <span>
                    {t("resources.blockTimeModal.typeMaintenance", { defaultValue: "Maintenance" })}
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                aria-pressed={reasonType === "Unavailable"}
                type="button"
                onClick={() => setReasonType("Unavailable")}
                className={`rounded-nx-md border p-2.5 text-left text-xs font-semibold transition-all ${
                  reasonType === "Unavailable"
                    ? "border-nx-accent bg-nx-accent/10 text-nx-ink ring-1 ring-nx-accent font-bold"
                    : "hover:bg-nx-surfaceSubtle border-nx-line text-nx-ink-2"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Ban className="size-3.5" aria-hidden="true" />
                  <span>
                    {t("resources.blockTimeModal.typeUnavailable", { defaultValue: "Unavailable" })}
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Date & Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                {t("resources.blockTimeModal.date", { defaultValue: "Start Date" })}
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {t("resources.blockTimeModal.startTime", { defaultValue: "Start Time" })}
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                {t("resources.blockTimeModal.endDate", { defaultValue: "End Date" })}
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {t("resources.blockTimeModal.endTime", { defaultValue: "End Time" })}
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          {/* Reason notes */}
          <div className="space-y-1">
            <Label htmlFor="block-time-reason" className="text-xs">
              {t("resources.blockTimeModal.reason", { defaultValue: "Reason / Notes" })}
            </Label>
            <Input
              id="block-time-reason"
              placeholder={t("resources.blockTimeModal.reasonPlaceholder", {
                defaultValue: "e.g. Net repair and surface cleaning",
              })}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <DialogFooter className="border-t border-nx-line pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t("resources.blockTimeModal.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              loading={submitting}
              className="font-bold"
            >
              {t("resources.blockTimeModal.submit", { defaultValue: "Block Time" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
