"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { communicationContainer } from "@modules/communication/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
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
 * Registered in the backend's CommunicationEntityTypeCatalog -- must match
 * exactly, and matches useMessageTemplatesViewModel's configBase.entityTypeKey
 * (that screen's own modal never actually mounts Custom Fields, since Create/
 * Edit both navigate here instead; this is the real integration point).
 */
export const MESSAGE_TEMPLATE_ENTITY_TYPE_KEY = "communication.message-template";

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
 * Only writes back the design keys the stored record already had plus the
 * ones the admin actually touched this session (current[key] differs from
 * what was loaded) -- editing an unrelated field (subject, category, ...)
 * and saving must never stamp DEFAULT_DESIGN's fill-ins for keys the record
 * never had into DesignJson. `originalRaw` null means create mode / nothing
 * stored yet, so the full object is written as-is.
 */
function mergeDesignForSave(
  current: DesignVariables,
  originalRaw: Partial<DesignVariables> | null,
  initial: DesignVariables | null
): DesignVariables | Partial<DesignVariables> {
  if (originalRaw === null) return current;
  const merged: Partial<DesignVariables> = { ...originalRaw };
  (Object.keys(current) as (keyof DesignVariables)[]).forEach((key) => {
    if (!initial || current[key] !== initial[key]) {
      merged[key] = current[key];
    }
  });
  return merged;
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

  // ─── Custom Fields ───────────────────────────────────────
  // No ownerId in create mode (definitions only); keyed by templateId once
  // editing an existing record (definitions merged with their stored values).
  const customFieldsQuery = useCustomFieldsFormFields(
    MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
    mode === "edit" ? templateId : undefined
  );

  // Keyed by the field's namespaced name (e.g. "__cf__nationality"), holding
  // only values the user has actively edited this session -- an untouched
  // field falls back to its fetched defaultValue at save time (see
  // saveCustomFieldValues below) rather than being seeded into this state,
  // so a mid-session refetch (the inline-add trigger) can never clobber an
  // in-progress edit the way syncing form state from `template` could.
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = useCallback((name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Full-resubmit, matching GenericCrudView's own contract: every currently
  // known custom field's effective value (edited-this-session or the fetched
  // default) is sent, not just the ones the user touched -- saveValues is a
  // full-replace of the owner's value set, so omitting an untouched field
  // here would silently clear it.
  const saveCustomFieldValues = useCallback(
    async (ownerId: string) => {
      const decoded: Record<string, unknown> = {};
      for (const fc of customFieldsQuery.fieldConfigs) {
        const key = decodeCustomFieldName(fc.name);
        if (key === null) continue;
        const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
        decoded[key] = raw === "" ? null : raw;
      }
      if (Object.keys(decoded).length === 0) return;
      await getCustomFieldsExtension()?.saveValues(
        MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
        ownerId,
        decoded
      );
    },
    [customFieldsQuery.fieldConfigs, customFieldValues]
  );

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

  // Populate form when the template first loads for this id (render-time
  // state-sync). Guarded by id, not object identity: react-query can return
  // a new `template` reference for the SAME record (refetchOnReconnect, a
  // stale invalidation fired elsewhere, …) and that must never silently
  // clobber edits the admin has in progress. Once the form has been
  // initialized for this id, later refetches of the same id are ignored.
  const [initializedForId, setInitializedForId] = useState<string | undefined>(undefined);

  // The design payload exactly as fetched (before DEFAULT_DESIGN back-fills
  // any missing key) and the fully-defaulted object seeded into the form,
  // captured once per record load -- handleSubmit diffs against these so a
  // save never re-persists a default the stored record never actually had.
  // Stay null in create mode (nothing stored yet, see mergeDesignForSave).
  const originalDesignRawRef = useRef<Partial<DesignVariables> | null>(null);
  const initialParsedDesignRef = useRef<DesignVariables | null>(null);

  if (template && initializedForId !== templateId) {
    setInitializedForId(templateId);

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

    // Parse designVariables — may be a JSON string or an object. `rawDesign`
    // keeps exactly what the record had (possibly partial/absent); DEFAULT_DESIGN
    // only fills the FORM's working copy, never the record's own stored shape.
    let parsedDesign: DesignVariables = { ...DEFAULT_DESIGN };
    let rawDesign: Partial<DesignVariables> = {};
    if (template.designVariables) {
      try {
        if (typeof template.designVariables === "string") {
          rawDesign = JSON.parse(template.designVariables);
        } else if (typeof template.designVariables === "object") {
          rawDesign = template.designVariables as unknown as Partial<DesignVariables>;
        }
        parsedDesign = { ...DEFAULT_DESIGN, ...rawDesign };
      } catch {
        parsedDesign = { ...DEFAULT_DESIGN };
        rawDesign = {};
      }
    }
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
  // No onSuccess here -- success side effects (invalidate, toast, navigate)
  // only fire from handleSubmit once saveCustomFieldValues has also
  // settled, so a custom-field save failure can never be masked by an
  // immediate redirect away from the form.
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

  // isPending alone would flip back to false the instant the entity mutation
  // settles, re-enabling Save while saveCustomFieldValues is still in flight
  // right after it -- this stays true for the whole orchestrated submit.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Submit ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Serialize complex fields to JSON strings for the API
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
          return; // createMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(newId);
        } catch {
          toastError({ title: t("messaging.templates.customFieldsSaveError") });
          return; // template was created -- don't pretend the whole save succeeded
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
          return; // updateMutation's onError already toasted
        }
        try {
          await saveCustomFieldValues(templateId!);
        } catch {
          toastError({ title: t("messaging.templates.customFieldsSaveError") });
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
    isSaving: isSubmitting,
    channelOptions,
    languageOptions,
    categoryOptions,
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,
    t,
    title:
      mode === "create" ? t("messaging.templates.createTitle") : t("messaging.templates.editTitle"),
  };
}
