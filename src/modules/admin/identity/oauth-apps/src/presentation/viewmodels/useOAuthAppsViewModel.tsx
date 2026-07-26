// FILE-EXCEPTION: file length
/**
 * OAuth Applications List ViewModel
 *
 * Orchestrates the OAuth application management page.
 * Uses useCrudViewModel for CRUD and a custom regenerate-secret mutation.
 */
"use client";

import { useCallback, useState } from "react";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { OAuthAppListItem } from "../../domain/entities/OAuthApp";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { AppWindow, KeyRound, Pencil, Trash2, Check, Copy } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { formatUtc } from "@core/common/utils";
import type { CrudAction } from "@core/crud/components/generic-crud-view";

/**
 * Exported constant defining parameters and fields for oauth app keys configurations.
 */
export const oauthAppKeys = {
  all: ["oauth-apps"] as const,
  list: (filters: Record<string, unknown>) => [...oauthAppKeys.all, "list", filters] as const,
  detail: (id: string) => [...oauthAppKeys.all, "detail", id] as const,
};

/**
 * React hook/ViewModel orchestrating state and data flows for o auth apps view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useOAuthAppsViewModel() {
  const { oauthAppRepository } = identityContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  // Track newly generated secret to show once
  const [generatedSecret, setGeneratedSecret] = useState<{
    clientId: string;
    secret: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ============ Core CRUD ViewModel ============
  const vm = useCrudViewModel<OAuthAppListItem, any, any>([...oauthAppKeys.all], {
    getAll: async (params) => {
      const res = await oauthAppRepository.getAll({
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
      const result = await oauthAppRepository.create(data);
      success({
        title: t("oauthApps.created"),
        description: t("oauthApps.createdDesc"),
      });
      return result as unknown as OAuthAppListItem;
    },
    update: async (id: string, data: any) => {
      await oauthAppRepository.update(id, data);
      success({
        title: t("oauthApps.updated"),
        description: t("oauthApps.updatedDesc"),
      });
      return {} as OAuthAppListItem;
    },
    delete: async (id: string) => {
      await oauthAppRepository.remove(id);
      success({
        title: t("oauthApps.deleted"),
        description: t("oauthApps.deletedDesc"),
      });
    },
  });

  // ============ Regenerate Secret Mutation ============
  const regenerateSecretMutation = useMutation({
    mutationFn: (id: string) => oauthAppRepository.regenerateSecret(id),
    onSuccess: (result) => {
      setGeneratedSecret({
        clientId: result.clientId,
        secret: result.newClientSecret,
      });
      queryClient.invalidateQueries({ queryKey: oauthAppKeys.all });
      success({
        title: t("oauthApps.secretRegenerated"),
        description: t("oauthApps.secretRegeneratedDesc"),
      });
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
    (): Partial<CrudConfig<OAuthAppListItem>> => ({
      createFields: [
        {
          name: "displayName",
          label: t("oauthApps.displayName"),
          type: "text" as const,
          placeholder: t("oauthApps.displayNamePlaceholder"),
          required: true,
        },
        {
          name: "clientType",
          label: t("oauthApps.clientType"),
          type: "select" as const,
          required: true,
          options: [
            { value: "confidential", label: t("oauthApps.confidential") },
            { value: "public", label: t("oauthApps.public") },
          ],
        },
        {
          name: "redirectUris",
          label: t("oauthApps.redirectUris"),
          type: "text" as const,
          placeholder: "https://app.example.com/callback",
          required: true,
        },
        {
          name: "allowedScopes",
          label: t("oauthApps.allowedScopes"),
          type: "text" as const,
          placeholder: "openid profile email",
        },
        {
          name: "allowedGrantTypes",
          label: t("oauthApps.allowedGrantTypes"),
          type: "text" as const,
          placeholder: "authorization_code refresh_token",
        },
        {
          name: "requirePkce",
          label: t("oauthApps.requirePkce"),
          type: "switch" as const,
        },
        {
          name: "requireConsent",
          label: t("oauthApps.requireConsent"),
          type: "switch" as const,
        },
        {
          name: "description",
          label: t("oauthApps.descriptionLabel"),
          type: "text" as const,
          placeholder: t("oauthApps.descriptionPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "displayName",
          label: t("oauthApps.displayName"),
          type: "text" as const,
        },
        {
          name: "redirectUris",
          label: t("oauthApps.redirectUris"),
          type: "text" as const,
        },
        {
          name: "allowedScopes",
          label: t("oauthApps.allowedScopes"),
          type: "text" as const,
        },
        {
          name: "allowedGrantTypes",
          label: t("oauthApps.allowedGrantTypes"),
          type: "text" as const,
        },
        {
          name: "requirePkce",
          label: t("oauthApps.requirePkce"),
          type: "switch" as const,
        },
        {
          name: "requireConsent",
          label: t("oauthApps.requireConsent"),
          type: "switch" as const,
        },
        {
          name: "description",
          label: t("oauthApps.descriptionLabel"),
          type: "text" as const,
        },
      ],
      createInitialValues: {
        displayName: "",
        clientType: "confidential",
        redirectUris: "",
        allowedScopes: "openid profile email roles",
        allowedGrantTypes: "authorization_code",
        requirePkce: true,
        requireConsent: true,
        description: "",
      },
      editInitialValues: (item: OAuthAppListItem) => ({
        id: item.id,
        displayName: item.displayName,
        allowedScopes: item.allowedScopes,
        allowedGrantTypes: item.allowedGrantTypes,
        requirePkce: item.requirePkce,
        description: item.description || "",
      }),
      getItemDisplayName: (item: OAuthAppListItem) => item.displayName,
      deleteService: async (id: string) => {
        await oauthAppRepository.remove(id);
      },
      permissions: {
        canCreate: "oauth_apps.create",
        canUpdate: "oauth_apps.update",
        canDelete: "oauth_apps.delete",
      },
    }),
    [t, oauthAppRepository]
  );

  // ============ List Grid Config ============
  const router = useRouter();
  const configBase = getConfigBase();
  const handleRegenerateSecret = (id: string) => regenerateSecretMutation.mutate(id);

  const config: CrudConfig<OAuthAppListItem> = {
    titleKey: "oauthApps.title",
    subtitleKey: "oauthApps.description",
    resource: "oauth_apps",
    columns: [
      {
        key: "displayName",
        label: t("oauthApps.displayName"),
        sortable: true,
        render: (_val: unknown, item: OAuthAppListItem) => (
          <div className="flex items-center gap-2">
            {item.logoUri ? (
              <img
                src={item.logoUri}
                alt={item.displayName}
                className="h-5 w-5 rounded-nx-sm object-contain"
              />
            ) : (
              <AppWindow className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-nx-ink">{item.displayName}</span>
              {item.description && (
                <span className="max-w-[200px] truncate text-xs text-nx-ink-2">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "clientId",
        label: t("oauthApps.clientId"),
        render: (_val: unknown, item: OAuthAppListItem) => (
          <div className="flex items-center gap-1.5">
            <code
              className="max-w-[140px] truncate rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-xs text-nx-ink-2"
              title={item.clientId}
            >
              {item.clientId}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`${t("oauthApps.copyClientId")} — ${item.displayName}`}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(item.clientId, `clientId-${item.id}`);
              }}
            >
              {copiedField === `clientId-${item.id}` ? (
                <Check className="h-3 w-3 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
              )}
            </Button>
          </div>
        ),
      },
      {
        key: "clientType",
        label: t("oauthApps.clientType"),
        render: (_val: unknown, item: OAuthAppListItem) => (
          <Badge variant="outline" className="font-mono text-xs">
            {item.clientType === "confidential"
              ? t("oauthApps.clientTypeConfidential")
              : t("oauthApps.clientTypePublic")}
          </Badge>
        ),
      },
      {
        key: "requirePkce",
        label: t("oauthApps.pkceLabel"),
        render: (_val: unknown, item: OAuthAppListItem) => (
          <Badge variant={item.requirePkce ? "success" : "secondary"} className="text-xs">
            {item.requirePkce ? t("common.enabled") : t("common.disabled")}
          </Badge>
        ),
      },
      {
        key: "isActive",
        label: t("common.status"),
        render: (_val: unknown, item: OAuthAppListItem) => (
          <Badge variant={item.isActive ? "success" : "secondary"} className="text-xs">
            {item.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (_val: unknown, item: OAuthAppListItem) => (
          <span className="text-sm text-nx-ink-2">
            {item.createdAt ? formatUtc(item.createdAt, "MMM d, yyyy") : "—"}
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
      handleDeleteFn: any
    ): CrudAction<OAuthAppListItem>[] => [
      {
        label: tFn("oauthApps.regenerateSecret"),
        onClick: (item: OAuthAppListItem) => handleRegenerateSecret(item.id),
        variant: "ghost" as const,
        icon: regenerateSecretMutation.isPending ? (
          <LoadingSpinner size="inline" showText={false} />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        ),
        requiredPermission: "oauth_apps.update",
        confirmTitle: tFn("oauthApps.regenerateConfirmTitle"),
        confirmDescription: tFn("oauthApps.regenerateConfirmDesc"),
        confirmVariant: "destructive" as const,
      },
      {
        label: tFn("common.edit"),
        onClick: (item: OAuthAppListItem) => router.push(`/settings/oauth-apps/${item.id}`),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: "oauth_apps.update",
      },
      {
        label: tFn("common.delete"),
        onClick: (item: OAuthAppListItem) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/90",
        icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
        requiredPermission: "oauth_apps.delete",
        confirmTitle: tFn("oauthApps.deleteConfirmTitle"),
        confirmDescription: tFn("oauthApps.deleteConfirmDesc"),
        confirmVariant: "destructive" as const,
      },
    ],
  };

  return {
    vm,
    config,
    handleRegenerateSecret,
    isRegenerating: regenerateSecretMutation.isPending,
    regeneratingId: regenerateSecretMutation.variables,
    generatedSecret,
    clearGeneratedSecret: () => setGeneratedSecret(null),
    t,
  };
}
