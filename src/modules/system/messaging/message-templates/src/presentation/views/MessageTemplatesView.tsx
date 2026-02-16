"use client";

import { useMemo, useCallback } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useI18n } from "@core/providers/i18n-provider";
import { useMessageTemplatesViewModel } from "../viewmodels/useMessageTemplatesViewModel";
import { PreviewDialog } from "../components/PreviewDialog";
import type { MessageTemplate } from "../../domain/entities/MessageTemplate";
import { Badge } from "@core/ui/badge";
import { Copy, Eye } from "lucide-react";
import { format } from "date-fns";

export function MessageTemplatesView() {
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

      // Columns with JSX render functions defined in View (not ViewModel)
      const config: CrudConfig<MessageTemplate> = useMemo(
            () => ({
                  ...configBase,
                  columns: [
                        {
                              key: "key",
                              label: t("messaging.templates.key") || "Template Key",
                              sortable: true,
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
                              key: "version",
                              label: t("messaging.templates.version") || "Version",
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-"),
                        },
                  ],
                  getActions: (_vm: any, _t: any, _handleDelete?: any): CrudAction<MessageTemplate>[] => [
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
                  ],
            }),
            [configBase, t, handlePreview, handleClone, isCloning]
      );

      return (
            <>
                  <GenericCrudView viewModel={vm} config={config} />

                  <PreviewDialog
                        open={previewOpen}
                        onOpenChange={setPreviewOpen}
                        result={previewResult}
                        isLoading={isPreviewLoading}
                  />
            </>
      );
}
