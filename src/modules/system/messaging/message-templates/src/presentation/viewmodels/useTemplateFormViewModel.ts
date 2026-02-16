"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type {
      MessageTemplate,
      CreateMessageTemplateRequest,
      UpdateMessageTemplateRequest,
      MessageChannel,
} from "../../domain/entities/MessageTemplate";
import type { PlaceholderField } from "../components/PlaceholderSchemaBuilder";
import type { DesignVariables } from "../components/DesignVariablesPanel";
import { DEFAULT_DESIGN } from "../components/DesignVariablesPanel";

const QUERY_KEY = ["message-templates"];

export type TemplateFormMode = "create" | "edit";

export interface TemplateFormValues {
      key: string;
      channel: MessageChannel;
      language: string;
      subject: string;
      body: string;
      description: string;
      isActive: boolean;
      placeholderSchema: PlaceholderField[];
      designVariables: DesignVariables;
}

export function useTemplateFormViewModel() {
      const params = useParams();
      const router = useRouter();
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();
      const { messageTemplateRepository: repo } = systemContainer;

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
            placeholderSchema: [],
            designVariables: { ...DEFAULT_DESIGN },
      });

      // ─── Fetch template for edit mode ────────────────────────
      const {
            data: template,
            isLoading: isFetching,
            error: fetchError,
      } = useQuery({
            queryKey: [...QUERY_KEY, templateId],
            queryFn: () => repo.getById(templateId!),
            enabled: mode === "edit" && !!templateId,
      });

      // Populate form when template loads
      useEffect(() => {
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

                  // Parse designVariables — may be a JSON string or an object
                  let parsedDesign: DesignVariables = { ...DEFAULT_DESIGN };
                  if (template.designVariables) {
                        try {
                              if (typeof template.designVariables === "string") {
                                    parsedDesign = { ...DEFAULT_DESIGN, ...JSON.parse(template.designVariables) };
                              } else if (typeof template.designVariables === "object") {
                                    parsedDesign = { ...DEFAULT_DESIGN, ...(template.designVariables as unknown as DesignVariables) };
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
                        placeholderSchema: parsedSchema,
                        designVariables: parsedDesign,
                  });
            }
      }, [template]);

      // ─── Field updaters ──────────────────────────────────────
      const updateField = useCallback(<K extends keyof TemplateFormValues>(
            field: K,
            value: TemplateFormValues[K]
      ) => {
            setForm(prev => ({ ...prev, [field]: value }));
      }, []);

      // ─── Convenience updaters for complex fields ──────────────
      const updatePlaceholderFields = useCallback((fields: PlaceholderField[]) => {
            setForm(prev => ({ ...prev, placeholderSchema: fields }));
      }, []);

      const updateDesignVariables = useCallback((vars: DesignVariables) => {
            setForm(prev => ({ ...prev, designVariables: vars }));
      }, []);

      // ─── Create Mutation ─────────────────────────────────────
      const createMutation = useMutation({
            mutationFn: (data: CreateMessageTemplateRequest) => repo.create(data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
                  success({ title: t("messaging.templates.createSuccess") || "Template created" });
                  router.push("/messaging/templates");
            },
            onError: () => {
                  toastError({ title: t("messaging.templates.createError") || "Failed to create template" });
            },
      });

      // ─── Update Mutation ─────────────────────────────────────
      const updateMutation = useMutation({
            mutationFn: (data: UpdateMessageTemplateRequest) => repo.update(templateId!, data),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
                  success({ title: t("messaging.templates.updateSuccess") || "Template updated" });
                  router.push("/messaging/templates");
            },
            onError: () => {
                  toastError({ title: t("messaging.templates.updateError") || "Failed to update template" });
            },
      });

      // ─── Submit ──────────────────────────────────────────────
      const handleSubmit = useCallback(() => {
            // Serialize complex fields to JSON strings for the API
            const serializedSchema = form.placeholderSchema.length > 0
                  ? JSON.stringify(form.placeholderSchema)
                  : undefined;
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
                        placeholderSchema: serializedSchema,
                        designVariables: serializedDesign,
                  };
                  updateMutation.mutate(payload);
            }
      }, [mode, form, createMutation, updateMutation, templateId]);

      // ─── Navigation ──────────────────────────────────────────
      const handleCancel = useCallback(() => {
            router.push("/messaging/templates");
      }, [router]);

      // ─── Channel & Language Options ──────────────────────────
      const channelOptions = useMemo(() => [
            { value: "Email", label: "Email" },
            { value: "SMS", label: "SMS" },
            { value: "Push", label: "Push" },
      ], []);

      const languageOptions = useMemo(() => [
            { value: "en", label: "English" },
            { value: "ar", label: "العربية" },
      ], []);

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
            isSaving: createMutation.isPending || updateMutation.isPending,
            channelOptions,
            languageOptions,
            t,
            title: mode === "create"
                  ? (t("messaging.templates.addNew") || "Create Template")
                  : (t("messaging.templates.editTemplate") || "Edit Template"),
      };
}
