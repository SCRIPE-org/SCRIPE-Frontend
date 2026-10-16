/**
 * Template Form View Model Hook
 *
 * Orchestrates template form lifecycle, including initial entity fetching,
 * form initialization, complex schema/design serialization, TanStack Query mutations,
 * and custom fields synchronization.
 */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { communicationContainer } from "@modules/communication/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { CustomFieldValidationError } from "@core/crud/customFieldsExtension";
import type { TemplateCategory } from "../../domain/entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
} from "../../domain/entities/MessageTemplateRequests";
import type { PlaceholderField } from "../components/PlaceholderSchemaBuilder";
import type { DesignVariables } from "../components/DesignVariablesPanel";
import { DEFAULT_DESIGN } from "../components/DesignVariablesPanel";
import {
  MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
  type TemplateFormMode,
  type TemplateFormValues,
  mergeDesignForSave,
  parseTemplateSchema,
  parseTemplateDesign,
  TEMPLATE_CHANNEL_OPTIONS,
  TEMPLATE_LANGUAGE_OPTIONS,
  TEMPLATE_CATEGORY_OPTIONS,
} from "../types/templateFormTypes";
import { useTemplateCustomFields } from "./useTemplateCustomFields";

export { MESSAGE_TEMPLATE_ENTITY_TYPE_KEY, type TemplateFormMode, type TemplateFormValues };

const QUERY_KEY = ["message-templates"];

/**
 * React hook/ViewModel orchestrating state and data flows for template form views.
 * Manages TanStack Query hooks, query cache keys, and repository fetch/save requests.
 *
 * @returns Complete viewmodel contract with form state, mutators, status flags, and options.
 */
