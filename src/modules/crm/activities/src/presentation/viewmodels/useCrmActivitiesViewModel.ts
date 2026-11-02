"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmActivity,
  SalesActivityKind,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
} from "../../domain/entities/CrmActivityEntity";

/**
 * State contract for the activities timeline viewmodel.
 */
export interface ActivitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * Configuration options for the activities viewmodel hook.
 */
export interface UseCrmActivitiesProps {
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly initialActivityKind?: SalesActivityKind;
}

/**
 * ViewModel hook orchestrating chronological sales interaction retrieval, activity logging, and follow-up delegation.
 * @param props - Filter criteria and initial parameters for the activities query.
 * @returns State and mutation methods for the sales activity timeline.
 */
export function useCrmActivitiesViewModel(props: UseCrmActivitiesProps = {}) {
  const { leadId, accountId, opportunityId, initialActivityKind } = props;

  const [state, setState] = useState<ActivitiesState>({
    stage: "idle",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [activityKindFilter, setActivityKindFilter] = useState<SalesActivityKind | "ALL">(
    initialActivityKind ?? "ALL"
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedActivityForFollowUp, setSelectedActivityForFollowUp] = useState<CrmActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadActivities = useCallback(
    async (pageToLoad = 1, kind?: SalesActivityKind | "ALL") => {
      // If no parent filter is provided, remain idle or don't query until a parent is provided
      if (!leadId && !accountId && !opportunityId) {
        setState({
          stage: "idle",
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 20,
          error: null,
        });
        return;
      }

      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        if (!container.activityRepository) {
          throw new Error("Activities repository not configured");
        }
        const activeKind = kind && kind !== "ALL" ? kind : undefined;
        const result = await container.activityRepository.getActivities({
          page: pageToLoad,
          pageSize: 20,
          leadId,
          accountId,
          opportunityId,
          activityKind: activeKind,
        });

        startTransition(() => {
          setState({
            stage: "success",
            items: [...(result.items ?? [])],
            totalCount: result.totalCount ?? 0,
            page: result.page ?? pageToLoad,
            pageSize: result.pageSize ?? 20,
            error: null,
          });
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load CRM activities";
        startTransition(() => {
          setState((prev) => ({
            ...prev,
            stage: "failed",
            error: message,
          }));
        });
      }
    },
    [leadId, accountId, opportunityId]
  );

  useEffect(() => {
    loadActivities(1, activityKindFilter);
  }, [loadActivities, activityKindFilter]);

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
        const container = getCrmContainer();
        if (!container.activityRepository) {
          throw new Error("Activities repository not configured");
        }
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

        await container.activityRepository.createActivity(payload);
        setIsCreateOpen(false);
        await loadActivities(1, activityKindFilter);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to log sales activity";
        setSubmitError(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [leadId, accountId, opportunityId, activityKindFilter, loadActivities]
  );

  const handleCreateFollowUp = useCallback(
    async (
      activityId: string,
      data: {
        title: string;
        description?: string;
        assigneeUserId: string;
        dueAtUtc?: string;
      }
    ): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        if (!container.activityRepository) {
          throw new Error("Activities repository not configured");
        }
        const payload: CreateActivityFollowUpPayload = {
          title: data.title,
          description: data.description,
          assigneeUserId: data.assigneeUserId,
          dueAtUtc: data.dueAtUtc,
        };

        await container.activityRepository.createFollowUp(activityId, payload);
        setSelectedActivityForFollowUp(null);
        await loadActivities(state.page, activityKindFilter);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to schedule follow-up task";
        setSubmitError(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [activityKindFilter, loadActivities, state.page]
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
    refresh: () => loadActivities(state.page, activityKindFilter),
  };
}
