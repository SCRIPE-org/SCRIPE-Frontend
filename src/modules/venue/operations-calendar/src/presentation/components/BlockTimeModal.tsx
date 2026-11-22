"use client";

import { Ban, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";
import { useBlockTimeViewModel } from "../viewmodels/useBlockTimeViewModel";

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
 * Dialog allowing operators to block court availability for maintenance or closures.
 */
export function BlockTimeModal(props: Props) {
  const vm = useBlockTimeViewModel(props);
  const { t } = vm;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="border-b border-nx-line pb-3">
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("operationsCalendar.blockTime.title")}
          </DialogTitle>
          <p className="text-xs text-nx-ink-2">{t("operationsCalendar.blockTime.subtitle")}</p>
        </DialogHeader>

        {vm.error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">{vm.error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={vm.handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("operationsCalendar.blockTime.resource")}
            </Label>
            <Select value={vm.selectedResourceId} onValueChange={vm.setSelectedResourceId}>
              <SelectTrigger
                className="h-9 w-full text-xs font-semibold"
                aria-label={t("operationsCalendar.blockTime.resource")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {props.resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.profileName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("operationsCalendar.blockTime.reasonType")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                aria-pressed={vm.reasonType === "Maintenance"}
                type="button"
                onClick={() => vm.setReasonType("Maintenance")}
                className={`rounded-nx-md border p-2.5 text-start text-xs font-semibold transition-all ${
                  vm.reasonType === "Maintenance"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-nx-line text-nx-ink-2 hover:bg-nx-raised"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Wrench className="size-3.5" aria-hidden="true" />
                  <span>{t("operationsCalendar.blockTime.typeMaintenance")}</span>
                </div>
              </Button>

              <Button
                variant="outline"
                aria-pressed={vm.reasonType === "Unavailable"}
                type="button"
                onClick={() => vm.setReasonType("Unavailable")}
                className={`rounded-nx-md border p-2.5 text-start text-xs font-semibold transition-all ${
                  vm.reasonType === "Unavailable"
                    ? "border-nx-accent/40 bg-nx-accent-wash font-semibold text-nx-accent"
                    : "border-nx-line text-nx-ink-2 hover:bg-nx-raised"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Ban className="size-3.5" aria-hidden="true" />
                  <span>{t("operationsCalendar.blockTime.typeUnavailable")}</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("operationsCalendar.blockTime.startDate")}</Label>
              <Input
                type="date"
                value={vm.startDate}
                onChange={(e) => vm.setStartDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("operationsCalendar.blockTime.startTime")}</Label>
              <Input
                type="time"
                value={vm.startTime}
                onChange={(e) => vm.setStartTime(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("operationsCalendar.blockTime.endDate")}</Label>
              <Input
                type="date"
                value={vm.endDate}
                onChange={(e) => vm.setEndDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("operationsCalendar.blockTime.endTime")}</Label>
              <Input
                type="time"
                value={vm.endTime}
                onChange={(e) => vm.setEndTime(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="block-time-reason" className="text-xs">
              {t("operationsCalendar.blockTime.reason")}
            </Label>
            <Input
              id="block-time-reason"
              placeholder={t("operationsCalendar.blockTime.reasonPlaceholder")}
              value={vm.reason}
              onChange={(e) => vm.setReason(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <DialogFooter className="border-t border-nx-line pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => props.onOpenChange(false)}
            >
              {t("operationsCalendar.blockTime.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={vm.submitting}
              loading={vm.submitting}
              className="font-bold"
            >
              {t("operationsCalendar.blockTime.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
