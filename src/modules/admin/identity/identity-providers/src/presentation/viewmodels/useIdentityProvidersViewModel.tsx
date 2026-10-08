/* eslint-disable @typescript-eslint/no-explicit-any, unused-imports/no-unused-vars */
// FILE-EXCEPTION: file length
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
import { formatUtc } from "@core/common/utils";
import Image from "next/image";

/**
 * Exported constant defining parameters and fields for identity provider keys configurations.
 */
export const identityProviderKeys = {
  all: ["identity-providers"] as const,
  list: (filters: Record<string, unknown>) =>
    [...identityProviderKeys.all, "list", filters] as const,
  detail: (id: string) => [...identityProviderKeys.all, "detail", id] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for identity providers view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
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
        title: t("identityProviders.created"),
        description: t("identityProviders.createdDesc"),
      });
      return result as unknown as IdentityProviderListItem;
    },
    update: async (id: string, data: any) => {
      await identityProviderRepository.update(id, data);
      success({
        title: t("identityProviders.updated"),
        description: t("identityProviders.updatedDesc"),
      });
      return {} as IdentityProviderListItem;
    },
    delete: async (id: string) => {
      await identityProviderRepository.remove(id);
      success({
        title: t("identityProviders.deleted"),
        description: t("identityProviders.deletedDesc"),
      });
    },
  });

  // ============ Test Connection Mutation ============
  const testMutation = useMutation({
    mutationFn: (id: string) => identityProviderRepository.testConnection(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        success({
          title: t("identityProviders.testSuccess"),
          description: result.message || t("identityProviders.testSuccess"),
        });
      } else {
        toastError({
          title: t("identityProviders.testFailed"),
          description: result.message || t("identityProviders.testFailed"),
        });
      }
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error"),
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
          label: t("identityProviders.name"),
          type: "text" as const,
          placeholder: t("identityProviders.namePlaceholder"),
          required: true,
        },
        {
          name: "slug",
          label: t("identityProviders.slug"),
          type: "text" as const,
          placeholder: t("identityProviders.slugPlaceholder"),
          required: true,
        },
        {
          name: "protocol",
          label: t("identityProviders.protocol"),
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
          label: t("identityProviders.authority"),
          type: "text" as const,
          placeholder: "https://login.microsoftonline.com/{tenant}/v2.0",
        },
        {
          name: "clientId",
          label: t("identityProviders.clientId"),
          type: "text" as const,
          placeholder: t("identityProviders.clientIdPlaceholder"),
        },
        {
          name: "clientSecret",
          label: t("identityProviders.clientSecret"),
          type: "text" as const,
          placeholder: t("identityProviders.clientSecretPlaceholder"),
        },
        {
          name: "scopes",
          label: t("identityProviders.scopes"),
          type: "text" as const,
          placeholder: "openid profile email",
        },
        {
          name: "enabledForAdmins",
          label: t("identityProviders.enabledForAdmins"),
          type: "switch" as const,
        },
        {
          name: "enabledForUsers",
          label: t("identityProviders.enabledForUsers"),
          type: "switch" as const,
        },
        {
          name: "buttonColor",
          label: t("identityProviders.buttonColor"),
          type: "text" as const,
          placeholder: "#0078D4",
        },
        {
          name: "buttonLabel",
          label: t("identityProviders.buttonLabel"),
          type: "text" as const,
          placeholder: t("identityProviders.buttonLabelPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("identityProviders.name"),
          type: "text" as const,
        },
        {
          name: "slug",
          label: t("identityProviders.slug"),
          type: "text" as const,
        },
        {
          name: "authority",
          label: t("identityProviders.authority"),
          type: "text" as const,
        },
        {
          name: "clientId",
          label: t("identityProviders.clientId"),
          type: "text" as const,
        },
        {
          name: "clientSecret",
          label: t("identityProviders.clientSecret"),
          type: "text" as const,
        },
        {
          name: "scopes",
          label: t("identityProviders.scopes"),
          type: "text" as const,
        },
        {
          name: "enabledForAdmins",
          label: t("identityProviders.enabledForAdmins"),
          type: "switch" as const,
        },
        {
          name: "enabledForUsers",
          label: t("identityProviders.enabledForUsers"),
          type: "switch" as const,
        },
        {
          name: "buttonColor",
          label: t("identityProviders.buttonColor"),
          type: "text" as const,
        },
        {
          name: "buttonLabel",
          label: t("identityProviders.buttonLabel"),
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
        label: t("identityProviders.name"),
        sortable: true,
        render: (_val: unknown, item: IdentityProviderListItem) => (
          <div className="flex items-center gap-2">
            {item.iconUrl ? (
              <Image src={item.iconUrl} alt={item.name} width={20} height={20} unoptimized className="h-5 w-5 rounded object-contain" />
            ) : (
              <Fingerprint className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="font-mono text-xs text-nx-ink-3">{item.slug}</span>
            </div>
          </div>
        ),
      },
      {
        key: "protocol",
        label: t("identityProviders.protocol"),
        render: (_val: unknown, item: IdentityProviderListItem) => {
          const protocolConfig: Record<string, { label: string; className: string }> = {
            oidc: {
              label: "OIDC",
              className: "bg-info/10 text-info",
            },
            oauth2: {
              label: "OAuth2",
              className: "bg-success/10 text-success",
            },
            saml: {
              label: "SAML",
              className: "bg-warning/10 text-warning",
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
        label: t("identityProviders.scope"),
        render: (_val: unknown, item: IdentityProviderListItem) => (
          <div className="flex items-center gap-1.5">
            {item.enabledForAdmins && (
              <Badge
                variant="outline"
                className="gap-1 border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-xs text-nx-accent"
              >
                <Shield className="h-3 w-3" aria-hidden="true" />
                {t("identityProviders.badgeAdmin")}
              </Badge>
            )}
            {item.enabledForUsers && (
              <Badge
                variant="outline"
                className="gap-1 border-info/30 bg-info/10 text-xs text-info"
              >
                <Users className="h-3 w-3" aria-hidden="true" />
                {t("identityProviders.badgeUser")}
              </Badge>
            )}
            {!item.enabledForAdmins && !item.enabledForUsers && (
              <span className="text-xs text-nx-ink-3">{t("identityProviders.scopeNone")}</span>
            )}
          </div>
        ),
      },
      {
        key: "isActive",
        label: t("common.status"),
        render: (_val: unknown, item: IdentityProviderListItem) => (
          <Badge
            variant={item.isActive ? "default" : "secondary"}
            className={`text-xs ${
              item.isActive ? "bg-success/10 text-success" : "bg-nx-raised text-nx-ink-3"
            }`}
          >
            {item.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (_val: unknown, item: IdentityProviderListItem) => (
          <span className="text-sm text-nx-ink-3">
            {item.createdAt ? formatUtc(item.createdAt, "MMM d, yyyy") : "—"}
          </span>
        ),
      },
      {
        key: "test",
        label: t("identityProviders.testConnection"),
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
              <Zap className="h-3 w-3" aria-hidden="true" />
            )}
            {t("identityProviders.test")}
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
        label: tFn("common.edit"),
        onClick: (item: IdentityProviderListItem) =>
          router.push(`/settings/identity-providers/${item.id}`),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: IdentityProviderListItem) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/90",
        icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
        confirmTitle: tFn("identityProviders.deleteConfirmTitle"),
        confirmDescription: tFn("identityProviders.deleteConfirmDesc"),
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
