"use client";

import { useEffect, useState } from "react";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import {
  type ClickToBookSlotPolicy,
  resolveActiveSlotPolicy,
} from "./clickToBookFormatters";

type VenueContainer = ReturnType<typeof getVenueContainer>;

/**
 * Resolves and caches the slot policy for the currently selected resource.
 */
export function useResourceSlotPolicy(
  selectedResource: CalendarResource | null,
  schedulableResourceRepository: VenueContainer["schedulableResourceRepository"],
): ClickToBookSlotPolicy | null {
  const [fetchedPolicy, setFetchedPolicy] = useState<{
    resourceId: string;
    policy: ClickToBookSlotPolicy;
  } | null>(null);

  useEffect(() => {
    if (!selectedResource || selectedResource.slotPolicy || !schedulableResourceRepository?.getById) {
      return;
    }
    const targetId = selectedResource.id;
    let active = true;
    Promise.resolve(schedulableResourceRepository.getById(targetId))
      .then((res) => {
        if (active && res?.slotPolicy) {
          setFetchedPolicy({
            resourceId: targetId,
            policy: {
              slotDurationMinutes: res.slotPolicy.slotDurationMinutes,
              startIncrementMinutes: res.slotPolicy.startIncrementMinutes,
              allowMultiSlot: res.slotPolicy.allowMultiSlot ?? false,
            },
          });
        }
      })
      .catch(() => {
        if (active) {
          setFetchedPolicy({
            resourceId: targetId,
            policy: { slotDurationMinutes: 60, allowMultiSlot: false },
          });
        }
      });
    return () => {
      active = false;
    };
  }, [selectedResource, schedulableResourceRepository]);

  return resolveActiveSlotPolicy(selectedResource, fetchedPolicy);
}

/**
 * Manages temporary hold expiry countdown state tied to `holdExpiresAtUtc`.
 */
export function useHoldCountdown() {
  const [holdExpiresAtUtc, setHoldExpiresAtUtc] = useState<string | null>(null);
  const [rawHoldCountdown, setHoldCountdown] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);

  const holdCountdown = holdExpiresAtUtc ? rawHoldCountdown : null;

  useEffect(() => {
    if (!holdExpiresAtUtc) return;

    const targetTime = new Date(holdExpiresAtUtc).getTime();
    const updateTimer = () => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setHoldCountdown(null);
        setHoldExpired(true);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setHoldCountdown(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAtUtc]);

  return {
    holdExpiresAtUtc,
    setHoldExpiresAtUtc,
    holdCountdown,
    setHoldCountdown,
    holdExpired,
    setHoldExpired,
  };
}
