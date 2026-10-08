"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle2, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@core/ui/dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useVenueServiceLocator } from "@modules/venue";
import type { AvailabilitySearchResult } from "@modules/venue";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  currentResourceId: string;
  currentResourceName: string;
  currentFacilityName: string;
  currentStartUtc: string;
  currentEndUtc: string;
  timeZoneId: string;
  quantity: number;
  direction: "ltr" | "rtl";
  disabled: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onConfirmChangeResource: (input: { targetResourceId: string; requestedStartUtc: string; requestedEndUtc: string }) => void;
}

/**
 * Documentation for module export
 */
export function BookingChangeResourceDialog(props: Props) {
  const {
    currentEndUtc,
    currentResourceId,
    currentStartUtc,
    facilityId,
    quantity,
    t,
    timeZoneId,
  } = props;
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<AvailabilitySearchResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<AvailabilitySearchResult | null>(null);
  const [step, setStep] = useState<"search" | "review">("search");
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSearching(false);
    setCandidates([]);
    setSelectedCandidate(null);
    setStep("search");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    props.onOpenChange(open);
    if (!open) resetState();
  };

  const searchAlternativeResources = useCallback(async () => {
    if (!facilityId || !currentStartUtc || !currentEndUtc) return;
    setSearching(true);
    setError(null);
    setSelectedCandidate(null);
    try {
      const { schedulableResourceRepository, availabilityRepository, facilityResourceProfileRepository } = useVenueServiceLocator();
      const [resourcePage, profilePage] = await Promise.all([
        schedulableResourceRepository.getAll({ page: 1, pageSize: 100 }),
        facilityResourceProfileRepository.getAll({ page: 1, pageSize: 100 }),
      ]);
      const profilesMap = new Map(profilePage.items.map((p) => [p.id, p]));
      const facilityResourceIds = resourcePage.items
        .filter((r) => r.isPublished && !r.isComposite && r.id !== currentResourceId)
        .filter((r) => profilesMap.get(r.facilityResourceProfileId)?.facilityId === facilityId)
        .map((r) => r.id);

      if (facilityResourceIds.length === 0) {
        setCandidates([]);
        return;
      }

      // Convert UTC interval to local strings for availability search API
      const startLocal = localStringForUtc(currentStartUtc, timeZoneId);
      const endLocal = localStringForUtc(currentEndUtc, timeZoneId);

      const searchPromises = facilityResourceIds.map((resId) =>
        availabilityRepository.search({
          resourceId: resId,
          timeZoneId,
          startLocal,
          endLocal,
          quantity,
        }).catch(() => null)
      );

      const searchResults = await Promise.all(searchPromises);
      const available = searchResults.filter((c): c is AvailabilitySearchResult => c !== null && c.isAvailable);
      setCandidates(available);
    } catch {
      setError(t("booking360.changeResource.conflict"));
    } finally {
      setSearching(false);
    }
  }, [
    currentEndUtc,
    currentResourceId,
    currentStartUtc,
    facilityId,
    quantity,
    t,
    timeZoneId,
  ]);

  useEffect(() => {
    if (props.open && step === "search") {
      void Promise.resolve().then(() => {
        void searchAlternativeResources();
      });
    }
  }, [props.open, searchAlternativeResources, step]);

  const handleSelectCandidate = (candidate: AvailabilitySearchResult) => {
    setSelectedCandidate(candidate);
    setStep("review");
  };

  const handleConfirm = () => {
    if (!selectedCandidate) return;
    props.onConfirmChangeResource({
      targetResourceId: selectedCandidate.resourceId,
      requestedStartUtc: props.currentStartUtc,
      requestedEndUtc: props.currentEndUtc,
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
          <Layers className="size-4" aria-hidden="true" />
          {props.t("booking360.actions.changeResource")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl" dir={props.direction}>
        <DialogHeader>
          <DialogTitle>{props.t("booking360.changeResource.title")}</DialogTitle>
          <DialogDescription>{props.t("booking360.changeResource.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current resource context box */}
          <div className="rounded-nx-sm border border-nx-line bg-nx-raised p-3 text-xs space-y-1" data-testid="change-resource-current-context">
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{props.t("booking360.changeResource.currentResource")}:</span>
              <span className="font-semibold text-nx-ink">{props.currentResourceName} ({props.currentFacilityName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-2">{props.t("booking360.schedule.time")}:</span>
              <span className="font-medium text-nx-ink tabular-nums">{formatUtc(props.currentStartUtc)} – {formatUtc(props.currentEndUtc)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "search" && (
            <div className="space-y-4">
              {searching ? (
                <div className="py-6 text-center space-y-2">
                  <LoadingSpinner showText={false} />
                  <p className="text-xs text-nx-ink-2">{props.t("booking360.changeResource.searching")}</p>
                </div>
              ) : candidates.length === 0 ? (
                <p className="text-sm text-nx-ink-2 py-4">{props.t("booking360.changeResource.noCandidates")}</p>
              ) : (
                <div className="space-y-2" data-testid="change-resource-candidates">
                  <p className="text-xs font-semibold text-nx-ink-2">{props.t("booking360.changeResource.search")}</p>
                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {candidates.map((c) => (
                      <Button
                        type="button"
                        variant="outline"
                        key={c.resourceId}
                        className="w-full text-start h-auto rounded-nx-sm border border-nx-line p-3 hover:bg-nx-hover flex items-center justify-between text-xs transition-colors font-normal"
                        onClick={() => handleSelectCandidate(c)}
                      >
                        <div className="text-start">
                          <p className="font-semibold text-nx-ink">{c.resourceName}</p>
                          <p className="text-nx-ink-2 tabular-nums">{formatUtc(c.startUtc)} – {formatUtc(c.endUtc)}</p>
                        </div>
                        <Badge variant="outline">{props.t("booking360.actions.changeResource")}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "review" && selectedCandidate && (
            <div className="space-y-4 border-t border-nx-line pt-3" data-testid="change-resource-review-step">
              <h4 className="text-xs font-semibold text-nx-ink">{props.t("booking360.changeResource.reviewTitle")}</h4>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-nx-sm border border-nx-line p-3 text-xs">
                <div className="space-y-1">
                  <span className="text-nx-ink-3 block text-[11px]">{props.t("booking360.changeResource.currentLabel")}</span>
                  <p className="font-medium text-nx-ink">{props.currentResourceName}</p>
                </div>
                <ArrowRight className="size-4 text-nx-ink-3 rtl:rotate-180" aria-hidden="true" />
                <div className="space-y-1">
                  <span className="text-nx-accent block font-medium text-[11px]">{props.t("booking360.changeResource.targetLabel")}</span>
                  <p className="font-medium text-nx-ink">{selectedCandidate.resourceName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "review" ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setStep("search")}>
                {props.t("booking360.changeResource.cancel")}
              </Button>
              <Button type="button" size="sm" loading={props.disabled} onClick={handleConfirm}>
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {props.t("booking360.changeResource.confirm")}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                {props.t("booking360.changeResource.cancel")}
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function localStringForUtc(utcStr: string, timeZoneId: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timeZoneId,
  }).formatToParts(new Date(utcStr));
  const val = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${val("year")}-${val("month")}-${val("day")}T${val("hour")}:${val("minute")}`;
}
