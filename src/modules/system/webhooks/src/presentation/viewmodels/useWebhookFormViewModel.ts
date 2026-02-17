/**
 * Webhook Form ViewModel
 *
 * Handles create/edit form logic with event type fetching.
 */
"use client";

import { useState, useEffect } from "react";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { webhookKeys } from "./useWebhooksViewModel";
import type {
      WebhookSubscription,
      WebhookEventType,
      CreateWebhookRequest,
      UpdateWebhookRequest,
} from "../../domain/entities/Webhook";

interface UseWebhookFormViewModelOptions {
      mode: "create" | "edit";
      webhook?: WebhookSubscription | null;
      onSuccess?: () => void;
}

export function useWebhookFormViewModel({
      mode,
      webhook,
      onSuccess,
}: UseWebhookFormViewModelOptions) {
      const { webhookRepository } = systemContainer;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      // ─── Form state ──────────────────────────────────────────
      const [url, setUrl] = useState("");
      const [description, setDescription] = useState("");
      const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
      const [maxRetries, setMaxRetries] = useState(3);
      const [maxConsecutiveFailures, setMaxConsecutiveFailures] = useState(10);

      // Populate form when editing
      useEffect(() => {
            if (mode === "edit" && webhook) {
                  setUrl(webhook.url);
                  setDescription(webhook.description || "");
                  setSelectedEvents(webhook.events || []);
                  setMaxRetries(webhook.maxRetries);
                  setMaxConsecutiveFailures(webhook.maxConsecutiveFailures);
            }
      }, [mode, webhook]);

      // ─── Fetch available events ──────────────────────────────
      const { data: availableEvents, isLoading: isLoadingEvents } = useQuery({
            queryKey: webhookKeys.events,
            queryFn: () => webhookRepository.getAvailableEvents(),
            staleTime: 10 * 60 * 1000, // 10 min cache
      });

      // ─── Group events by category ────────────────────────────
      const eventsByCategory = (availableEvents ?? []).reduce(
            (acc, evt) => {
                  if (!acc[evt.category]) acc[evt.category] = [];
                  acc[evt.category].push(evt);
                  return acc;
            },
            {} as Record<string, WebhookEventType[]>
      );

      // ─── Create mutation ─────────────────────────────────────
      const createMutation = useMutation({
            mutationFn: (data: CreateWebhookRequest) =>
                  webhookRepository.create(data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: webhookKeys.all });
                  success({
                        title: t("webhooks.created") || "Webhook Created",
                        description:
                              t("webhooks.createdDesc") ||
                              "Webhook subscription created successfully.",
                  });
                  onSuccess?.();
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error") || "Error",
                        description: err.message,
                  });
            },
      });

      // ─── Update mutation ─────────────────────────────────────
      const updateMutation = useMutation({
            mutationFn: (data: UpdateWebhookRequest) =>
                  webhookRepository.update(webhook!.id, data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: webhookKeys.all });
                  if (webhook) {
                        queryClient.invalidateQueries({
                              queryKey: webhookKeys.detail(webhook.id),
                        });
                  }
                  success({
                        title: t("webhooks.updated") || "Webhook Updated",
                        description:
                              t("webhooks.updatedDesc") ||
                              "Webhook subscription updated successfully.",
                  });
                  onSuccess?.();
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error") || "Error",
                        description: err.message,
                  });
            },
      });

      // ─── Submit handler ──────────────────────────────────────
      const handleSubmit = () => {
            if (mode === "create") {
                  createMutation.mutate({
                        url,
                        description: description || undefined,
                        events: selectedEvents,
                        maxRetries,
                        maxConsecutiveFailures,
                  });
            } else {
                  updateMutation.mutate({
                        url: url || undefined,
                        description: description || undefined,
                        events: selectedEvents.length > 0 ? selectedEvents : undefined,
                        maxRetries,
                        maxConsecutiveFailures,
                  });
            }
      };

      // ─── Validation ──────────────────────────────────────────
      const isValid =
            url.trim().length > 0 &&
            selectedEvents.length > 0 &&
            (url.startsWith("https://") || url.startsWith("http://localhost"));

      const urlError =
            url.length > 0 && !url.startsWith("https://") && !url.startsWith("http://localhost")
                  ? t("webhooks.urlHttpsRequired") || "URL must use HTTPS"
                  : undefined;

      const eventsError =
            selectedEvents.length === 0
                  ? t("webhooks.eventsRequired") || "Select at least one event"
                  : undefined;

      return {
            // Form fields
            url,
            setUrl,
            description,
            setDescription,
            selectedEvents,
            setSelectedEvents,
            maxRetries,
            setMaxRetries,
            maxConsecutiveFailures,
            setMaxConsecutiveFailures,

            // Event catalog
            availableEvents: availableEvents ?? [],
            eventsByCategory,
            isLoadingEvents,

            // Actions
            handleSubmit,
            isSubmitting: createMutation.isPending || updateMutation.isPending,

            // Validation
            isValid,
            urlError,
            eventsError,

            // Helpers
            toggleEvent: (eventKey: string) => {
                  setSelectedEvents((prev) =>
                        prev.includes(eventKey)
                              ? prev.filter((e) => e !== eventKey)
                              : [...prev, eventKey]
                  );
            },
            selectAllInCategory: (category: string) => {
                  const categoryKeys = eventsByCategory[category]?.map((e) => e.key) ?? [];
                  setSelectedEvents((prev) => {
                        const withoutCategory = prev.filter(
                              (e) => !categoryKeys.includes(e)
                        );
                        const allSelected = categoryKeys.every((k) => prev.includes(k));
                        return allSelected
                              ? withoutCategory
                              : [...withoutCategory, ...categoryKeys];
                  });
            },
            selectAll: () => {
                  const allKeys = (availableEvents ?? []).map((e) => e.key);
                  setSelectedEvents((prev) =>
                        prev.length === allKeys.length ? [] : allKeys
                  );
            },

            t,
            mode,
      };
}
