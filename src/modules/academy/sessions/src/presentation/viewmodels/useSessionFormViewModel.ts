"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { stripHtmlTags } from "@core/common/sanitize";
import { useAcademyServiceLocator } from "@modules/academy/di";
import type { GroupCoach } from "@modules/academy/groups/src/domain/entities/TrainingGroup";
import type { TrainingSession } from "../../domain/entities/TrainingSession";
import { addWallClockMinutes, localSessionTimeToUtc, utcToSessionInput } from "../../domain/session-time";
import { useSaveSession, useSessionScope } from "./useSessionsViewModel";
import type { SessionCopyKey } from "./useSessionsCopy";

type LocationMode = "ExternalLocation" | "PartnerReference";

interface FormFields {
  groupId: string;
  start?: string;
  end?: string;
  timeZone: string;
  coachIds: string[];
  substituteId: string;
  locationMode: LocationMode;
  locationId: string;
  partnerReference: string;
  objectivesEn: string;
  objectivesAr: string;
}

function plainText(input: string) {
  return stripHtmlTags(input).trim();
}

function createFields(initial?: TrainingSession): FormFields {
  const data = initial?.data;
  const timeZone = data?.timeZoneId ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    groupId: data?.groupId ?? "",


    timeZone,
    coachIds: data?.coaches.filter((coach) => !coach.isSubstitute).map((coach) => coach.staffMemberId) ?? [],
    substituteId: data?.coaches.find((coach) => coach.isSubstitute)?.staffMemberId ?? "",
    locationMode: data?.locationMode === "PartnerReference" ? "PartnerReference" : "ExternalLocation",
    locationId: data?.externalLocationId ?? "",
    partnerReference: data?.partnerReservationReference ?? "",
    objectivesEn: data?.objectivesEn ?? "",
    objectivesAr: data?.objectivesAr ?? "",
  };
}

function assignedOn(coach: GroupCoach, day: string) {
  return day
    ? coach.assignedDate.slice(0, 10) <= day && (!coach.unassignedDate || coach.unassignedDate.slice(0, 10) > day)
    : coach.isActive;
}

