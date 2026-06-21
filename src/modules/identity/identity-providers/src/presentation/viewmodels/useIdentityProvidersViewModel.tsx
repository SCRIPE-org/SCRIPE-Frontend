/**
 * Identity Providers List ViewModel
 *
 * Orchestrates the identity provider management page.
 * Uses useCrudViewModel for standard CRUD and additional
 * test-connection action.
 */
"use client";

import { useCallback } from "react";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Pencil, Trash2, Zap, Shield, Users, Fingerprint } from "lucide-react";
import { format } from "date-fns";

export const identityProviderKeys = {
  all: ["identity-providers"] as const,
  list: (filters: Record<string, unknown>) =>
    [...identityProviderKeys.all, "list", filters] as const,
  detail: (id: string) => [...identityProviderKeys.all, "detail", id] as const,
};

export function useIdentityProvidersViewModel() {
  const { identityProviderRepository } = identityContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  // ============ Core CRUD ViewModel ============
  const vm = useCrudViewModel<IdentityProviderListItem, any, any>([...identityProviderKeys.all], {
    getAll: async (params) => {
      const res = await identityProviderRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil(res.totalCount / params.pageSize),
        },
      };
    },
    create: async (data: any) => {
      const result = await identityProviderRepository.create(data);
      success({
        title: t("identityProviders.created") || "Provider Created",
        description:
          t("identityProviders.createdDesc") || "Identity provider created successfully.",
      });
      return result as unknown as IdentityProviderListItem;
    },
    update: async (id: string, data: any) => {
      await identityProviderRepository.update(id, data);
      success({
        title: t("identityProviders.updated") || "Provider Updated",
        description:
          t("identityProviders.updatedDesc") || "Identity provider updated successfully.",
      });
      return {} as IdentityProviderListItem;
    },
    delete: async (id: string) => {
      await identityProviderRepository.remove(id);
      success({
        title: t("identityProviders.deleted") || "Provider Deleted",
        description: t("identityProviders.deletedDesc") || "Identity provider deleted.",
      });
    },
  });

  // ============ Test Connection Mutation ============
  const testMutation = useMutation({
    mutationFn: (id: string) => identityProviderRepository.testConnection(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        success({
          title: t("identityProviders.testSuccess") || "Connection Successful",
          description: result.message || "Provider is reachable.",
        });
      } else {
        toastError({
          title: t("identityProviders.testFailed") || "Connection Failed",
          description: result.message || "Could not reach the provider.",
        });
      }
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ============ Config Base ============
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<IdentityProviderListItem>> => ({
      createFields: [
        {
          name: "name",
          label: t("identityProviders.name") || "Provider Name",
          type: "text" as const,
          placeholder: t("identityProviders.namePlaceholder") || "e.g. Corporate Azure AD",
          required: true,
        },
        {
          name: "slug",
          label: t("identityProviders.slug") || "Slug",
          type: "text" as const,
          placeholder: t("identityProviders.slugPlaceholder") || "e.g. azure-ad",
          required: true,
        },
        {
          name: "protocol",
          label: t("identityProviders.protocol") || "Protocol",
          type: "select" as const,
          required: true,
          options: [
            { value: "oidc", label: "OpenID Connect (OIDC)" },
            { value: "oauth2", label: "OAuth 2.0" },
            { value: "saml", label: "SAML (Coming Soon)" },
          ],
        },
        {
          name: "authority",
          label: t("identityProviders.authority") || "Authority URL",
          type: "text" as const,
          placeholder: "https://login.microsoftonline.com/{tenant}/v2.0",
        },
        {
          name: "clientId",
          label: t("identityProviders.clientId") || "Client ID",
          type: "text" as const,
          placeholder: t("identityProviders.clientIdPlaceholder") || "OAuth2 client_id",
        },
        {
          name: "clientSecret",
          label: t("identityProviders.clientSecret") || "Client Secret",
          type: "text" as const,
          placeholder: t("identityProviders.clientSecretPlaceholder") || "OAuth2 client_secret",
        },
        {
          name: "scopes",
          label: t("identityProviders.scopes") || "Scopes",
          type: "text" as const,
          placeholder: "openid profile email",
        },
        {
          name: "enabledForAdmins",
          label: t("identityProviders.enabledForAdmins") || "Enable for Admins",
          type: "switch" as const,
        },
        {
          name: "enabledForUsers",
          label: t("identityProviders.enabledForUsers") || "Enable for Users",
          type: "switch" as const,
        },
        {
          name: "buttonColor",
          label: t("identityProviders.buttonColor") || "Button Color",
          type: "text" as const,
          placeholder: "#0078D4",
        },
        {
          name: "buttonLabel",
          label: t("identityProviders.buttonLabel") || "Button Label",
          type: "text" as const,
          placeholder: t("identityProviders.buttonLabelPlaceholder") || "Sign in with ...",
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("identityProviders.name") || "Provider Name",
          type: "text" as const,
        },
        {
          name: "slug",
          label: t("identityProviders.slug") || "Slug",
          type: "text" as const,
        },
        {
          name: "authority",
          label: t("identityProviders.authority") || "Authority URL",
          type: "text" as const,
        },
        {
          name: "clientId",
          label: t("identityProviders.clientId") || "Client ID",
          type: "text" as const,
        },
        {
          name: "clientSecret",
          label: t("identityProviders.clientSecret") || "Client Secret (leave blank to keep)",
          type: "text" as const,
        },
        {
          name: "scopes",
          label: t("identityProviders.scopes") || "Scopes",
          type: "text" as const,
        },
        {
          name: "enabledForAdmins",
          label: t("identityProviders.enabledForAdmins") || "Enable for Admins",
          type: "switch" as const,
        },
        {
          name: "enabledForUsers",
          label: t("identityProviders.enabledForUsers") || "Enable for Users",
          type: "switch" as const,
        },
        {
          name: "buttonColor",
          label: t("identityProviders.buttonColor") || "Button Color",
          type: "text" as const,
        },
        {
          name: "buttonLabel",
          label: t("identityProviders.buttonLabel") || "Button Label",
          type: "text" as const,
        },
      ],
      createInitialValues: {
        name: "",
        slug: "",
        protocol: "oidc",
        authority: "",
        clientId: "",
        clientSecret: "",
        scopes: "openid profile email",
        enabledForAdmins: false,
        enabledForUsers: true,
        buttonColor: "",
        buttonLabel: "",
      },
      editInitialValues: (item: IdentityProviderListItem) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        enabledForAdmins: item.enabledForAdmins,
        enabledForUsers: item.enabledForUsers,
        buttonColor: item.buttonColor || "",
      }),
      getItemDisplayName: (item: IdentityProviderListItem) => item.name,
      deleteService: async (id: string) => {
        await identityProviderRepository.remove(id);
      },
      permissions: {
        canCreate: "identity_providers.create",
        canUpdate: "identity_providers.update",
        canDelete: "identity_providers.delete",
      },
    }),
    [t, identityProviderRepository]
  );

  const router = useRouter();
  const configBase = getConfigBase();
  const handleTestConnection = (id: string) => testMutation.mutate(id);

  const config: CrudConfig<IdentityProviderListItem> = {
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
              <img src={item.iconUrl} alt={item.name} className="h-5 w-5 rounded object-contain" />
            ) : (
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.slug}</span>
            </div>
          </div>
        ),
      },
      {
        key: "protocol",
        label: t("identityProviders.protocol") || "Protocol",
        render: (_val: unknown, item: IdentityProviderListItem) => {
          const protocolConfig: Record<string, { label: string; className: string }> = {
            oidc: {
              label: "OIDC",
              className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            },
            oauth2: {
              label: "OAuth2",
              className:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
            },
            saml: {
              label: "SAML",
              className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
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
                className="gap-1 border-violet-200 bg-violet-50 text-xs text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            {item.enabledForUsers && (
              <Badge
                variant="outline"
                className="gap-1 border-sky-200 bg-sky-50 text-xs text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-400"
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
            className={`text-xs ${
              item.isActive
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
        render: (_val: unknown, item: IdentityProviderListItem) => (
          <span className="text-sm text-muted-foreground">
            {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "—"}
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
            className="h-7 gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleTestConnection(item.id);
            }}
            loading={testMutation.isPending && testMutation.variables === item.id}
          >
            {!(testMutation.isPending && testMutation.variables === item.id) && (
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
      handleDeleteFn: any
    ): CrudAction<IdentityProviderListItem>[] => [
      {
        label: tFn("common.edit") || "Edit",
        onClick: (item: IdentityProviderListItem) =>
          router.push(`/settings/identity-providers/${item.id}`),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: tFn("common.delete") || "Delete",
        onClick: (item: IdentityProviderListItem) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-red-600 hover:text-red-700",
        icon: <Trash2 className="h-4 w-4" />,
        confirmTitle: tFn("identityProviders.deleteConfirmTitle") || "Delete Identity Provider",
        confirmDescription:
          tFn("identityProviders.deleteConfirmDesc") ||
          "This will permanently remove this identity provider. Users linked via this provider will lose SSO access.",
        confirmVariant: "destructive" as const,
      },
    ],
  };

  return {
    vm,
    config,
    handleTestConnection,
    isTesting: testMutation.isPending,
    testingId: testMutation.variables,
    t,
  };
}
