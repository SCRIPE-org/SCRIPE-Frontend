"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginDefinition } from "@modules/plugins/core";
import type {
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
} from "../../domain/interfaces/IDefinitionsRepository";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "@modules/custom-fields/custom-field";

const QUERY_KEY = ["plugins", "definitions"];

/**
 * Registered in the backend's PluginsEntityTypeCatalog -- must match
 * exactly (see Plugins.Application/PluginsEntityTypeCatalog.cs). Mirrors
 * useWebhookFormViewModel's WEBHOOK_ENTITY_TYPE_KEY pattern.
 */
export const DEFINITION_ENTITY_TYPE_KEY = "plugins.definition";

/**
 * React hook/ViewModel orchestrating state and data flows for definitions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useDefinitionsViewModel() {
  const queryClient = useQueryClient();
  const { definitionsRepository } = pluginsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<PluginDefinition | null>(null);

  const openCreateForm = () => {
    setEditingDefinition(null);
    setCustomFieldValues({});
    setIsFormOpen(true);
  };

  const openEditForm = (def: PluginDefinition) => {
    setEditingDefinition(def);
    setCustomFieldValues({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDefinition(null);
  };

  // ── Custom Fields ─────────────────────────────────────────────
  // No ownerId in create mode (definitions only); keyed by the definition's
  // id once editing an existing definition (definitions merged with their
  // stored values) -- mirrors useWebhookFormViewModel's identical pattern.
  const customFieldsQuery = useCustomFieldsFormFields(
    DEFINITION_ENTITY_TYPE_KEY,
    editingDefinition ? editingDefinition.id : undefined
  );

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  // Full-resubmit, matching GenericCrudView's own contract: every currently
  // known custom field's effective value (edited-this-session or the fetched
  // default) is sent, not just the ones the user touched.
  const saveCustomFieldValues = async (ownerId: string) => {
    // D5 (final whole-branch review, I3 follow-up): reject a stale/invalid
    // Select value client-side, with the real localized reason, BEFORE it
    // ever reaches saveValues and comes back as a 422 -- see
    // assertSelectCustomFieldValuesValid's own doc comment
    // (renderCustomFieldControl.tsx) for why this is the right integration
    // point. Throws CustomFieldValidationError, which handleFormSubmit's own
    // catch blocks below distinguish from a genuine API failure so they can
    // show the specific reason, not the generic fallback.
    assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

    const decoded: Record<string, unknown> = {};
    for (const fc of customFieldsQuery.fieldConfigs) {
      const key = decodeCustomFieldName(fc.name);
      if (key === null) continue;
      const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
      decoded[key] = raw === "" ? null : raw;
    }
    if (Object.keys(decoded).length === 0) return;
    await getCustomFieldsExtension()?.saveValues(DEFINITION_ENTITY_TYPE_KEY, ownerId, decoded);
  };

  // ── Delete Confirmation State ────────────────────────────────────────────────
  const [deletingDefinition, setDeletingDefinition] = useState<PluginDefinition | null>(null);

  const openDeleteConfirm = (def: PluginDefinition) => setDeletingDefinition(def);
  const closeDeleteConfirm = () => setDeletingDefinition(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const {
    data: definitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => definitionsRepository.getAll(),
    staleTime: 2 * 60_000,
  });

  // ── Create Mutation ─────────────────────────────────────────────────────────
  // No onSuccess here -- success side effects (invalidate, toast, closeForm)
  // only fire from handleFormSubmit once saveCustomFieldValues has also
  // settled, so a custom-field save failure can never be masked by an
  // immediate "created" toast that closes the dialog out from under it.
  // Mirrors useWebhookFormViewModel's create/update mutations.
  const createMutation = useMutation({
    mutationFn: (data: CreateDefinitionRequest) => definitionsRepository.create(data),
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Update Mutation ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateDefinitionRequest) => definitionsRepository.update(data),
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Publish Mutation ────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defPublish") });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Deprecate Mutation ──────────────────────────────────────────────────────
  const deprecateMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.deprecate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDeprecate") });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Delete Mutation ─────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDelete") });
      closeDeleteConfirm();
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = {
    total: definitions.length,
    published: definitions.filter((d) => d.isPublished).length,
    draft: definitions.filter((d) => d.isDraft).length,
    pending: definitions.filter((d) => d.isInReview).length,
    deprecated: definitions.filter((d) => d.isDeprecated).length,
    tier1: definitions.filter((d) => d.isTier1).length,
    tier2: definitions.filter((d) => d.isTier2).length,
  };

  // isPending alone would flip back to false the instant the entity mutation
  // settles, re-enabling Save while saveCustomFieldValues is still in flight
  // right after it -- this stays true for the whole orchestrated submit.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: CreateDefinitionRequest) => {
    setIsSubmitting(true);
    try {
      if (editingDefinition) {
        try {
          await updateMutation.mutateAsync({ ...data, id: editingDefinition.id });
        } catch {
          return; // updateMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(editingDefinition.id);
        } catch (err) {
          error({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("plugins.defCustomFieldsSaveError"),
          });
          return; // the definition WAS updated -- don't pretend the whole save succeeded
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        success({ title: t("plugins.defEdit") });
        closeForm();
      } else {
        let createdId: string;
        try {
          createdId = await createMutation.mutateAsync(data);
        } catch {
          return; // createMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(createdId);
        } catch (err) {
          error({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("plugins.defCustomFieldsSaveError"),
          });
          return; // the definition WAS created -- don't pretend the whole save succeeded
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        success({ title: t("plugins.defCreate") });
        closeForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Data
    definitions,
    isLoading,
    isError,
    refetch,
    stats,

    // Form
    isFormOpen,
    editingDefinition,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSubmit,
    isSubmitting,

    // Custom fields
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,

    // Delete confirmation
    deletingDefinition,
    openDeleteConfirm,
    closeDeleteConfirm,

    // Actions
    publish: (id: string) => publishMutation.mutate(id),
    deprecate: (id: string) => deprecateMutation.mutate(id),
    deleteDefinition: (id: string) => deleteMutation.mutate(id),
    isPublishing: publishMutation.isPending,
    isDeprecating: deprecateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