export function useTemplateFormViewModel() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { messageTemplateRepository: repo } = communicationContainer;

  const templateId = params?.id as string | undefined;
  const mode: TemplateFormMode = templateId ? "edit" : "create";

  // ─── Custom Fields ───────────────────────────────────────
  const {
    customFieldValues,
    updateCustomFieldValue,
    saveCustomFieldValues,
    customFieldConfigs,
    customFieldsLoading,
    refetchCustomFields,
  } = useTemplateCustomFields(mode, templateId, t);

  // ─── Form State ──────────────────────────────────────────
  const [form, setForm] = useState<TemplateFormValues>({
    key: "",
    channel: "Email",
    language: "en",
    subject: "",
    body: "",
    description: "",
    isActive: true,
    category: "",
    placeholderSchema: [],
    designVariables: { ...DEFAULT_DESIGN },
  });

  // ─── Fetch template for edit mode ────────────────────────
  const {
    data: template,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEY, templateId],
    queryFn: () => repo.getById(templateId!),
    enabled: mode === "edit" && !!templateId,
  });

  const [initializedForId, setInitializedForId] = useState<string | undefined>(undefined);
  const originalDesignRawRef = useRef<Partial<DesignVariables> | null>(null);
  const initialParsedDesignRef = useRef<DesignVariables | null>(null);

  useEffect(() => {
    if (template && initializedForId !== templateId) {
      queueMicrotask(() => {
        setInitializedForId(templateId);

        const parsedSchema = parseTemplateSchema(template.placeholderSchema);
        const { parsedDesign, rawDesign } = parseTemplateDesign(template.designVariables);

        originalDesignRawRef.current = rawDesign;
        initialParsedDesignRef.current = parsedDesign;

        setForm({
          key: template.key,
          channel: template.channel,
          language: template.language,
          subject: template.subject || "",
          body: template.body || "",
          description: template.description || "",
          isActive: template.isActive,
          category: (template.category as TemplateCategory) || "",
          placeholderSchema: parsedSchema,
          designVariables: parsedDesign,
        });
      });
    }
  }, [template, initializedForId, templateId]);

  // ─── Field updaters ──────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof TemplateFormValues>(field: K, value: TemplateFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updatePlaceholderFields = useCallback((fields: PlaceholderField[]) => {
    setForm((prev) => ({ ...prev, placeholderSchema: fields }));
  }, []);

  const updateDesignVariables = useCallback((vars: DesignVariables) => {
    setForm((prev) => ({ ...prev, designVariables: vars }));
  }, []);

  // ─── Create Mutation ─────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateMessageTemplateRequest) => repo.create(data),
    onError: () => {
      toastError({ title: t("messaging.templates.createError") });
    },
  });

  // ─── Update Mutation ─────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateMessageTemplateRequest) => repo.update(templateId!, data),
    onError: () => {
      toastError({ title: t("messaging.templates.updateError") });
    },
  });

  // ─── Reset Design Mutation ───────────────────────────────
  const resetDesignMutation = useMutation({
    mutationFn: () => repo.resetDesign(templateId!),
    onSuccess: async () => {
      await refetch();
      setInitializedForId(undefined);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("messaging.templates.resetDesignSuccess") });
    },
    onError: () => {
      toastError({ title: t("messaging.templates.resetDesignError") });
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Submit ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const serializedSchema =
      form.placeholderSchema.length > 0 ? JSON.stringify(form.placeholderSchema) : undefined;
    const serializedDesign = JSON.stringify(
      mergeDesignForSave(
        form.designVariables,
        originalDesignRawRef.current,
        initialParsedDesignRef.current
      )
    );

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const payload: CreateMessageTemplateRequest = {
          key: form.key,
          channel: form.channel,
          language: form.language,
          subject: form.subject || undefined,
          body: form.body,
          description: form.description || undefined,
          isActive: form.isActive,
          category: form.category || undefined,
          placeholderSchema: serializedSchema,
          designVariables: serializedDesign,
        };
        let newId: string;
        try {
          newId = await createMutation.mutateAsync(payload);
        } catch {
          return;
        }
        try {
          await saveCustomFieldValues(newId);
        } catch (err) {
          toastError({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("messaging.templates.customFieldsSaveError"),
          });
          return;
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        success({ title: t("messaging.templates.createSuccess") });
        router.push("/communication/templates");
      } else {
        const payload: UpdateMessageTemplateRequest = {
          subject: form.subject || undefined,
          body: form.body,
          description: form.description || undefined,
          isActive: form.isActive,
          category: form.category || undefined,
          placeholderSchema: serializedSchema,
          designVariables: serializedDesign,
        };
        try {
          await updateMutation.mutateAsync(payload);
        } catch {
          return;
        }
        try {
          await saveCustomFieldValues(templateId!);
        } catch (err) {
          toastError({
            title:
              err instanceof CustomFieldValidationError
                ? err.message
                : t("messaging.templates.customFieldsSaveError"),
          });
          return;
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        success({ title: t("messaging.templates.updateSuccess") });
        router.push("/communication/templates");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    mode,
    form,
    createMutation,
    updateMutation,
    templateId,
    saveCustomFieldValues,
    queryClient,
    success,
    t,
    toastError,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.push("/communication/templates");
  }, [router]);

  return {
    mode,
    form,
    updateField,
    updatePlaceholderFields,
    updateDesignVariables,
    handleSubmit,
    handleCancel,
    isFetching,
    fetchError,
    refetch,
    loadedTemplate: template,
    isSaving: isSubmitting,
    canResetDesign: mode === "edit" && !!template?.tenantId,
    handleResetDesign: () => resetDesignMutation.mutate(),
    isResettingDesign: resetDesignMutation.isPending,
    channelOptions: TEMPLATE_CHANNEL_OPTIONS,
    languageOptions: TEMPLATE_LANGUAGE_OPTIONS,
    categoryOptions: TEMPLATE_CATEGORY_OPTIONS,
    customFieldConfigs,
    customFieldsLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields,
    t,
    title:
      mode === "create" ? t("messaging.templates.createTitle") : t("messaging.templates.editTitle"),
  };
}