export function useSessionFormViewModel(initial: TrainingSession | undefined, onSaved: (session: TrainingSession) => void, onBusy: (busy: boolean) => void) {
  const { groupsRepository, locationsRepository, sessionsRepository } = useAcademyServiceLocator();
  const scope = useSessionScope();
  const [fields, setFields] = useState(() => createFields(initial));
  const [error, setError] = useState<SessionCopyKey | null>(null);
  const save = useSaveSession(initial);
  const groupId = fields.groupId;
  const groups = useQuery({
    queryKey: ["academy-sessions", ...scope, "groups", "active"],
    queryFn: () => groupsRepository.getGroups(undefined, undefined, "Active"),
    enabled: !initial,
    retry: false,
  });
  const group = useQuery({
    queryKey: ["academy-sessions", ...scope, "group", groupId],
    queryFn: () => groupsRepository.getGroupById(groupId),
    enabled: Boolean(groupId),
    retry: false,
  });
  const context = useQuery({
    queryKey: ["academy-sessions", ...scope, "context", groupId],
    queryFn: ({ signal }) => sessionsRepository.groupContext(groupId, signal),
    enabled: Boolean(groupId),
    retry: false,
  });
  const branchId = context.data?.branchId;
  const sportId = context.data?.sportId;
  const locations = useQuery({
    queryKey: ["academy-sessions", ...scope, "locations", branchId],
    queryFn: () => locationsRepository.fetchLocations(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });
  const substitutes = useQuery({
    queryKey: ["academy-sessions", ...scope, "substitutes", sportId],
    queryFn: () => groupsRepository.getAvailableCoaches(sportId),
    enabled: Boolean(sportId),
    retry: false,
  });
  const selectedTimeZone = context.data?.timeZoneId ?? fields.timeZone;
  const displayTimeZone = context.data?.timeZoneId ?? initial?.data.timeZoneId;
  const start = fields.start ?? (initial && displayTimeZone ? utcToSessionInput(initial.data.startUtc, displayTimeZone) : "");
  const end = fields.end ?? (initial && displayTimeZone ? utcToSessionInput(initial.data.endUtc, displayTimeZone) : "");
  const groupCoaches = group.data?.coaches ?? [];
  const coachOptions = groupCoaches.filter((coach) =>
    coach.staffFullName && assignedOn(coach, start.slice(0, 10)) && assignedOn(coach, end.slice(0, 10)));
  const unavailableCoaches = fields.coachIds
    .filter((id) => !coachOptions.some((coach) => coach.staffMemberId === id))
    .map((id) => ({
      id,
      name: groupCoaches.find((coach) => coach.staffMemberId === id)?.staffFullName ??
        initial?.data.coaches.find((coach) => coach.staffMemberId === id)?.fullName,
    }));
  const locationOptions = (locations.data ?? []).filter((location) =>
    location.isActive && (!location.branchId || location.branchId === branchId));
  const initialSubstitute = initial?.data.coaches.find((coach) => coach.isSubstitute);
  const substituteOptions = (substitutes.data ?? []).filter((coach) =>
    !fields.coachIds.includes(coach.staffMemberId));
  const optionsError = (!initial && groups.isError) || group.isError || context.isError ||
    locations.isError;
  const optionsPending = (!initial && groups.isPending) ||
    (Boolean(groupId) && (group.isPending || context.isPending)) ||
    (Boolean(branchId) && locations.isPending);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setError(null);
    setFields((prior) => {
      const next = { ...prior, [key]: value };
      // When start changes, revalidate and ensure end > start
      if (key === "start" && typeof value === "string" && value) {
        const currentEnd = next.end ?? (initial && displayTimeZone ? utcToSessionInput(initial.data.endUtc, displayTimeZone) : "");
        if (!currentEnd || currentEnd <= value) {
          const suggestedEnd = addWallClockMinutes(value, 60);
          if (suggestedEnd) next.end = suggestedEnd;
        }
      }
      return next;
    });
  }

  function chooseGroup(id: string) {
    setError(null);
    setFields((prior) => ({ ...prior, groupId: id, coachIds: [], substituteId: "", locationId: "" }));
  }

  function toggleCoach(id: string, checked: boolean) {
    setError(null);
    setFields((prior) => ({
      ...prior,
      coachIds: checked ? [...prior.coachIds, id] : prior.coachIds.filter((coachId) => coachId !== id),
      substituteId: checked && prior.substituteId === id ? "" : prior.substituteId,
    }));
  }

  function retryOptions() {
    if (groups.isError) void groups.refetch();
    if (group.isError) void group.refetch();
    if (context.isError) void context.refetch();
    if (locations.isError) void locations.refetch();
    if (substitutes.isError) void substitutes.refetch();
  }

  function submit() {
    const partnerReference = plainText(fields.partnerReference);
    if (!groupId || !start || !end || fields.coachIds.length === 0 ||
      !fields.locationId || (fields.locationMode === "PartnerReference" && !partnerReference)) {
      setError("requiredFields");
      return;
    }
    if (optionsError || optionsPending || save.isPending) return;
    if (unavailableCoaches.length > 0) {
      setError("coachChanged");
      return;
    }
    if (!locationOptions.some(({ id }) => id === fields.locationId)) {
      setError("locationChanged");
      return;
    }
    const timeZone = selectedTimeZone.trim();
    if (fields.coachIds.length + Number(Boolean(fields.substituteId)) > 12) {
      setError("tooManyCoaches");
      return;
    }
    const originalTimeZone = initial?.data.timeZoneId;
    const keepUtc = Boolean(context.data?.timeZoneId) || timeZone === originalTimeZone;
    const startsAt = initial && fields.start === undefined && keepUtc
      ? { utc: new Date(initial.data.startUtc).toISOString() }
      : localSessionTimeToUtc(start, timeZone);
    const endsAt = initial && fields.end === undefined && keepUtc
      ? { utc: new Date(initial.data.endUtc).toISOString() }
      : localSessionTimeToUtc(end, timeZone);
    if ("error" in startsAt) { setError(startsAt.error); return; }
    if ("error" in endsAt) { setError(endsAt.error); return; }
    if (endsAt.utc <= startsAt.utc) { setError("invalidOrder"); return; }

    onBusy(true);
    save.mutate({
      groupId,
      startUtc: startsAt.utc,
      endUtc: endsAt.utc,
      timeZoneId: timeZone,
      coachStaffMemberIds: fields.coachIds,
      substituteCoachStaffMemberId: fields.substituteId || null,
      objectivesEn: plainText(fields.objectivesEn) || null,
      objectivesAr: plainText(fields.objectivesAr) || null,
      locationMode: fields.locationMode,
      externalLocationId: fields.locationId,
      partnerReservationReference: fields.locationMode === "PartnerReference" ? partnerReference : null,
    }, { onSuccess: onSaved, onSettled: () => onBusy(false) });
  }

  return {
    fields, start, end, update, chooseGroup, toggleCoach, coachOptions, unavailableCoaches, locationOptions, substituteOptions, initialSubstitute,
    group, groups, context, substitutes, selectedTimeZone, optionsError, optionsPending, retryOptions,
    error, save, submit,
  };
}
