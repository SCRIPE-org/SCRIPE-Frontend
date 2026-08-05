/**
 * Webhooks List ViewModel
 *
 * Orchestrates the webhook subscription list page.
 * Uses useCrudViewModel for standard CRUD and additional
 * custom operations for toggle and inline actions.
 */
"use client";

import { useCallback } from "react";
import { integrationsContainer } from "@modules/integrations/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { WebhookSubscriptionListItem } from "../../domain/entities/Webhook";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "../../domain/entities/WebhookRequests";
import { qk } from "@core/common/query-keys";

// Backward-compatible local keys (delegates to qk factory)
/**
 * Exported constant defining parameters and fields for webhook keys configurations.
 */
export const webhookKeys = {
  all: qk.webhooks.all,
  list: (filters: Record<string, unknown>) => qk.webhooks.list(filters),
  detail: (id: string) => qk.webhooks.detail(id),
  deliveries: (id: string, params?: Record<string, unknown>) => qk.webhooks.deliveries(id, params),
  events: ["webhooks", "events"] as const,
  health: ["webhooks", "health"] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for webhooks view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useWebhooksViewModel() {
  const { webhookRepository } = integrationsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  // ============ Core CRUD ViewModel ============
  const vm = useCrudViewModel<
    WebhookSubscriptionListItem,
    CreateWebhookRequest,
    UpdateWebhookRequest
  >([...webhookKeys.all], {
    getAll: async (params) => {
      const res = await webhookRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil(res.totalCount / params.pageSize),
        },
      };
    },
    create: async (data: CreateWebhookRequest) => {
      const result = await webhookRepository.create(data);
      success({
        title: t("webhooks.created"),
        description: t("webhooks.createdDesc"),
      });
      return result as unknown as WebhookSubscriptionListItem;
    },
    update: async (id: string, data: UpdateWebhookRequest) => {
      await webhookRepository.update(id, data);
      success({
        title: t("webhooks.updated"),
        description: t("webhooks.updatedDesc"),
      });
      return {} as WebhookSubscriptionListItem;
    },
    delete: async (id: string) => {
      await webhookRepository.remove(id);
      success({
        title: t("webhooks.deleted"),
        description: t("webhooks.deletedDesc"),
      });
    },
  });

  // ============ Toggle Mutation — Optimistic Update ============
  const toggleMutation = useMutation({
    mutationFn: (id: string) => webhookRepository.toggle(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: qk.webhooks.all });
      const previousData = queryClient.getQueriesData({ queryKey: qk.webhooks.lists() });
      // Optimistically flip isActive on the matching webhook in all list caches
      queryClient.setQueriesData({ queryKey: qk.webhooks.lists() }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { items?: Array<{ id: string; isActive: boolean }> };
        if (!data.items) return old;
        return {
          ...data,
          items: data.items.map((item) =>
            item.id === id ? { ...item, isActive: !item.isActive } : item
          ),
        };
      });
      return { previousData };
    },
    onError: (err: Error, _, context?: { previousData: [readonly unknown[], unknown][] }) => {
      // Roll back all list caches
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toastError({ title: t("common.error"), description: err.message });
    },
    onSuccess: () => {
      success({
        title: t("webhooks.toggled"),
        description: t("webhooks.toggledDesc"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.webhooks.all });
    },
  });

  // ============ Health Summary Query ============
  const { data: healthSummary, isLoading: isLoadingHealth } = useQuery({
    queryKey: webhookKeys.health,
    queryFn: () => webhookRepository.getHealthSummary(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  // ============ Config Base ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<WebhookSubscriptionListItem>> => ({
      createFields: [
        {
          name: "url",
          label: t("webhooks.url"),
          type: "text" as const,
          placeholder: t("webhooks.urlPlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("webhooks.description_field"),
          type: "text" as const,
          placeholder: t("webhooks.descriptionPlaceholder"),
        },
        {
          name: "events",
          label: t("webhooks.events"),
          type: "multi-select" as const,
          placeholder: t("webhooks.selectEvents"),
          required: true,
          options: [], // Will be populated by EventTypePicker component
        },
      ],
      editFields: [
        {
          name: "url",
          label: t("webhooks.url"),
          type: "text" as const,
          placeholder: t("webhooks.urlPlaceholder"),
        },
        {
          name: "description",
          label: t("webhooks.description_field"),
          type: "text" as const,
          placeholder: t("webhooks.descriptionPlaceholder"),
        },
      ],
      createInitialValues: {
        url: "",
        description: "",
        events: [] as string[],
      },
      editInitialValues: (item: WebhookSubscriptionListItem) => ({
        id: item.id,
        url: item.url,
        description: item.description || "",
      }),
      getItemDisplayName: (item: WebhookSubscriptionListItem) => item.description || item.url,
      deleteService: async (id: string) => {
        await webhookRepository.remove(id);
      },
      permissions: {
        canCreate: "webhooks.create",
        canUpdate: "webhooks.update",
        canDelete: "webhooks.delete",
      },
    }),
    [t, webhookRepository]
  );

  return {
    vm,
    getConfigBase,
    handleToggle: (id: string) => toggleMutation.mutate(id),
    isToggling: toggleMutation.isPending,
    healthSummary: healthSummary ?? null,
    isLoadingHealth,
    t,
  };
}
