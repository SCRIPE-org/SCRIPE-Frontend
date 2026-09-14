/**
 * Webhook Form ViewModel
 *
 * Orchestrates webhook subscription creation and editing flows, integrating
 * validation rules, custom fields persistence, and event catalog queries.
 */
"use client";

import { useState } from "react";
import { integrationsContainer } from "@modules/integrations/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useAppStore } from "@core/store/useAppStore";
import { webhookKeys } from "./useWebhooksViewModel";
import type { WebhookSubscription } from "../../domain/entities/Webhook";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "../../domain/entities/WebhookRequests";
import { CustomFieldValidationError } from "@core/crud/customFieldsExtension";
import {
  WEBHOOK_ENTITY_TYPE_KEY,
  type UseWebhookFormViewModelOptions,
  isValidWebhookUrl,
} from "../types/webhookFormTypes";
import { useWebhookCustomFields } from "./useWebhookCustomFields";
import { useWebhookEvents } from "./useWebhookEvents";

export { WEBHOOK_ENTITY_TYPE_KEY, type UseWebhookFormViewModelOptions, isValidWebhookUrl };

/**
 * React hook/ViewModel orchestrating state and data flows for webhook subscription forms.
 *
 * @param options Form mode, initial webhook entity, and optional completion callback.
 * @returns Comprehensive state, catalog queries, validation flags, and submission handlers.
 */
export function useWebhookFormViewModel({
  mode,
  webhook,
  onSuccess,
}: UseWebhookFormViewModelOptions) {
  const { webhookRepository } = integrationsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { user } = useAppStore();
  const isPlatformScope = user?.tenantId === null;

  // ─── Form state ──────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [scope, setScope] = useState<string>(isPlatformScope ? "platform_only" : "tenant_only");
  const [maxRetries, setMaxRetries] = useState(3);
  const [maxConsecutiveFailures, setMaxConsecutiveFailures] = useState(10);

  // Populate form when editing (render-time state-sync)
  const [prevWebhook, setPrevWebhook] = useState(webhook);
  if (mode === "edit" && webhook && webhook !== prevWebhook) {
    setPrevWebhook(webhook);
    setUrl(webhook.url);
    setDescription(webhook.description || "");
    setSelectedEvents(webhook.events || []);
    setScope(webhook.scope || (isPlatformScope ? "platform_only" : "tenant_only"));
    setMaxRetries(webhook.maxRetries);
    setMaxConsecutiveFailures(webhook.maxConsecutiveFailures);
  }

  // ─── Custom Fields ─────────────────────────────────────────
  const {
    customFieldsQuery,
    customFieldValues,
    updateCustomFieldValue,
    saveCustomFieldValues,
  } = useWebhookCustomFields(mode, webhook?.id, t);

  // ─── Events catalog & filtering ───────────────────────────
  const {
    availableEvents,
    isLoadingEvents,
    eventSearchTerm,
    setEventSearchTerm,
    eventsByCategory,
    toggleEvent,
    selectAllInCategory,
    selectAll,
  } = useWebhookEvents(selectedEvents, setSelectedEvents);

  // ─── Mutations ───────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateWebhookRequest) => webhookRepository.create(data),
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateWebhookRequest) => webhookRepository.update(webhook!.id, data),
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Submit handler ──────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        let created: WebhookSubscription;
        try {
          created = await createMutation.mutateAsync({
            url,
            description: description || undefined,
            events: selectedEvents,
            scope,
            maxRetries,
            maxConsecutiveFailures,
          });
        } catch {
          return;
        }
        try {
          await saveCustomFieldValues(created.id);
        } catch (err) {
          toastError({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("webhooks.customFieldsSaveError"),
          });
          return;
        }
        queryClient.invalidateQueries({ queryKey: webhookKeys.all });
        success({ title: t("webhooks.created"), description: t("webhooks.createdDesc") });
        onSuccess?.();
      } else {
        try {
          await updateMutation.mutateAsync({
            url: url || undefined,
            description: description || undefined,
            events: selectedEvents.length > 0 ? selectedEvents : undefined,
            scope,
            maxRetries,
            maxConsecutiveFailures,
          });
        } catch {
          return;
        }
        try {
          await saveCustomFieldValues(webhook!.id);
        } catch (err) {
          toastError({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("webhooks.customFieldsSaveError"),
          });
          return;
        }
        queryClient.invalidateQueries({ queryKey: webhookKeys.all });
        queryClient.invalidateQueries({ queryKey: webhookKeys.detail(webhook!.id) });
        success({ title: t("webhooks.updated"), description: t("webhooks.updatedDesc") });
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────
  const isValid =
    url.trim().length > 0 && selectedEvents.length > 0 && isValidWebhookUrl(url);

  const urlError =
    url.length > 0 && !isValidWebhookUrl(url) ? t("webhooks.urlHttpsRequired") : undefined;

  const eventsError = selectedEvents.length === 0 ? t("webhooks.eventsRequired") : undefined;

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
    scope,
    setScope,
    isPlatformScope,

    // Event catalog
    availableEvents: availableEvents ?? [],
    eventsByCategory,
    isLoadingEvents,
    eventSearchTerm,
    setEventSearchTerm,

    // Actions
    handleSubmit,
    isSubmitting,

    // Validation
    isValid,
    urlError,
    eventsError,

    // Custom fields
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,

    // Helpers
    toggleEvent,
    selectAllInCategory,
    selectAll,

    t,
    mode,
  };
}

/**
 * Exported type defining parameters and fields for webhook form view model configurations.
 */
export type WebhookFormViewModel = ReturnType<typeof useWebhookFormViewModel>;

