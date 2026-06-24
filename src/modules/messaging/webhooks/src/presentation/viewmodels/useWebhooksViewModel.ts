/**
 * Webhooks List ViewModel
 *
 * Orchestrates the webhook subscription list page.
 * Uses useCrudViewModel for standard CRUD and additional
 * custom operations for toggle and inline actions.
 */
"use client";

import { useCallback } from "react";
import { messagingContainer } from "@modules/messaging/di";
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
 * Constant definition representing webhook keys.
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
 * React hook/ViewModel managing logic, state, and repository queries for webhooks view model.
 */
export function useWebhooksViewModel() {
  const { webhookRepository } = messagingContainer;
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
        title: t("webhooks.created") || "Webhook Created",
        description: t("webhooks.createdDesc") || "Webhook subscription created successfully.",
      });
      return result as unknown as WebhookSubscriptionListItem;
    },
    update: async (id: string, data: UpdateWebhookRequest) => {
      await webhookRepository.update(id, data);
      success({
        title: t("webhooks.updated") || "Webhook Updated",
        description: t("webhooks.updatedDesc") || "Webhook subscription updated successfully.",
      });
      return {} as WebhookSubscriptionListItem;
    },
    delete: async (id: string) => {
      await webhookRepository.remove(id);
      success({
        title: t("webhooks.deleted") || "Webhook Deleted",
        description: t("webhooks.deletedDesc") || "Webhook subscription deleted.",
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
      toastError({ title: t("common.error") || "Error", description: err.message });
    },
    onSuccess: () => {
      success({
        title: t("webhooks.toggled") || "Webhook Toggled",
        description: t("webhooks.toggledDesc") || "Webhook status updated.",
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
          label: t("webhooks.url") || "Endpoint URL",
          type: "text" as const,
          placeholder: t("webhooks.urlPlaceholder") || "https://your-server.com/webhook",
          required: true,
        },
        {
          name: "description",
          label: t("webhooks.description_field") || "Description",
          type: "text" as const,
          placeholder: t("webhooks.descriptionPlaceholder") || "What is this webhook for?",
        },
        {
          name: "events",
          label: t("webhooks.events") || "Events",
          type: "multi-select" as const,
          placeholder: t("webhooks.selectEvents") || "Select events to subscribe to",
          required: true,
          options: [], // Will be populated by EventTypePicker component
        },
      ],
      editFields: [
        {
          name: "url",
          label: t("webhooks.url") || "Endpoint URL",
          type: "text" as const,
          placeholder: t("webhooks.urlPlaceholder") || "https://your-server.com/webhook",
        },
        {
          name: "description",
          label: t("webhooks.description_field") || "Description",
          type: "text" as const,
          placeholder: t("webhooks.descriptionPlaceholder") || "What is this webhook for?",
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
        canCreate: "webhooks:create",
        canUpdate: "webhooks:update",
        canDelete: "webhooks:delete",
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
