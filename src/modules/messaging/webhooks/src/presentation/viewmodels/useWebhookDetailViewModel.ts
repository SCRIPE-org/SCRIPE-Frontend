/**
 * Webhook Detail ViewModel
 *
 * Orchestrates the webhook detail page with tabs:
 * Overview, Delivery Log, Analytics, Dead Letters.
 * Handles secret management, test pings, toggle, and DLQ replay.
 */
"use client";

import { useState, useCallback } from "react";
import { messagingContainer } from "@modules/messaging/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useRouter } from "next/navigation";
import { webhookKeys } from "./useWebhooksViewModel";
import type { WebhookTestResult } from "../../domain/entities/Webhook";
import type { UpdateWebhookRequest } from "../../domain/entities/WebhookRequests";

export function useWebhookDetailViewModel(webhookId: string) {
  const { webhookRepository } = messagingContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const router = useRouter();

  // ─── Tabs ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Secret visibility ────────────────────────────────────
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const toggleSecretVisibility = useCallback(() => setIsSecretVisible((p) => !p), []);

  // ─── Test result ──────────────────────────────────────────
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);

  // ─── Delivery log pagination/filters ──────────────────────
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "success" | "failed">("all");
  const deliveryPageSize = 10;

  // ─── Dead letter pagination ────────────────────────────────
  const [dlqPage, setDlqPage] = useState(1);
  const dlqPageSize = 10;

  // ============ Queries ============

  // Main webhook detail
  const {
    data: webhook,
    isLoading,
    error,
  } = useQuery({
    queryKey: webhookKeys.detail(webhookId),
    queryFn: () => webhookRepository.getById(webhookId),
    enabled: !!webhookId,
  });

  // Delivery logs (only when on delivery tab or always for count)
  const { data: deliveryLogsData, isLoading: isLoadingDeliveries } = useQuery({
    queryKey: [...webhookKeys.deliveries(webhookId), deliveryPage, deliveryFilter],
    queryFn: () =>
      webhookRepository.getDeliveryLogs({
        subscriptionId: webhookId,
        page: deliveryPage,
        pageSize: deliveryPageSize,
        isSuccess: deliveryFilter === "all" ? undefined : deliveryFilter === "success",
      }),
    enabled: !!webhookId,
  });

  // Analytics (lazy, fetched when analytics tab is active)
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: [...webhookKeys.detail(webhookId), "analytics"],
    queryFn: () => webhookRepository.getAnalytics(webhookId, 30),
    enabled: !!webhookId && activeTab === "analytics",
  });

  // Dead letters (lazy, fetched when DLQ tab is active)
  const { data: deadLettersData, isLoading: isLoadingDeadLetters } = useQuery({
    queryKey: [...webhookKeys.detail(webhookId), "dead-letters", dlqPage],
    queryFn: () =>
      webhookRepository.getDeadLetters({
        subscriptionId: webhookId,
        page: dlqPage,
        pageSize: dlqPageSize,
      }),
    enabled: !!webhookId && activeTab === "dead-letters",
  });

  // ============ Mutations ============

  // Toggle active/inactive
  const toggleMutation = useMutation({
    mutationFn: () => webhookRepository.toggle(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookKeys.detail(webhookId),
      });
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
      success({
        title: t("webhooks.toggled") || "Webhook Toggled",
        description: t("webhooks.toggledDesc") || "Webhook status updated.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // Rotate secret
  const rotateSecretMutation = useMutation({
    mutationFn: () => webhookRepository.rotateSecret(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookKeys.detail(webhookId),
      });
      setIsSecretVisible(true); // Show the new secret
      success({
        title: t("webhooks.secretRotated") || "Secret Rotated",
        description:
          t("webhooks.secretRotatedDesc") || "Secret rotated. Old secret valid for 24 hours.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // Test ping
  const testMutation = useMutation({
    mutationFn: () => webhookRepository.test(webhookId),
    onSuccess: (result) => {
      setTestResult(result);
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(webhookId),
      });
      if (result.isSuccess) {
        success({
          title: t("webhooks.testSuccess") || "Test Delivered",
          description: `Status: ${result.statusCode} — ${result.latencyMs.toFixed(0)}ms`,
        });
      } else {
        toastError({
          title: t("webhooks.testFailed") || "Test Failed",
          description: result.errorMessage || `HTTP ${result.statusCode}`,
        });
      }
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWebhookRequest) => webhookRepository.update(webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookKeys.detail(webhookId),
      });
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
      success({
        title: t("webhooks.updated") || "Webhook Updated",
        description: t("webhooks.updatedDesc") || "Webhook subscription updated successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: () => webhookRepository.remove(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
      success({
        title: t("webhooks.deleted") || "Webhook Deleted",
        description: t("webhooks.deletedDesc") || "Webhook removed.",
      });
      router.push("/messaging/webhooks");
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ─── DLQ Replay mutations ──────────────────────────────────

  const replayMutation = useMutation({
    mutationFn: (logId: string) => webhookRepository.replayDeadLetter(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...webhookKeys.detail(webhookId), "dead-letters"],
      });
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(webhookId),
      });
      success({
        title: t("webhooks.deadLetters.replayed") || "Replayed",
        description:
          t("webhooks.deadLetters.replayedDesc") || "Delivery has been re-queued for retry.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  const replayAllMutation = useMutation({
    mutationFn: () => webhookRepository.replayAllDeadLetters(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...webhookKeys.detail(webhookId), "dead-letters"],
      });
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(webhookId),
      });
      success({
        title: t("webhooks.deadLetters.allReplayed") || "All Replayed",
        description:
          t("webhooks.deadLetters.allReplayedDesc") ||
          "All dead letters have been re-queued for retry.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  return {
    // Data
    webhook: webhook ?? null,
    isLoading,
    error: error as Error | null,

    // Tabs
    activeTab,
    setActiveTab,

    // Secret
    isSecretVisible,
    toggleSecretVisibility,
    rotateSecret: () => rotateSecretMutation.mutate(),
    isRotating: rotateSecretMutation.isPending,

    // Test
    testPing: () => testMutation.mutate(),
    isTesting: testMutation.isPending,
    testResult,
    clearTestResult: () => setTestResult(null),

    // Delivery logs
    deliveryLogs: deliveryLogsData?.items ?? [],
    deliveryTotalCount: deliveryLogsData?.totalCount ?? 0,
    deliveryPage,
    setDeliveryPage,
    deliveryPageSize,
    deliveryFilter,
    setDeliveryFilter,
    isLoadingDeliveries,

    // Analytics (Phase 7)
    analytics: analytics ?? null,
    isLoadingAnalytics,

    // Dead Letter Queue (Phase 7)
    deadLetters: deadLettersData?.items ?? [],
    deadLetterTotalCount: deadLettersData?.totalCount ?? 0,
    dlqPage,
    setDlqPage,
    dlqPageSize,
    isLoadingDeadLetters,
    replayDeadLetter: (logId: string) => replayMutation.mutate(logId),
    isReplaying: replayMutation.isPending,
    replayAllDeadLetters: () => replayAllMutation.mutate(),
    isReplayingAll: replayAllMutation.isPending,

    // Actions
    toggle: () => toggleMutation.mutate(),
    isToggling: toggleMutation.isPending,
    update: (data: UpdateWebhookRequest) => updateMutation.mutate(data),
    isUpdating: updateMutation.isPending,
    remove: () => deleteMutation.mutate(),
    isDeleting: deleteMutation.isPending,

    t,
  };
}
