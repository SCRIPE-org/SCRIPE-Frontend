"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@core/hooks/use-permission";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared/permission-constants";
import { SessionRequestError, type SessionAction, type SessionSchedule, type SessionStatus, type TrainingSession } from "../../domain/entities/TrainingSession";
import type { SessionCopyKey } from "./useSessionsCopy";

const PAGE_SIZE = 25;

export interface FilterInput {
  from: string;
  through: string;
  group: string;
  status: SessionStatus | "";
}

const defaultFilters: FilterInput = { from: "", through: "", group: "", status: "" };

function startOfUtcDay(date: string) {
  return new Date(date + "T00:00:00Z");
}

function afterUtcDay(date: string) {
  const end = startOfUtcDay(date);
  end.setUTCDate(end.getUTCDate() + 1);
  return end.toISOString();
}

export function useSessionScope() {
  const impersonatedTenantId = useCurrentTenantId();
  const tenantId = useAppStore((state) => state.user?.tenantId);
  const userId = useAppStore((state) => state.user?.id);
  return [impersonatedTenantId ?? tenantId, userId] as const;
}

function sessionKeys(scope: ReturnType<typeof useSessionScope>) {
  const base = ["academy-sessions", ...scope] as const;
  return {
    list: [...base, "list"] as const,
    detail: (id: string) => [...base, "detail", id] as const,
    groups: [...base, "groups"] as const,
  };
}

export function useSessionsViewModel() {
  const { sessionsRepository, groupsRepository } = useAcademyServiceLocator();
  const scope = useSessionScope();
  const keys = sessionKeys(scope);
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_CREATE);
  const canSeeGroups = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW);
  const [input, setInput] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState<SessionCopyKey | null>(null);
  const [created, setCreated] = useState<TrainingSession | null>(null);
  const query = useQuery({
    queryKey: [...keys.list, filters, page],
    enabled: canView,
    retry: false,
    queryFn: ({ signal }) => sessionsRepository.list({
      page, pageSize: PAGE_SIZE,
      fromUtc: filters.from ? startOfUtcDay(filters.from).toISOString() : undefined,
      toUtc: filters.through ? afterUtcDay(filters.through) : undefined,
      groupId: filters.group || undefined,
      status: filters.status || undefined,
    }, signal),
  });
  const groups = useQuery({
    queryKey: [...keys.groups, "all"],
    queryFn: () => groupsRepository.getGroups(),
    enabled: canView && canSeeGroups,
    retry: false,
  });

  function applyFilters() {
    if (input.from && input.through && input.from > input.through) {
      setFilterError("invalidDates");
      return;
    }
    setFilterError(null);
    setPage(1);
    setFilters(input);
  }

  function clearFilters() {
    setInput(defaultFilters);
    setFilters(defaultFilters);
    setPage(1);
    setFilterError(null);
  }

  function sessionCreated(session: TrainingSession) {
    clearFilters();
    setCreated(session);
  }

  return {
    query, groups, canView, canCreate, canSeeGroups, input, setInput, filterError, applyFilters,
    clearFilters, page, setPage, filtered: Object.values(filters).some(Boolean), created, sessionCreated,
  };
}

export function useSessionDetailViewModel(id: string) {
  const { sessionsRepository } = useAcademyServiceLocator();
  const keys = sessionKeys(useSessionScope());
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_UPDATE);
  const canCancel = usePermission("academy-sessions.cancel");
  const [notice, setNotice] = useState<SessionCopyKey | null>(null);
  const query = useQuery({
    queryKey: keys.detail(id),
    queryFn: ({ signal }) => sessionsRepository.get(id, signal),
    enabled: canView,
    retry: false,
  });

  return { query, canView, canUpdate, canCancel, notice, setNotice };
}

export function useSaveSession(initial?: TrainingSession) {
  const { sessionsRepository } = useAcademyServiceLocator();
  const queryClient = useQueryClient();
  const keys = sessionKeys(useSessionScope());
  return useMutation({
    mutationFn: (schedule: SessionSchedule) => initial
      ? sessionsRepository.reschedule(initial.id, initial.version, schedule)
      : sessionsRepository.create(schedule),
    onSuccess: (saved) => {
      queryClient.setQueryData(keys.detail(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useTransitionSession(initial: TrainingSession, action: SessionAction) {
  const { sessionsRepository } = useAcademyServiceLocator();
  const queryClient = useQueryClient();
  const keys = sessionKeys(useSessionScope());
  return useMutation({
    mutationFn: (reason?: string) => sessionsRepository.transition(initial.id, action, initial.version, reason),
    onSuccess: (saved) => {
      queryClient.setQueryData(keys.detail(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function sessionErrorKey(error: unknown, operation: "read" | "create" | "update" | "transition"): SessionCopyKey {
  if (error instanceof SessionRequestError) {
    if (error.kind === "conflict" && operation === "create") return "createConflict";
    if (error.kind === "invalid" && operation === "transition") return "invalidAction";
    if (error.kind !== "unavailable") return error.kind;
  }
  return operation === "read" ? "unavailable" : "saveFailed";
}
