/**
 * API Keys List View
 *
 * Renders the developer API Key management interface.
 * Uses GenericCrudView for table, filters, and standard columns.
 * Displays generated key plain text in a secure Dialog upon creation.
 */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useI18n } from "@core/providers/i18n-provider";
import { useApiKeysViewModel } from "../viewmodels/useApiKeysViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { GeneratedKeyDialog } from "../components/GeneratedKeyDialog";
import { ApiKey } from "../../domain/entities/ApiKey";
import { Key, Trash2, Eye } from "lucide-react";
import { formatUtc } from "@core/common/utils";

export function ApiKeysView() {
  useModuleLocales(() => import("../../../locales"), "apikeys");

  const { t } = useI18n();
  const router = useRouter();
  const { vm, getConfigBase, generatedKey, setGeneratedKey } = useApiKeysViewModel();
  const configBase = getConfigBase();

  // Configure GenericCrudView
  const config: CrudConfig<ApiKey> = useMemo(
    () => ({
      titleKey: "apikeys.title",
      subtitleKey: "apikeys.description",
      resource: "apikeys",
      entityTypeKey: "integrations.api-key",
      columns: [
        {
          key: "name",
          label: t("apikeys.name"),
          sortable: true,
          render: (_val: unknown, item: ApiKey) => (
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 shrink-0 text-nx-accent" />
              <span
                onClick={() => router.push(`/integrations/apikeys/${item.id}`)}
                className="cursor-pointer text-sm font-semibold hover:text-nx-accent hover:underline"
              >
                {item.name || t("apikeys.untitled")}
              </span>
            </div>
          ),
        },
        {
          key: "prefix",
          label: t("apikeys.prefix"),
          render: (_val: unknown, item: ApiKey) => (
            <span className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-0.5 font-mono text-xs">
              {item.prefix}...
            </span>
          ),
        },
        {
          key: "status",
          label: t("apikeys.statusLabel"),
          render: (_val: unknown, item: ApiKey) => {
            const status = item.status;
            let variant: "default" | "secondary" | "outline" | "destructive" = "default";
            let className = "";

            if (status === "active") {
              variant = "default";
              className = "bg-success/15 text-success hover:bg-success/15";
            } else if (status === "expired") {
              variant = "outline";
              className = "bg-warning/15 text-warning hover:bg-warning/15 border-warning/40";
            } else {
              variant = "destructive";
              className = "bg-destructive/15 text-destructive hover:bg-destructive/15";
            }

            return (
              <Badge variant={variant} className={`text-xs ${className}`}>
                {t(`apikeys.status.${status}`)}
              </Badge>
            );
          },
        },
        {
          key: "scopes",
          label: t("apikeys.scopes"),
          render: (_val: unknown, item: ApiKey) => {
            const list = item.scopesList;
            if (list.length === 0) return <span className="text-xs text-nx-ink-3">—</span>;

            const limit = 2;
            const visible = list.slice(0, limit);
            const extraCount = list.length - limit;

            return (
              <div className="flex max-w-[280px] flex-wrap items-center gap-1">
                {visible.map((scope) => (
                  <Badge
                    key={scope}
                    variant="secondary"
                    className="shrink-0 border border-[color:color-mix(in_srgb,var(--nx-accent)_25%,transparent)] bg-nx-accent-wash px-2 py-0.5 font-mono text-[10px] text-nx-accent"
                  >
                    {scope}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        variant="outline"
                        className="shrink-0 cursor-pointer border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-accent)_15%,transparent)] px-2 py-0.5 font-mono text-[10px] text-nx-accent hover:bg-[color:color-mix(in_srgb,var(--nx-accent)_25%,transparent)]"
                      >
                        +{extraCount} {t("apikeys.more")}
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-3 text-xs" align="start">
                      <p className="mb-2 font-semibold text-nx-ink">{t("apikeys.allScopes")}:</p>
                      <div className="flex max-h-[160px] flex-wrap gap-1 overflow-y-auto pe-1">
                        {list.map((scope) => (
                          <Badge
                            key={scope}
                            variant="secondary"
                            className="border border-[color:color-mix(in_srgb,var(--nx-accent)_25%,transparent)] bg-nx-accent-wash px-2 py-0.5 font-mono text-[10px] text-nx-accent"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          },
        },
        {
          key: "createdAt",
          label: t("apikeys.createdAt"),
          render: (_val: unknown, item: ApiKey) => (
            <span className="font-mono text-xs text-nx-ink-3">
              {item.createdAt ? formatUtc(item.createdAt, "MMM d, yyyy") : "—"}
            </span>
          ),
        },
        {
          key: "expiresAt",
          label: t("apikeys.expiresAt"),
          render: (_val: unknown, item: ApiKey) => (
            <span className="font-mono text-xs text-nx-ink-3">
              {item.expiresAt ? (
                formatUtc(item.expiresAt, "MMM d, yyyy")
              ) : (
                <span className="font-sans font-normal text-success">
                  {t("apikeys.neverExpires")}
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
          label: tFn("apikeys.viewDetails"),
          onClick: (item: ApiKey) => router.push(`/integrations/apikeys/${item.id}`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
          requiredPermission: "apikeys.view",
        },
        {
          label: tFn("apikeys.revoke"),
          onClick: (item: ApiKey) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/90",
          icon: <Trash2 className="h-4 w-4" />,
          requiredPermission: "apikeys.delete",
          confirmTitle: tFn("apikeys.revokeConfirmTitle"),
          confirmDescription: tFn("apikeys.revokeConfirmDesc"),
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
      <GeneratedKeyDialog generatedKey={generatedKey} onClose={() => setGeneratedKey(null)} />
    </div>
  );
}
