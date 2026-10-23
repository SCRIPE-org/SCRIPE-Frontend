"use client";

import { useState, useCallback } from "react";
import { getVenueContainer } from "@modules/venue/di";

export interface CheckSlotParams {
  resourceId: string;
  selectedDate: string;
  startTime: string;
  durationMinutes: number;
  timeZoneId: string;
}

export interface CheckSlotResult {
  isAvailable: boolean;
  message?: string;
}

/**
 * ViewModel for checking slot availability in Operations Calendar.
 * Encapsulates DI access away from presentation components.
 */
export function useFindAvailableSlotsViewModel() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckSlotResult | null>(null);

  const checkSlot = useCallback(
    async (params: CheckSlotParams, successMsg: string, unavailMsg: string, failedMsg: string) => {
      const { resourceId, selectedDate, startTime, durationMinutes, timeZoneId } = params;
      if (!resourceId) return;

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
          resourceId,
          timeZoneId: timeZoneId || "UTC",
          startLocal,
          endLocal,
          quantity: 1,
        });

        setResult({
          isAvailable: res.isAvailable,
          message: res.isAvailable ? successMsg : unavailMsg,
        });
      } catch {
        setResult({
          isAvailable: false,
          message: failedMsg,
        });
      } finally {
        setChecking(false);
      }
    },
    []
  );

  const resetResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    checking,
    result,
    setResult,
    checkSlot,
    resetResult,
  };
}
