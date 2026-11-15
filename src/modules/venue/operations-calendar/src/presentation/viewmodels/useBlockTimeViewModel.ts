"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import type { ResourceBlockKind } from "@modules/venue";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";
import { localPrefillForInstant } from "./useCalendarLayout";

export type BlockReasonType = "Maintenance" | "Unavailable";

interface UseBlockTimeViewModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: CalendarResource | null;
  instantUtc: string | null;
  resources: CalendarResource[];
  timeZoneId: string;
  onSuccess: () => void;
}

interface BlockTimeDraft {
  sessionKey: string;
  selectedResourceId: string;
  reasonType: BlockReasonType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: string;
  error: string | null;
}

function buildSessionDefaults(
  sessionKey: string,
  explicitResourceId: string,
  firstResourceId: string,
  instantUtc: string | null,
  timeZoneId: string,
  fallbackDate: string,
): BlockTimeDraft {
  const tz = timeZoneId || "UTC";
  const startMs = instantUtc ? Date.parse(instantUtc) : Number.NaN;
  if (instantUtc && Number.isFinite(startMs)) {
    const startLocal = localPrefillForInstant(instantUtc, tz);
    const endLocal = localPrefillForInstant(new Date(startMs + 60 * 60 * 1000).toISOString(), tz);
    return {
      sessionKey,
      selectedResourceId: explicitResourceId || firstResourceId,
      reasonType: "Maintenance",
      startDate: startLocal.date,
      startTime: startLocal.startTime,
      endDate: endLocal.date,
      endTime: endLocal.startTime,
      reason: "",
      error: null,
    };
  }

  return {
    sessionKey,
    selectedResourceId: explicitResourceId || firstResourceId,
    reasonType: "Maintenance",
    startDate: fallbackDate,
    startTime: "08:00",
    endDate: fallbackDate,
    endTime: "09:00",
    reason: "",
    error: null,
  };
}

/**
 * ViewModel for creating maintenance or blackout closures from the operations calendar.
 */
export function useBlockTimeViewModel({
  open,
  onOpenChange,
  resource,
  instantUtc,
  resources,
  timeZoneId,
  onSuccess,
}: UseBlockTimeViewModelProps) {
  const { t } = useI18n();
  const { availabilityRepository } = getVenueContainer();

  const [fallbackDate] = useState(
    () => localPrefillForInstant(new Date().toISOString(), timeZoneId || "UTC").date,
  );
  const firstResourceId = resources[0]?.id ?? "";
  const explicitResourceId = resource?.id ?? "";
  const sessionKey = open ? `${explicitResourceId}|${instantUtc ?? ""}|${timeZoneId}` : "closed";

  const baseDraft = buildSessionDefaults(
    sessionKey,
    explicitResourceId,
    firstResourceId,
    instantUtc,
    timeZoneId,
    fallbackDate,
  );

  const [draft, setDraft] = useState<BlockTimeDraft>(baseDraft);
  const [submitting, setSubmitting] = useState(false);

  const activeDraft = draft.sessionKey === sessionKey ? draft : baseDraft;
  const selectedResourceId = activeDraft.selectedResourceId || explicitResourceId || firstResourceId;

  const updateDraft = (patch: Partial<BlockTimeDraft>) => {
    setDraft((prev) => ({
      ...(prev.sessionKey === sessionKey ? prev : baseDraft),
      ...patch,
      sessionKey,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;

    setSubmitting(true);
    updateDraft({ error: null });
    try {
      const kind: ResourceBlockKind =
        activeDraft.reasonType === "Maintenance" ? "maintenance" : "blackout";
      const startLocal = `${activeDraft.startDate}T${activeDraft.startTime}:00`;
      const endLocal = `${activeDraft.endDate}T${activeDraft.endTime}:00`;

      await availabilityRepository.createBlock(kind, {
        resourceId: selectedResourceId,
        timeZoneId: timeZoneId || "UTC",
        startLocal,
        endLocal,
        hardBlock: true,
        reason:
          activeDraft.reason.trim() ||
          (activeDraft.reasonType === "Maintenance"
            ? t("operationsCalendar.blockTime.defaultMaintenanceReason")
            : t("operationsCalendar.blockTime.defaultUnavailableReason")),
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      updateDraft({
        error:
          err instanceof Error && err.message
            ? err.message
            : t("operationsCalendar.blockTime.failed"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    t,
    selectedResourceId,
    setSelectedResourceId: (selectedResourceId: string) => updateDraft({ selectedResourceId }),
    reasonType: activeDraft.reasonType,
    setReasonType: (reasonType: BlockReasonType) => updateDraft({ reasonType }),
    startDate: activeDraft.startDate,
    setStartDate: (startDate: string) => updateDraft({ startDate }),
    startTime: activeDraft.startTime,
    setStartTime: (startTime: string) => updateDraft({ startTime }),
    endDate: activeDraft.endDate,
    setEndDate: (endDate: string) => updateDraft({ endDate }),
    endTime: activeDraft.endTime,
    setEndTime: (endTime: string) => updateDraft({ endTime }),
    reason: activeDraft.reason,
    setReason: (reason: string) => updateDraft({ reason }),
    submitting,
    error: activeDraft.error,
    handleSubmit,
  };
}
