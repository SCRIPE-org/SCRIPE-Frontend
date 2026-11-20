"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type {
  CrmActivity,
  SalesActivityKind,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  PagedActivitiesResult,
} from "../../domain/entities/CrmActivityEntity";

/** State contract for the activities timeline viewmodel. */
export interface ActivitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/** Configuration options for the activities viewmodel hook. */
export interface UseCrmActivitiesProps {
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly initialActivityKind?: SalesActivityKind;
}

/**
 * ViewModel hook orchestrating chronological sales interaction retrieval, activity logging,
 * and follow-up delegation using TanStack Query v5.
 */
export function useCrmActivitiesViewModel(props: UseCrmActivitiesProps = {}) {
  const { leadId, accountId, opportunityId, initialActivityKind } = props;
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();

  const [page] = useState(1);
  const [activityKindFilter, setActivityKindFilter] = useState<SalesActivityKind | "ALL">(
    initialActivityKind ?? "ALL"
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedActivityForFollowUp, setSelectedActivityForFollowUp] = useState<CrmActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasParentScope = Boolean(leadId || accountId || opportunityId);
  const activeKind = activityKindFilter !== "ALL" ? activityKindFilter : undefined;
  const filterParams = {
    page,
    pageSize: 20,
    leadId,
    accountId,
    opportunityId,
    activityKind: activeKind,
  };

  const activitiesQuery = useQuery<PagedActivitiesResult>(
    {
      queryKey: qk.crm.activities(tenantId, filterParams),
      queryFn: () => {
        const repo = getCrmContainer().activityRepository;
        if (!repo) throw new Error("Activities repository not configured");
        return repo.getActivities(filterParams);
      },
      enabled: hasParentScope,
      staleTime: 20_000,
    },
    safeQueryClient
  );

  const errorMsg = activitiesQuery.error instanceof Error ? activitiesQuery.error.message : null;
  const state: ActivitiesState = !hasParentScope
    ? { stage: "idle", items: [], totalCount: 0, page: 1, pageSize: 20, error: null }
    : {
        stage: activitiesQuery.isLoading ? "loading" : activitiesQuery.isError ? "failed" : "success",
        items: [...(activitiesQuery.data?.items ?? [])],
        totalCount: activitiesQuery.data?.totalCount ?? 0,
        page: activitiesQuery.data?.page ?? page,
        pageSize: activitiesQuery.data?.pageSize ?? 20,
        error: errorMsg,
      };

  const invalidateActivities = useCallback(
    () => safeQueryClient.invalidateQueries({ queryKey: qk.crm.activities(tenantId) }),
    [safeQueryClient, tenantId]
  );

  const handleCreateActivity = useCallback(
    async (data: {
      activityKind: SalesActivityKind;
      summary: string;
      bodyText?: string;
      containsPii?: boolean;
      occurredAtUtc?: string;
    }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = getCrmContainer().activityRepository;
        if (!repo) throw new Error("Activities repository not configured");
        const payload: CreateSalesActivityPayload = {
          activityKind: data.activityKind,
          summary: data.summary,
          bodyText: data.bodyText,
          leadId,
          accountId,
          opportunityId,
          containsPii: data.containsPii ?? false,
          occurredAtUtc: data.occurredAtUtc,
        };
        await repo.createActivity(payload);
        setIsCreateOpen(false);
        await invalidateActivities();
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to log sales activity");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [leadId, accountId, opportunityId, invalidateActivities]
  );

  const handleCreateFollowUp = useCallback(
    async (
      activityId: string,
      data: { title: string; description?: string; assigneeUserId: string; dueAtUtc?: string }
    ): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = getCrmContainer().activityRepository;
        if (!repo) throw new Error("Activities repository not configured");
        const payload: CreateActivityFollowUpPayload = {
          title: data.title,
          description: data.description,
          assigneeUserId: data.assigneeUserId,
          dueAtUtc: data.dueAtUtc,
        };
        await repo.createFollowUp(activityId, payload);
        setSelectedActivityForFollowUp(null);
        await invalidateActivities();
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to schedule follow-up task");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [invalidateActivities]
  );

  return {
    state,
    activityKindFilter,
    setActivityKindFilter,
    isCreateOpen,
    setIsCreateOpen,
    selectedActivityForFollowUp,
    setSelectedActivityForFollowUp,
    isSubmitting,
    submitError,
    setSubmitError,
    handleCreateActivity,
    handleCreateFollowUp,
    refresh: () => activitiesQuery.refetch().then(() => undefined),
  };
}
