/**
 * Identity Providers List View
 *
 * Main page for identity provider management (SSO configuration).
 * Uses GenericCrudView for standard CRUD + custom protocol/scope columns.
 */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { useIdentityProvidersViewModel } from "../viewmodels/useIdentityProvidersViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import {
      Pencil,
      Trash2,
      Zap,
      Shield,
      Users,
      Fingerprint,
      Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@core/ui/button";

export function IdentityProvidersView() {
      const { t } = useI18n();
      const router = useRouter();
      const { vm, getConfigBase, handleTestConnection, isTesting, testingId } =
            useIdentityProvidersViewModel();
      const configBase = getConfigBase();

      const config: CrudConfig<IdentityProviderListItem> = useMemo(
            () => ({
                  titleKey: "identityProviders.title",
                  subtitleKey: "identityProviders.description",
                  resource: "identity_providers",
                  columns: [
                        {
                              key: "name",
                              label: t("identityProviders.name") || "Name",
                              sortable: true,
                              render: (_val: unknown, item: IdentityProviderListItem) => (
                                    <div className="flex items-center gap-2">
                                          {item.iconUrl ? (
                                                <img
                                                      src={item.iconUrl}
                                                      alt={item.name}
                                                      className="h-5 w-5 rounded object-contain"
                                                />
                                          ) : (
                                                <Fingerprint className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <div className="flex flex-col">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                      {item.slug}
                                                </span>
                                          </div>
                                    </div>
                              ),
                        },
                        {
                              key: "protocol",
                              label: t("identityProviders.protocol") || "Protocol",
                              render: (_val: unknown, item: IdentityProviderListItem) => {
                                    const protocolConfig: Record<
                                          string,
                                          { label: string; className: string }
                                    > = {
                                          oidc: {
                                                label: "OIDC",
                                                className:
                                                      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                          },
                                          oauth2: {
                                                label: "OAuth2",
                                                className:
                                                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                                          },
                                          saml: {
                                                label: "SAML",
                                                className:
                                                      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                          },
                                    };
                                    const cfg = protocolConfig[item.protocol] ?? {
                                          label: item.protocol.toUpperCase(),
                                          className: "",
                                    };
                                    return (
                                          <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
                                                {cfg.label}
                                          </Badge>
                                    );
                              },
                        },
                        {
                              key: "scope",
                              label: t("identityProviders.scope") || "Scope",
                              render: (_val: unknown, item: IdentityProviderListItem) => (
                                    <div className="flex items-center gap-1.5">
                                          {item.enabledForAdmins && (
                                                <Badge
                                                      variant="outline"
                                                      className="text-xs gap-1 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                                                >
                                                      <Shield className="h-3 w-3" />
                                                      Admin
                                                </Badge>
                                          )}
                                          {item.enabledForUsers && (
                                                <Badge
                                                      variant="outline"
                                                      className="text-xs gap-1 bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
                                                >
                                                      <Users className="h-3 w-3" />
                                                      User
                                                </Badge>
                                          )}
                                          {!item.enabledForAdmins && !item.enabledForUsers && (
                                                <span className="text-xs text-muted-foreground">None</span>
                                          )}
                                    </div>
                              ),
                        },
                        {
                              key: "isActive",
                              label: t("common.status") || "Status",
                              render: (_val: unknown, item: IdentityProviderListItem) => (
                                    <Badge
                                          variant={item.isActive ? "default" : "secondary"}
                                          className={`text-xs ${item.isActive
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                    >
                                          {item.isActive
                                                ? t("common.active") || "Active"
                                                : t("common.inactive") || "Inactive"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (_val: unknown, item: IdentityProviderListItem) => (
                                    <span className="text-sm text-muted-foreground">
                                          {item.createdAt
                                                ? format(new Date(item.createdAt), "MMM d, yyyy")
                                                : "—"}
                                    </span>
                              ),
                        },
                        {
                              key: "test",
                              label: t("identityProviders.testConnection") || "Test",
                              render: (_val: unknown, item: IdentityProviderListItem) => (
                                    <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs gap-1.5"
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                handleTestConnection(item.id);
                                          }}
                                          disabled={isTesting && testingId === item.id}
                                    >
                                          {isTesting && testingId === item.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                                <Zap className="h-3 w-3" />
                                          )}
                                          {t("identityProviders.test") || "Test"}
                                    </Button>
                              ),
                        },
                  ],
                  getItemDisplayName: configBase.getItemDisplayName,
                  deleteService: configBase.deleteService,
                  permissions: configBase.permissions,
                  onCreateClick: () => router.push("/settings/identity-providers/create"),
                  getActions: (
                        _vmInstance: any,
                        tFn: any,
                        handleDeleteFn: any,
                  ): CrudAction<IdentityProviderListItem>[] => [
                              {
                                    label: tFn("common.edit") || "Edit",
                                    onClick: (item: IdentityProviderListItem) =>
                                          router.push(`/settings/identity-providers/${item.id}`),
                                    variant: "ghost" as const,
                                    icon: <Pencil className="h-4 w-4" />,
                                    requiredPermission: "identity_providers:update",
                              },
                              {
                                    label: tFn("common.delete") || "Delete",
                                    onClick: (item: IdentityProviderListItem) =>
                                          handleDeleteFn?.(item),
                                    variant: "ghost" as const,
                                    className: "text-red-600 hover:text-red-700",
                                    icon: <Trash2 className="h-4 w-4" />,
                                    requiredPermission: "identity_providers:delete",
                                    confirmTitle:
                                          tFn("identityProviders.deleteConfirmTitle") ||
                                          "Delete Identity Provider",
                                    confirmDescription:
                                          tFn("identityProviders.deleteConfirmDesc") ||
                                          "This will permanently remove this identity provider. Users linked via this provider will lose SSO access.",
                                    confirmVariant: "destructive" as const,
                              },
                        ],
            }),
            [t, configBase, handleTestConnection, isTesting, testingId, router],
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}
