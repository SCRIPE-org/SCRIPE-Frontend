"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { communicationContainer } from "@modules/communication/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { MessageChannel, TemplateCategory } from "../../domain/entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
} from "../../domain/entities/MessageTemplateRequests";
import type { PlaceholderField } from "../components/PlaceholderSchemaBuilder";
import type { DesignVariables } from "../components/DesignVariablesPanel";
import { DEFAULT_DESIGN } from "../components/DesignVariablesPanel";

const QUERY_KEY = ["message-templates"];

/**
 * Exported type defining parameters and fields for template form mode configurations.
 */
export type TemplateFormMode = "create" | "edit";

/**
 * Interface defining property specifications, keys types, and structural contract rules for template form values.
 */
export interface TemplateFormValues {
  key: string;
  channel: MessageChannel;
  language: string;
  subject: string;
  body: string;
  description: string;
  isActive: boolean;
  category: TemplateCategory | "";
  placeholderSchema: PlaceholderField[];
  designVariables: DesignVariables;
}

/**
 * React hook/ViewModel orchestrating state and data flows for template form view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
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
  // `isFetching` is react-query's `isLoading` (pending + in-flight): true only
  // while there is no data yet, false once the fetch has settled either way —
  // so it never lingers as a stuck "loading" flag once `fetchError` is set.
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

  // Populate form when template loads
  const [prevTemplate, setPrevTemplate] = useState(template);
  if (template !== prevTemplate) {
    setPrevTemplate(template);
    if (template) {
      // Parse placeholderSchema — may be a JSON string or an array
      let parsedSchema: PlaceholderField[] = [];
      if (template.placeholderSchema) {
        try {
          if (typeof template.placeholderSchema === "string") {
            parsedSchema = JSON.parse(template.placeholderSchema);
          } else if (Array.isArray(template.placeholderSchema)) {
            parsedSchema = template.placeholderSchema as unknown as PlaceholderField[];
          }
        } catch {
          parsedSchema = [];
        }
      }
      // Ensure every field has a unique id (API data may omit it)
      parsedSchema = parsedSchema.map((f, i) => ({
        ...f,
        id: f.id || `ph-${i}`,
      }));

      // Parse designVariables — may be a JSON string or an object
      let parsedDesign: DesignVariables = { ...DEFAULT_DESIGN };
      if (template.designVariables) {
        try {
          if (typeof template.designVariables === "string") {
            parsedDesign = { ...DEFAULT_DESIGN, ...JSON.parse(template.designVariables) };
          } else if (typeof template.designVariables === "object") {
            parsedDesign = {
              ...DEFAULT_DESIGN,
              ...(template.designVariables as unknown as DesignVariables),
            };
          }
        } catch {
          parsedDesign = { ...DEFAULT_DESIGN };
        }
      }

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
    }
  }

  // ─── Field updaters ──────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof TemplateFormValues>(field: K, value: TemplateFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ─── Convenience updaters for complex fields ──────────────
  const updatePlaceholderFields = useCallback((fields: PlaceholderField[]) => {
    setForm((prev) => ({ ...prev, placeholderSchema: fields }));
  }, []);

  const updateDesignVariables = useCallback((vars: DesignVariables) => {
    setForm((prev) => ({ ...prev, designVariables: vars }));
  }, []);

  // ─── Create Mutation ─────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateMessageTemplateRequest) => repo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("messaging.templates.createSuccess") });
      router.push("/communication/templates");
    },
    onError: () => {
      toastError({ title: t("messaging.templates.createError") });
    },
  });

  // ─── Update Mutation ─────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateMessageTemplateRequest) => repo.update(templateId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("messaging.templates.updateSuccess") });
      router.push("/communication/templates");
    },
    onError: () => {
      toastError({ title: t("messaging.templates.updateError") });
    },
  });

  // ─── Submit ──────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // Serialize complex fields to JSON strings for the API
    const serializedSchema =
      form.placeholderSchema.length > 0 ? JSON.stringify(form.placeholderSchema) : undefined;
    const serializedDesign = JSON.stringify(form.designVariables);

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
      createMutation.mutate(payload);
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
      updateMutation.mutate(payload);
    }
  }, [mode, form, createMutation, updateMutation, templateId]);

  // ─── Navigation ──────────────────────────────────────────
  const handleCancel = useCallback(() => {
    router.push("/communication/templates");
  }, [router]);

  // ─── Channel & Language Options ──────────────────────────
  const channelOptions = useMemo(
    () => [
      { value: "Email", label: "Email" },
      { value: "SMS", label: "SMS" },
      { value: "Push", label: "Push" },
    ],
    []
  );

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English" },
      { value: "ar", label: "العربية" },
    ],
    []
  );

  const categoryOptions = useMemo(
    () => [
      { value: "transactional", label: "Transactional" },
      { value: "marketing", label: "Marketing" },
      { value: "notification", label: "Notification" },
      { value: "onboarding", label: "Onboarding" },
      { value: "security", label: "Security" },
      { value: "billing", label: "Billing" },
      { value: "custom", label: "Custom" },
    ],
    []
  );

  return {
    mode,
    form,
    updateField,
    updatePlaceholderFields,
    updateDesignVariables,
    handleSubmit,
    handleCancel,
    // Three real fetch states for edit mode (create mode never runs the
    // query, so these are always the "ready" defaults there): `isFetching`
    // is the initial load, `fetchError` is a settled failure (bad id,
    // deleted template, network error) with `refetch` to retry it, and
    // `loadedTemplate` is the settled success payload — the view must branch
    // on these instead of collapsing edit-mode failure into create-mode's
    // empty form.
    isFetching,
    fetchError,
    refetch,
    loadedTemplate: template,
    isSaving: createMutation.isPending || updateMutation.isPending,
    channelOptions,
    languageOptions,
    categoryOptions,
    t,
    title:
      mode === "create" ? t("messaging.templates.createTitle") : t("messaging.templates.editTitle"),
  };
}
