/**
 * API Keys List View
 *
 * Renders the developer API Key management interface.
 * Uses GenericCrudView for table, filters, and standard columns.
 * Displays generated key plain text in a secure Dialog upon creation.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useI18n } from "@core/providers/i18n-provider";
import { useApiKeysViewModel } from "../viewmodels/useApiKeysViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import { GeneratedKeyDialog } from "../components/GeneratedKeyDialog";
import { ApiKey } from "../../domain/entities/ApiKey";
import { Key, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function ApiKeysView() {
  useModuleLocales(() => import("../../../locales"), "apikeys");

  const { t } = useI18n();
  const { vm, getConfigBase, generatedKey, setGeneratedKey } = useApiKeysViewModel();
  const configBase = getConfigBase();

  // Configure GenericCrudView
  const config: CrudConfig<ApiKey> = useMemo(
    () => ({
      titleKey: "apikeys.title",
      subtitleKey: "apikeys.description",
      resource: "apikeys",
      columns: [
        {
          key: "name",
          label: t("apikeys.name") || "Key Name",
          sortable: true,
          render: (_val: unknown, item: ApiKey) => (
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-violet-500 shrink-0" />
              <span className="font-semibold text-sm">{item.name || t("apikeys.untitled")}</span>
            </div>
          ),
        },
        {
          key: "prefix",
          label: t("apikeys.prefix") || "Prefix",
          render: (_val: unknown, item: ApiKey) => (
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded border">
              {item.prefix}...
            </span>
          ),
        },
        {
          key: "status",
          label: t("apikeys.statusLabel") || "Status",
          render: (_val: unknown, item: ApiKey) => {
            const status = item.status;
            let variant: "default" | "secondary" | "outline" | "destructive" = "default";
            let className = "";

            if (status === "active") {
              variant = "default";
              className = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100";
            } else if (status === "expired") {
              variant = "outline";
              className = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 border-amber-300";
            } else {
              variant = "destructive";
              className = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100";
            }

            return (
              <Badge variant={variant} className={`text-xs ${className}`}>
                {t(`apikeys.status.${status}`) || status}
              </Badge>
            );
          },
        },
        {
          key: "scopes",
          label: t("apikeys.scopes") || "Scopes",
          render: (_val: unknown, item: ApiKey) => (
            <div className="flex flex-wrap gap-1 max-w-[250px]">
              {item.scopesList.map((scope) => (
                <Badge key={scope} variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                  {scope}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          key: "createdAt",
          label: t("apikeys.createdAt") || "Created At",
          render: (_val: unknown, item: ApiKey) => (
            <span className="text-xs text-muted-foreground">
              {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "—"}
            </span>
          ),
        },
        {
          key: "expiresAt",
          label: t("apikeys.expiresAt") || "Expires At",
          render: (_val: unknown, item: ApiKey) => (
            <span className="text-xs text-muted-foreground font-medium">
              {item.expiresAt ? (
                format(new Date(item.expiresAt), "MMM d, yyyy")
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                  {t("apikeys.neverExpires") || "Never Expires"}
                </span>
              )}
            </span>
          ),
        },
      ],
      createFields: configBase.createFields || [],
      createInitialValues: configBase.createInitialValues,
      getItemDisplayName: configBase.getItemDisplayName,
      deleteService: configBase.deleteService,
      permissions: configBase.permissions,
      getActions: (
        _vmInstance: unknown,
        tFn: (key: string) => string,
        handleDeleteFn?: (item: ApiKey) => void
      ): CrudAction<ApiKey>[] => [
        {
          label: tFn("apikeys.revoke") || "Revoke Key",
          onClick: (item: ApiKey) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          requiredPermission: "apikeys:delete",
          confirmTitle: tFn("apikeys.revokeConfirmTitle") || "Revoke API Key",
          confirmDescription:
            tFn("apikeys.revokeConfirmDesc") ||
            "This will permanently invalidate the API key. Any external scripts or integrations using it will instantly fail. This action is irreversible.",
          confirmVariant: "destructive" as const,
        },
      ],
    }),
    [t, configBase]
  );

  return (
    <div className="space-y-5">
      {/* Main CRUD Table */}
      <GenericCrudView viewModel={vm} config={config} />

      {/* Generated Token Success Dialog (Show Once Modal) */}
      <GeneratedKeyDialog
        generatedKey={generatedKey}
        onClose={() => setGeneratedKey(null)}
      />
    </div>
  );
}
