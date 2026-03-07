/**
 * OAuth Applications List View
 *
 * Management page for third-party OAuth applications (OIDC Server).
 * Uses GenericCrudView for CRUD + custom client-type/scopes columns.
 */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import type { OAuthAppListItem } from "../../domain/entities/OAuthApp";
import { useOAuthAppsViewModel } from "../viewmodels/useOAuthAppsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
      Pencil,
      Trash2,
      KeyRound,
      Copy,
      Check,
      Lock,
      Unlock,
      AppWindow,
      Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";

export function OAuthAppsView() {
      const { t } = useI18n();
      const router = useRouter();
      const {
            vm,
            getConfigBase,
            handleRegenerateSecret,
            isRegenerating,
            regeneratingId,
            generatedSecret,
            clearGeneratedSecret,
      } = useOAuthAppsViewModel();
      const configBase = getConfigBase();

      const [copiedField, setCopiedField] = useState<string | null>(null);

      const copyToClipboard = async (text: string, field: string) => {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
      };

      const config: CrudConfig<OAuthAppListItem> = useMemo(
            () => ({
                  titleKey: "oauthApps.title",
                  subtitleKey: "oauthApps.description",
                  resource: "oauth_apps",
                  columns: [
                        {
                              key: "displayName",
                              label: t("oauthApps.displayName") || "Application",
                              sortable: true,
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <div className="flex items-center gap-2">
                                          {item.logoUri ? (
                                                <img
                                                      src={item.logoUri}
                                                      alt={item.displayName}
                                                      className="h-5 w-5 rounded object-contain"
                                                />
                                          ) : (
                                                <AppWindow className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <div className="flex flex-col">
                                                <span className="text-sm font-medium">{item.displayName}</span>
                                                {item.description && (
                                                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {item.description}
                                                      </span>
                                                )}
                                          </div>
                                    </div>
                              ),
                        },
                        {
                              key: "clientId",
                              label: t("oauthApps.clientId") || "Client ID",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <div className="flex items-center gap-1.5">
                                          <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[140px]" title={item.clientId}>
                                                {item.clientId}
                                          </code>
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                      e.stopPropagation();
                                                      copyToClipboard(item.clientId, `clientId-${item.id}`);
                                                }}
                                          >
                                                {copiedField === `clientId-${item.id}` ? (
                                                      <Check className="h-3 w-3 text-emerald-500" />
                                                ) : (
                                                      <Copy className="h-3 w-3 text-muted-foreground" />
                                                )}
                                          </Button>
                                    </div>
                              ),
                        },
                        {
                              key: "clientType",
                              label: t("oauthApps.clientType") || "Type",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <Badge
                                          variant="outline"
                                          className={`text-xs gap-1 ${item.isConfidential
                                                ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                                : "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800"
                                                }`}
                                    >
                                          {item.isConfidential ? (
                                                <Lock className="h-3 w-3" />
                                          ) : (
                                                <Unlock className="h-3 w-3" />
                                          )}
                                          {item.clientTypeLabel}
                                    </Badge>
                              ),
                        },
                        {
                              key: "allowedScopes",
                              label: t("oauthApps.scopes") || "Scopes",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <Badge variant="outline" className="text-xs font-medium">
                                          {item.scopeCount} scope{item.scopeCount !== 1 ? "s" : ""}
                                    </Badge>
                              ),
                        },
                        {
                              key: "requirePkce",
                              label: "PKCE",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <Badge
                                          variant={item.requirePkce ? "default" : "secondary"}
                                          className={`text-xs ${item.requirePkce
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                    >
                                          {item.requirePkce ? "On" : "Off"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "isActive",
                              label: t("common.status") || "Status",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <Badge
                                          variant={item.isActive ? "default" : "secondary"}
                                          className={`text-xs ${item.isActive
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                    >
                                          {item.isActive ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (_val: unknown, item: OAuthAppListItem) => (
                                    <span className="text-sm text-muted-foreground">
                                          {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "—"}
                                    </span>
                              ),
                        },
                  ],
                  getItemDisplayName: configBase.getItemDisplayName,
                  deleteService: configBase.deleteService,
                  permissions: configBase.permissions,
                  onCreateClick: () => router.push("/settings/oauth-apps/create"),
                  getActions: (
                        _vmInstance: any,
                        tFn: any,
                        handleDeleteFn: any,
                  ): CrudAction<OAuthAppListItem>[] => [
                              {
                                    label: tFn("oauthApps.regenerateSecret") || "Regenerate Secret",
                                    onClick: (item: OAuthAppListItem) => handleRegenerateSecret(item.id),
                                    variant: "ghost" as const,
                                    icon: isRegenerating
                                          ? <Loader2 className="h-4 w-4 animate-spin" />
                                          : <KeyRound className="h-4 w-4" />,
                                    requiredPermission: "oauth_apps:update",
                                    confirmTitle: tFn("oauthApps.regenerateConfirmTitle") || "Regenerate Client Secret",
                                    confirmDescription: tFn("oauthApps.regenerateConfirmDesc") || "The current secret will be invalidated. All applications using the old secret will stop working.",
                                    confirmVariant: "destructive" as const,
                              },
                              {
                                    label: tFn("common.edit") || "Edit",
                                    onClick: (item: OAuthAppListItem) =>
                                          router.push(`/settings/oauth-apps/${item.id}`),
                                    variant: "ghost" as const,
                                    icon: <Pencil className="h-4 w-4" />,
                                    requiredPermission: "oauth_apps:update",
                              },
                              {
                                    label: tFn("common.delete") || "Delete",
                                    onClick: (item: OAuthAppListItem) => handleDeleteFn?.(item),
                                    variant: "ghost" as const,
                                    className: "text-red-600 hover:text-red-700",
                                    icon: <Trash2 className="h-4 w-4" />,
                                    requiredPermission: "oauth_apps:delete",
                                    confirmTitle: tFn("oauthApps.deleteConfirmTitle") || "Delete OAuth Application",
                                    confirmDescription: tFn("oauthApps.deleteConfirmDesc") || "This will permanently remove this application. All authenticated sessions will be invalidated.",
                                    confirmVariant: "destructive" as const,
                              },
                        ],
            }),
            [t, configBase, handleRegenerateSecret, isRegenerating, regeneratingId, router],
      );

      return (
            <>
                  <GenericCrudView viewModel={vm} config={config} />

                  {/* Secret Display Dialog — one-time show after regeneration */}
                  <Dialog open={!!generatedSecret} onOpenChange={() => clearGeneratedSecret()}>
                        <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                          <KeyRound className="h-5 w-5 text-amber-500" />
                                          {t("oauthApps.newSecret") || "New Client Secret"}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {t("oauthApps.secretWarning") ||
                                                "Copy this secret now. It will NOT be shown again."}
                                    </DialogDescription>
                              </DialogHeader>

                              {generatedSecret && (
                                    <div className="space-y-3 mt-2">
                                          <div>
                                                <label className="text-xs font-medium text-muted-foreground">Client ID</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                      <code className="flex-1 text-sm font-mono bg-muted/50 p-2 rounded border truncate">
                                                            {generatedSecret.clientId}
                                                      </code>
                                                      <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0"
                                                            onClick={() => copyToClipboard(generatedSecret.clientId, "dialog-clientId")}
                                                      >
                                                            {copiedField === "dialog-clientId" ? (
                                                                  <Check className="h-4 w-4 text-emerald-500" />
                                                            ) : (
                                                                  <Copy className="h-4 w-4" />
                                                            )}
                                                      </Button>
                                                </div>
                                          </div>
                                          <div>
                                                <label className="text-xs font-medium text-muted-foreground">Client Secret</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                      <code className="flex-1 text-sm font-mono bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-2 rounded border border-amber-200 dark:border-amber-800 break-all">
                                                            {generatedSecret.secret}
                                                      </code>
                                                      <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0"
                                                            onClick={() => copyToClipboard(generatedSecret.secret, "dialog-secret")}
                                                      >
                                                            {copiedField === "dialog-secret" ? (
                                                                  <Check className="h-4 w-4 text-emerald-500" />
                                                            ) : (
                                                                  <Copy className="h-4 w-4" />
                                                            )}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </DialogContent>
                  </Dialog>
            </>
      );
}
