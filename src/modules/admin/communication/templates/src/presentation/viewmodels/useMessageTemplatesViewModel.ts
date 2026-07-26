"use client";

import { useMemo, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { communicationContainer } from "@modules/communication/di";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { MessageTemplate } from "../../domain/entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
} from "../../domain/entities/MessageTemplateRequests";

const QUERY_KEY = ["message-templates"];

/**
 * React hook/ViewModel orchestrating state and data flows for message templates view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useMessageTemplatesViewModel() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { messageTemplateRepository: repo } = communicationContainer;

  // ─── CRUD ViewModel ────────────────────────────────────────
  const vm = useCrudViewModel<
    MessageTemplate,
    CreateMessageTemplateRequest,
    UpdateMessageTemplateRequest
  >(QUERY_KEY, {
    getAll: async (params) => {
      const result = await repo.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: result.items || [],
        pagination: {
          itemsCount: result.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil(result.totalCount / params.pageSize),
        },
      };
    },
    create: async (data) => {
      await repo.create(data);
      // Return empty entity to satisfy type — will refresh from server
      return {} as MessageTemplate;
    },
    update: async (id, data) => {
      await repo.update(id, data);
      // Return empty entity to satisfy type — will refresh from server
      return {} as MessageTemplate;
    },
    delete: async (id) => {
      await repo.delete(id);
    },
  });

  // ─── Clone ─────────────────────────────────────────────────
  const cloneMutation = useMutation({
    mutationFn: (id: string) => repo.clone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("messaging.templates.cloneSuccess") });
    },
    onError: () => {
      toastError({ title: t("messaging.templates.cloneError") });
    },
  });

  const handleClone = useCallback((id: string) => cloneMutation.mutate(id), [cloneMutation]);

  // ─── Preview ───────────────────────────────────────────────
  const [previewResult, setPreviewResult] = useState<PreviewTemplateResponse | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewMutation = useMutation({
    mutationFn: (data: PreviewTemplateRequest) => repo.preview(data),
    onSuccess: (result) => {
      setPreviewResult(result);
      setPreviewOpen(true);
    },
    onError: () => {
      toastError({ title: t("messaging.templates.previewError") });
    },
  });

  const handlePreview = useCallback(
    (template: MessageTemplate) => {
      const sampleData: Record<string, unknown> = {};
      if (template.placeholderSchema) {
        for (const placeholder of template.placeholderSchema) {
          sampleData[placeholder.key] = placeholder.sample || `[${placeholder.key}]`;
        }
      }
      previewMutation.mutate({
        subject: template.subject ?? undefined,
        body: template.body,
        sampleData,
      });
    },
    [previewMutation]
  );

  // ─── Config (NO JSX — columns defined in View) ─────────────
  const configBase = useMemo(
    (): Omit<CrudConfig<MessageTemplate>, "columns"> => ({
      titleKey: "messaging.templates.title",
      subtitleKey: "messaging.templates.description",
      resource: "message-templates",
      createFields: [
        {
          name: "key",
          label: t("messaging.templates.key"),
          type: "text" as const,
          placeholder: "e.g., welcome-email",
          required: true,
        },
        {
          name: "channel",
          label: t("messaging.templates.channel"),
          type: "select" as const,
          required: true,
          options: [
            { value: "Email", label: "Email" },
            { value: "SMS", label: "SMS" },
            { value: "Push", label: "Push" },
          ],
        },
        {
          name: "language",
          label: t("messaging.templates.language"),
          type: "select" as const,
          required: true,
          options: [
            { value: "en", label: "English" },
            { value: "ar", label: "العربية" },
          ],
        },
        {
          name: "subject",
          label: t("messaging.templates.subject"),
          type: "text" as const,
          placeholder: t("messaging.templates.subjectPlaceholder"),
        },
        {
          name: "body",
          label: t("messaging.templates.body"),
          type: "richtext" as const,
          placeholder: t("messaging.templates.bodyPlaceholder"),
          required: true,
          rows: 15,
        },
        {
          name: "description",
          label: t("messaging.templates.descriptionLabel"),
          type: "textarea" as const,
          placeholder: t("messaging.templates.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("common.active"),
          type: "switch" as const,
        },
      ],
      editFields: [
        {
          name: "subject",
          label: t("messaging.templates.subject"),
          type: "text" as const,
          placeholder: t("messaging.templates.subjectPlaceholder"),
        },
        {
          name: "body",
          label: t("messaging.templates.body"),
          type: "richtext" as const,
          placeholder: t("messaging.templates.bodyPlaceholder"),
          required: true,
          rows: 15,
        },
        {
          name: "description",
          label: t("messaging.templates.descriptionLabel"),
          type: "textarea" as const,
          placeholder: t("messaging.templates.descriptionPlaceholder"),
        },
        {
          name: "isActive",
          label: t("common.active"),
          type: "switch" as const,
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {
        key: "",
        channel: "Email",
        language: "en",
        subject: "",
        body: "",
        description: "",
        isActive: true,
      },
      editInitialValues: (template: MessageTemplate) => ({
        id: template.id,
        subject: template.subject || "",
        body: template.body || "",
        description: template.description || "",
        isActive: template.isActive,
      }),
      getItemDisplayName: (template: MessageTemplate) => template.key,
      deleteService: async (id: string) => {
        await repo.delete(id);
      },
    }),
    [t, repo]
  );

  return {
    vm,
    configBase,
    // Clone
    handleClone,
    isCloning: cloneMutation.isPending,
    // Preview
    handlePreview,
    previewResult,
    previewOpen,
    setPreviewOpen,
    isPreviewLoading: previewMutation.isPending,
    t,
  };
}
