"use client";

import { useState } from "react";
import { CalendarClock, CalendarSync, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useVenueServiceLocator } from "@modules/venue";
import type { AvailabilitySearchResult } from "@modules/venue";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  resourceName: string;
  facilityName: string;
  currentStartUtc: string;
  currentEndUtc: string;
  timeZoneId: string;
  quantity: number;
  direction: "ltr" | "rtl";
  disabled: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onConfirmReschedule: (input: { resourceId: string; requestedStartUtc: string; requestedEndUtc: string }) => void;
}

/**
 * Documentation for module export
 */
export function BookingRescheduleDialog(props: Props) {
  const [date, setDate] = useState(() => new Date(props.currentStartUtc).toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [searching, setSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [candidates, setCandidates] = useState<AvailabilitySearchResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<AvailabilitySearchResult | null>(null);
  const [step, setStep] = useState<"search" | "review">("search");
  const [searchError, setSearchError] = useState<string | null>(null);

  const resetState = () => {
    setSearching(false);
    setSearchAttempted(false);
    setCandidates([]);
    setSelectedCandidate(null);
    setStep("search");
    setSearchError(null);
  };

  const handleOpenChange = (open: boolean) => {
    props.onOpenChange(open);
    if (!open) resetState();
  };

  const handleSearch = async () => {
    if (!date || !startTime || durationMinutes < 15) return;
    const startLocal = `${date}T${startTime}`;
    const [hours, mins] = startTime.split(":").map(Number);
    const endMins = hours * 60 + mins + durationMinutes;
    if (endMins >= 24 * 60) return;
    const endHours = Math.floor(endMins / 60).toString().padStart(2, "0");
    const endMinsPart = (endMins % 60).toString().padStart(2, "0");
    const endLocal = `${date}T${endHours}:${endMinsPart}`;

    setSearching(true);
    setSearchError(null);
    setSearchAttempted(true);
    setSelectedCandidate(null);
    try {
      const { availabilityRepository } = useVenueServiceLocator();
      const result = await availabilityRepository.search({
        resourceId: props.resourceId,
        timeZoneId: props.timeZoneId,
        startLocal,
        endLocal,
        quantity: props.quantity,
      });
      if (result.isAvailable) {
        setCandidates([result]);
      } else {
        setCandidates([]);
        setSearchError(result.reason || props.t("booking360.reschedule.conflict"));
      }
    } catch {
      setSearchError(props.t("booking360.reschedule.conflict"));
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCandidate = (candidate: AvailabilitySearchResult) => {
    setSelectedCandidate(candidate);
    setStep("review");
  };

  const handleConfirm = () => {
    if (!selectedCandidate) return;
    props.onConfirmReschedule({
      resourceId: selectedCandidate.resourceId,
      requestedStartUtc: selectedCandidate.startUtc,
      requestedEndUtc: selectedCandidate.endUtc,
    });
  };

  const formatUtc = (utcStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: props.timeZoneId,
    }).format(new Date(utcStr));
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={props.disabled}>
          <CalendarSync className="size-4" aria-hidden="true" />
          {props.t("booking360.actions.reschedule")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl" dir={props.direction}>
        <DialogHeader>
          <DialogTitle>{props.t("booking360.reschedule.title")}</DialogTitle>
          <DialogDescription>{props.t("booking360.reschedule.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current schedule context box */}
          <div className="rounded-nx-sm border border-nx-line bg-nx-raised p-3 text-xs space-y-1" data-testid="reschedule-current-context">
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{props.t("booking360.reschedule.currentSchedule")}:</span>
              <span className="font-semibold text-nx-ink">{props.resourceName} ({props.facilityName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{props.t("booking360.schedule.time")}:</span>
              <span className="font-medium text-nx-ink tabular-nums">{formatUtc(props.currentStartUtc)} – {formatUtc(props.currentEndUtc)}</span>
            </div>
          </div>

          {searchError && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {step === "search" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="reschedule-date">{props.t("booking360.reschedule.date")}</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reschedule-time">{props.t("booking360.reschedule.startTime")}</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reschedule-duration">{props.t("booking360.reschedule.duration")}</Label>
                  <Input
                    id="reschedule-duration"
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" loading={searching} onClick={() => void handleSearch()}>
                  <CalendarClock className="size-4" aria-hidden="true" />
                  {searching ? props.t("booking360.reschedule.searching") : props.t("booking360.reschedule.search")}
                </Button>
              </div>

              {searching && <LoadingSpinner showText={false} />}

              {searchAttempted && !searching && candidates.length === 0 && (
                <p className="text-sm text-nx-ink-2">{props.t("booking360.reschedule.noCandidates")}</p>
              )}

              {candidates.length > 0 && (
                <div className="space-y-2 border-t border-nx-line pt-3" data-testid="reschedule-candidates">
                  <p className="text-xs font-semibold text-nx-ink-2">{props.t("booking360.reschedule.search")}</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {candidates.map((c) => (
                      <Button
                        type="button"
                        variant="outline"
                        key={`${c.startUtc}-${c.endUtc}`}
                        className="w-full text-start h-auto rounded-nx-sm border border-nx-line p-3 hover:bg-nx-hover flex items-center justify-between text-xs transition-colors font-normal"
                        onClick={() => handleSelectCandidate(c)}
                      >
                        <div className="text-start">
                          <p className="font-semibold text-nx-ink">{c.resourceName}</p>
                          <p className="text-nx-ink-2 tabular-nums">{formatUtc(c.startUtc)} – {formatUtc(c.endUtc)}</p>
                        </div>
                        <Badge variant="outline">{props.t("booking360.actions.reschedule")}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "review" && selectedCandidate && (
            <div className="space-y-4 border-t border-nx-line pt-3" data-testid="reschedule-review-step">
              <h4 className="text-xs font-semibold text-nx-ink">{props.t("booking360.reschedule.reviewTitle")}</h4>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-nx-sm border border-nx-line p-3 text-xs">
                <div className="space-y-1">
                  <span className="text-nx-ink-3 block text-[11px]">{props.t("booking360.reschedule.currentLabel")}</span>
                  <p className="font-medium text-nx-ink tabular-nums">{formatUtc(props.currentStartUtc)} – {formatUtc(props.currentEndUtc)}</p>
                </div>
                <ArrowLeft className="size-4 text-nx-ink-3 ltr:rotate-180" aria-hidden="true" />
                <div className="space-y-1">
                  <span className="text-nx-accent block font-medium text-[11px]">{props.t("booking360.reschedule.targetLabel")}</span>
                  <p className="font-medium text-nx-ink tabular-nums">{formatUtc(selectedCandidate.startUtc)} – {formatUtc(selectedCandidate.endUtc)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "review" ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setStep("search")}>
                {props.t("booking360.reschedule.cancel")}
              </Button>
              <Button type="button" size="sm" loading={props.disabled} onClick={handleConfirm}>
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {props.t("booking360.reschedule.confirm")}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                {props.t("booking360.reschedule.cancel")}
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
