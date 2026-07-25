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
  marketing: { bg: "bg-primary/15", text: "text-primary" },
  notification: { bg: "bg-primary/15", text: "text-primary" },
  onboarding: { bg: "bg-success/15", text: "text-success" },
  security: { bg: "bg-destructive/15", text: "text-destructive" },
  billing: { bg: "bg-warning/15", text: "text-warning" },
  custom: { bg: "bg-muted", text: "text-muted-foreground" },
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
      success({ title: "Template exported successfully" });
    },
    [success]
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
          success({ title: "Invalid template file" });
        }
      };
      reader.readAsText(file);
      // Reset so same file can be re-imported
      e.target.value = "";
    },
    [router, success]
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
          label: t("messaging.templates.key") || "Template Key",
          sortable: true,
        },
        {
          key: "category",
          label: t("messaging.templates.category") || "Category",
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
          label: t("messaging.templates.channel") || "Channel",
        },
        {
          key: "language",
          label: t("messaging.templates.language") || "Language",
        },
        {
          key: "isActive",
          label: t("common.status") || "Status",
          render: (value: boolean) => (
            <Badge variant={value ? "success" : "secondary"}>
              {value ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
            </Badge>
          ),
        },
        {
          key: "usageCount",
          label: t("messaging.templates.usage") || "Usage",
          render: (value: number | undefined, item: MessageTemplate) => (
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{value ?? 0}</span>
              {item.lastUsedAt && (
                <span className="text-xs text-muted-foreground">
                  · {formatUtc(item.lastUsedAt, "MMM d")}
                </span>
              )}
            </div>
          ),
        },
        {
          key: "version",
          label: t("messaging.templates.version") || "Version",
          render: (value: number) => (
            <Badge variant="outline" className="font-mono text-xs">
              v{value}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt") || "Created",
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      getActions: (_vm: any, _t: any, handleDelete?: any): CrudAction<MessageTemplate>[] => [
        {
          label: t("common.edit") || "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: (item: MessageTemplate) => handleEdit(item),
        },
        {
          label: t("messaging.templates.preview") || "Preview",
          icon: <Eye className="h-4 w-4" />,
          onClick: (item: MessageTemplate) => handlePreview(item),
        },
        {
          label: t("messaging.templates.clone") || "Clone",
          icon: <Copy className="h-4 w-4" />,
          onClick: (item: MessageTemplate) => handleClone(item.id),
          disabled: () => isCloning,
        },
        {
          label: t("messaging.templates.export") || "Export",
          icon: <Download className="h-4 w-4" />,
          onClick: (item: MessageTemplate) => handleExport(item),
        },
        {
          label: t("common.delete") || "Delete",
          icon: <Trash2 className="h-4 w-4" />,
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
            <Upload className="h-3.5 w-3.5" />
            Import
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
