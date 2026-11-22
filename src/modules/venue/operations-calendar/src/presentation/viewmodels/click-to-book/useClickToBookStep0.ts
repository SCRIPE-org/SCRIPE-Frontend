"use client";

import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import { toLocalIsoDateTime } from "./clickToBookIntents";

type VenueContainer = ReturnType<typeof getVenueContainer>;

interface UseClickToBookStep0Props {
  commercialPricingRepository: VenueContainer["commercialPricingRepository"];
  availabilityRepository: VenueContainer["availabilityRepository"];
  selectedResource: CalendarResource | null;
  startUtc: string;
  endUtc: string;
  timeZoneId: string;
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
  setStep: (step: number) => void;
  setStep0Error: (value: string | null) => void;
  setStep0Checking: (value: boolean) => void;
}

const STEP0_REASON_KEY_MAP: Record<string, string> = {
  "availability.baseClosed": "operationsCalendar.clickToBook.step0.courtClosed",
  "availability.maintenance": "operationsCalendar.clickToBook.step0.courtMaintenance",
  "availability.capacityInsufficient": "operationsCalendar.clickToBook.step0.courtBooked",
};

/**
 * Sub-hook handling Global Mode B Step 0 pricing readiness and availability preflight.
 */
export function useClickToBookStep0({
  commercialPricingRepository,
  availabilityRepository,
  selectedResource,
  startUtc,
  endUtc,
  timeZoneId,
  tRef,
  setStep,
  setStep0Error,
  setStep0Checking,
}: UseClickToBookStep0Props) {
  const handleStep0Next = useCallback(async () => {
    if (!selectedResource) return;
    setStep0Checking(true);
    setStep0Error(null);
    try {
      const tz = timeZoneId || "UTC";
      const startLocal = toLocalIsoDateTime(startUtc, tz);
      const endLocal = toLocalIsoDateTime(endUtc, tz);

      if (commercialPricingRepository?.getResourceConfiguration) {
        try {
          const pricingConfig = await commercialPricingRepository.getResourceConfiguration(
            selectedResource.id,
          );
          if (
            pricingConfig?.effectiveFromUtc &&
            Date.parse(pricingConfig.effectiveFromUtc) > Date.now()
          ) {
            setStep0Error(tRef.current("operationsCalendar.clickToBook.step0.pricingActivating"));
            return;
          }
        } catch {
          // Proceed to availability preflight when pricing config is transient
        }
      }

      if (availabilityRepository?.search) {
        let res;
        try {
          res = await availabilityRepository.search({
            resourceId: selectedResource.id,
            timeZoneId: tz,
            startLocal,
            endLocal,
            quantity: 1,
          });
        } catch (searchErr) {
          const errMsg = searchErr instanceof Error ? searchErr.message : "";
          const lowered = errMsg.toLowerCase();
          if (
            lowered.includes("notsearchable") ||
            lowered.includes("not published") ||
            lowered.includes("draft")
          ) {
            setStep0Error(tRef.current("operationsCalendar.clickToBook.step0.courtDraftError"));
            return;
          }
        }

        if (res && res.isAvailable === false) {
          const key =
            STEP0_REASON_KEY_MAP[res.reasonCode ?? ""] ??
            "operationsCalendar.clickToBook.step0.slotUnavailable";
          setStep0Error(tRef.current(key));
          return;
        }
      }

      setStep(1);
    } catch {
      setStep(1);
    } finally {
      setStep0Checking(false);
    }
  }, [
    availabilityRepository,
    commercialPricingRepository,
    endUtc,
    selectedResource,
    setStep,
    setStep0Checking,
    setStep0Error,
    startUtc,
    tRef,
    timeZoneId,
  ]);

  return { handleStep0Next };
}
