/**
 * Webhook Form ViewModel
 *
 * Handles create/edit form logic with event type fetching.
 */
"use client";

import { useState } from "react";
import { integrationsContainer } from "@modules/integrations/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useAppStore } from "@core/store/useAppStore";
import { webhookKeys } from "./useWebhooksViewModel";
import type { WebhookSubscription, WebhookEventType } from "../../domain/entities/Webhook";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "../../domain/entities/WebhookRequests";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";

/**
 * Registered in the backend's IntegrationsEntityTypeCatalog -- must match
 * exactly, and matches WebhooksView's own configBase.entityTypeKey (that
 * screen's modal never mounts Custom Fields, since Create opens this bespoke
 * dialog instead; this is the real integration point, for both modes this
 * form supports — Edit is currently unreachable from WebhooksView (no Edit
 * action in getActions yet), but wiring it here now means it works the day
 * one is added, at no extra cost).
 */
export const WEBHOOK_ENTITY_TYPE_KEY = "integrations.webhook-subscription";

interface UseWebhookFormViewModelOptions {
  mode: "create" | "edit";
  webhook?: WebhookSubscription | null;
  onSuccess?: () => void;
}

// Mirrors the backend's WebhookUrlPolicy.IsStructurallyValid (Core.Application.Features.
// Webhooks) — https-only, always-blocked hosts. Previously this form allowed "https://*" OR
// "http://localhost*" with locale copy promising "http://localhost allowed for dev," while
// the backend creation validator allowed any http/https with no host restriction, and the
// delivery engine always required https and always rejected localhost regardless of scheme
// — so a webhook that passed both frontend and creation checks could still fail every
// Test-ping/real delivery. Aligning all three to the delivery engine's (strictest, and the
// only one that reflects "does this actually work") rule.
const ALWAYS_BLOCKED_WEBHOOK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isValidWebhookUrl(value: string): boolean {
  if (!value.startsWith("https://")) return false;
  try {
    // URL.hostname returns IPv6 literals bracketed (e.g. "[::1]"), so strip brackets before
    // comparing — same normalization the backend policy applies to Uri.Host.
    const host = new URL(value).hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return !ALWAYS_BLOCKED_WEBHOOK_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * React hook/ViewModel orchestrating state and data flows for webhook form view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
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
  // No ownerId in create mode (definitions only); keyed by the webhook's id
  // once editing an existing subscription (definitions merged with their
  // stored values) — mirrors useTemplateFormViewModel's identical pattern.
  const customFieldsQuery = useCustomFieldsFormFields(
    WEBHOOK_ENTITY_TYPE_KEY,
    mode === "edit" ? webhook?.id : undefined
  );

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  // Full-resubmit, matching GenericCrudView's own contract: every currently
  // known custom field's effective value (edited-this-session or the fetched
  // default) is sent, not just the ones the user touched.
  const saveCustomFieldValues = async (ownerId: string) => {
    const decoded: Record<string, unknown> = {};
    for (const fc of customFieldsQuery.fieldConfigs) {
      const key = decodeCustomFieldName(fc.name);
      if (key === null) continue;
      const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
      decoded[key] = raw === "" ? null : raw;
    }
    if (Object.keys(decoded).length === 0) return;
    await getCustomFieldsExtension()?.saveValues(WEBHOOK_ENTITY_TYPE_KEY, ownerId, decoded);
  };

  // ─── Fetch available events ──────────────────────────────
  const { data: availableEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: webhookKeys.events,
    queryFn: () => webhookRepository.getAvailableEvents(),
    staleTime: 10 * 60 * 1000, // 10 min cache
  });

  // ─── Event search filter ──────────────────────────────────
  const [eventSearchTerm, setEventSearchTerm] = useState("");

  // ─── Group events by category ────────────────────────────
  const allEventsByCategory = (availableEvents ?? []).reduce(
    (acc, evt) => {
      if (!acc[evt.category]) acc[evt.category] = [];
      acc[evt.category].push(evt);
      return acc;
    },
    {} as Record<string, WebhookEventType[]>
  );

  // Filter events by search term (matches key or description)
  const eventsByCategory = eventSearchTerm.trim()
    ? Object.entries(allEventsByCategory).reduce(
        (acc, [category, events]) => {
          const term = eventSearchTerm.trim().toLowerCase();
          const filtered = events.filter(
            (e) =>
              e.key.toLowerCase().includes(term) ||
              (e.description?.toLowerCase().includes(term) ?? false)
          );
          if (filtered.length > 0) acc[category] = filtered;
          return acc;
        },
        {} as Record<string, WebhookEventType[]>
      )
    : allEventsByCategory;

  // ─── Create mutation ─────────────────────────────────────
  // No onSuccess here -- success side effects (invalidate, toast, onSuccess
  // callback) only fire from handleSubmit once saveCustomFieldValues has also
  // settled, so a custom-field save failure can never be masked by an
  // immediate "created" toast that closes the dialog out from under it.
  const createMutation = useMutation({
    mutationFn: (data: CreateWebhookRequest) => webhookRepository.create(data),
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ─── Update mutation ─────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWebhookRequest) => webhookRepository.update(webhook!.id, data),
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // isPending alone would flip back to false the instant the entity mutation
  // settles, re-enabling Save while saveCustomFieldValues is still in flight
  // right after it -- this stays true for the whole orchestrated submit.
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
          return; // createMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(created.id);
        } catch {
          toastError({ title: t("webhooks.customFieldsSaveError") });
          return; // the webhook WAS created -- don't pretend the whole save succeeded
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
          return; // updateMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(webhook!.id);
        } catch {
          toastError({ title: t("webhooks.customFieldsSaveError") });
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
    toggleEvent: (eventKey: string) => {
      setSelectedEvents((prev) =>
        prev.includes(eventKey) ? prev.filter((e) => e !== eventKey) : [...prev, eventKey]
      );
    },
    selectAllInCategory: (category: string) => {
      const categoryKeys = eventsByCategory[category]?.map((e) => e.key) ?? [];
      setSelectedEvents((prev) => {
        const withoutCategory = prev.filter((e) => !categoryKeys.includes(e));
        const allSelected = categoryKeys.every((k) => prev.includes(k));
        return allSelected ? withoutCategory : [...withoutCategory, ...categoryKeys];
      });
    },
    selectAll: () => {
      const allKeys = (availableEvents ?? []).map((e) => e.key);
      setSelectedEvents((prev) => (prev.length === allKeys.length ? [] : allKeys));
    },

    t,
    mode,
  };
}

/**
 * Exported type defining parameters and fields for webhook form view model configurations.
 */
export type WebhookFormViewModel = ReturnType<typeof useWebhookFormViewModel>;
