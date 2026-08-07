// UI-EXCEPTION: compact studio layout
"use client";

import { useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useMessageTemplatesViewModel } from "../viewmodels/useMessageTemplatesViewModel";
import { PreviewDialog } from "../components/PreviewDialog";
import type {
  MessageTemplate,
  TemplateCategory,
  ExportedTemplate,
} from "../../domain/entities/MessageTemplate";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Copy, Eye, Pencil, Trash2, Download, Upload, BarChart3 } from "lucide-react";
import { cn, formatUtc } from "@core/common/utils";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

// ─── Category Colors ────────────────────────────────────────
const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; text: string }> = {
  transactional: { bg: "bg-info/15", text: "text-info" },
  marketing: { bg: "bg-nx-accent-wash", text: "text-nx-accent" },
  notification: { bg: "bg-nx-accent-wash", text: "text-nx-accent" },
  onboarding: { bg: "bg-success/15", text: "text-success" },
  security: { bg: "bg-destructive/15", text: "text-destructive" },
  billing: { bg: "bg-warning/15", text: "text-warning" },
  custom: { bg: "bg-nx-raised", text: "text-nx-ink-3" },
};

/**
 * Presentation UI component rendering the message templates view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function MessageTemplatesView() {
  const router = useRouter();
  const {
    vm,
    configBase,
    handleClone,
    handlePreview,
    isCloning,
    previewResult,
    previewOpen,
    setPreviewOpen,
    isPreviewLoading,
    t,
  } = useMessageTemplatesViewModel();
  const { success } = useEnhancedToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Export ────────────────────────────────────────────────
  const handleExport = useCallback(
    (item: MessageTemplate) => {
      const exported: ExportedTemplate = {
        key: item.key,
        channel: item.channel,
        subject: item.subject,
        body: item.body,
        language: item.language,
        description: item.description,
        placeholderSchema: item.placeholderSchema,
        designVariables: item.designVariables,
        category: item.category,
        tags: item.tags,
        exportedAt: new Date().toISOString(),
        version: item.version,
      };
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template-${item.key}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success({ title: t("messaging.templates.exportSuccess") });
    },
    [success, t]
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          // Navigate to template creation form with imported data
          const params = new URLSearchParams({
            key: data.key || "",
            channel: data.channel || "Email",
            subject: data.subject || "",
            body: data.body || "",
            language: data.language || "en",
            description: data.description || "",
            imported: "true",
          });
          router.push(`/communication/templates/new?${params.toString()}`);
        } catch {
          success({ title: t("messaging.templates.importError") });
        }
      };
      reader.readAsText(file);
      // Reset so same file can be re-imported
      e.target.value = "";
    },
    [router, success, t]
  );

  // Navigate to full-page form instead of opening modal
  const handleCreateClick = useCallback(() => {
    router.push("/communication/templates/new");
  }, [router]);

  const handleEdit = useCallback(
    (item: MessageTemplate) => {
      router.push(`/communication/templates/${item.id}/edit`);
    },
    [router]
  );

  // Columns with JSX render functions defined in View (not ViewModel)
  const config: CrudConfig<MessageTemplate> = useMemo(
    () => ({
      ...configBase,
      createFields: [], // No modal form — we navigate to full-page form
      // Override: navigate to full-page form instead of modal
      onCreateClick: handleCreateClick,
      columns: [
        {
          key: "key",
          label: t("messaging.templates.key"),
          sortable: true,
        },
        {
          key: "category",
          label: t("messaging.templates.category"),
          render: (value: TemplateCategory | undefined) => {
            if (!value)
              return (
                <Badge variant="outline" className="text-xs">
                  —
                </Badge>
              );
            const colors = CATEGORY_COLORS[value] || CATEGORY_COLORS.custom;
            return (
              <Badge
                variant="outline"
                className={cn("border-0 text-xs capitalize", colors.bg, colors.text)}
              >
                {value}
              </Badge>
            );
          },
        },
        {
          key: "channel",
          label: t("messaging.templates.channel"),
        },
        {
          key: "language",
          label: t("messaging.templates.language"),
        },
        {
          key: "isActive",
          label: t("common.status"),
          render: (value: boolean) => (
            <Badge variant={value ? "success" : "secondary"}>
              {value ? t("common.active") : t("common.inactive")}
            </Badge>
          ),
        },
        {
          key: "usageCount",
          label: t("messaging.templates.usage"),
          render: (value: number | undefined, item: MessageTemplate) => (
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
              <span className="font-medium">{value ?? 0}</span>
              {item.lastUsedAt && (
                <span className="text-xs text-nx-ink-3">
                  · {formatUtc(item.lastUsedAt, "MMM d")}
                </span>
              )}
            </div>
          ),
        },
        {
          key: "version",
          label: t("messaging.templates.version"),
          render: (value: number) => (
            <Badge variant="outline" className="font-mono text-xs">
              v{value}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      getActions: (_vm: any, _t: any, handleDelete?: any): CrudAction<MessageTemplate>[] => [
        {
          label: t("common.edit"),
          icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
          onClick: (item: MessageTemplate) => handleEdit(item),
        },
        {
          label: t("messaging.templates.preview"),
          icon: <Eye className="h-4 w-4" aria-hidden="true" />,
          onClick: (item: MessageTemplate) => handlePreview(item),
        },
        {
          label: t("messaging.templates.clone"),
          icon: <Copy className="h-4 w-4" aria-hidden="true" />,
          onClick: (item: MessageTemplate) => handleClone(item.id),
          disabled: () => isCloning,
        },
        {
          label: t("messaging.templates.export"),
          icon: <Download className="h-4 w-4" aria-hidden="true" />,
          onClick: (item: MessageTemplate) => handleExport(item),
        },
        {
          label: t("common.delete"),
          icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
          onClick: handleDelete,
          confirmTitle: t("messaging.templates.deleteTitle"),
          confirmDescription: t("messaging.templates.deleteDescription"),
          confirmVariant: "destructive" as const,
        },
      ],
    }),
    [
      configBase,
      t,
      handlePreview,
      handleClone,
      isCloning,
      handleEdit,
      handleCreateClick,
      handleExport,
    ]
  );

  return (
    <>
      {/* Import/Export Toolbar */}
      <div className="mb-4 flex justify-end">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleImportClick}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {t("messaging.templates.import")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      <GenericCrudView viewModel={vm} config={config} onCreateClick={handleCreateClick} />

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        result={previewResult}
        isLoading={isPreviewLoading}
      />
    </>
  );
}
