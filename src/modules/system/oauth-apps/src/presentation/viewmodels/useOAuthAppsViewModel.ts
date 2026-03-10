/**
 * OAuth Applications List ViewModel
 *
 * Orchestrates the OAuth application management page.
 * Uses useCrudViewModel for CRUD and a custom regenerate-secret mutation.
 */
"use client";

import { useCallback, useState } from "react";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { OAuthAppListItem } from "../../domain/entities/OAuthApp";

export const oauthAppKeys = {
      all: ["oauth-apps"] as const,
      list: (filters: Record<string, unknown>) =>
            [...oauthAppKeys.all, "list", filters] as const,
      detail: (id: string) => [...oauthAppKeys.all, "detail", id] as const,
};

export function useOAuthAppsViewModel() {
      const { oauthAppRepository } = systemContainer;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      // Track newly generated secret to show once
      const [generatedSecret, setGeneratedSecret] = useState<{
            clientId: string;
            secret: string;
      } | null>(null);

      // ============ Core CRUD ViewModel ============
      const vm = useCrudViewModel<OAuthAppListItem, any, any>(
            [...oauthAppKeys.all],
            {
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
                              title: t("oauthApps.created") || "Application Created",
                              description: t("oauthApps.createdDesc") || "OAuth application created successfully.",
                        });
                        return result as unknown as OAuthAppListItem;
                  },
                  update: async (id: string, data: any) => {
                        await oauthAppRepository.update(id, data);
                        success({
                              title: t("oauthApps.updated") || "Application Updated",
                              description: t("oauthApps.updatedDesc") || "OAuth application updated successfully.",
                        });
                        return {} as OAuthAppListItem;
                  },
                  delete: async (id: string) => {
                        await oauthAppRepository.remove(id);
                        success({
                              title: t("oauthApps.deleted") || "Application Deleted",
                              description: t("oauthApps.deletedDesc") || "OAuth application deleted.",
                        });
                  },
            },
      );

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
                        title: t("oauthApps.secretRegenerated") || "Secret Regenerated",
                        description: t("oauthApps.secretRegeneratedDesc") || "Copy the new secret now — it won't be shown again.",
                  });
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
            (): Partial<CrudConfig<OAuthAppListItem>> => ({
                  createFields: [
                        {
                              name: "displayName",
                              label: t("oauthApps.displayName") || "Application Name",
                              type: "text" as const,
                              placeholder: t("oauthApps.displayNamePlaceholder") || "e.g. Mobile App",
                              required: true,
                        },
                        {
                              name: "clientType",
                              label: t("oauthApps.clientType") || "Client Type",
                              type: "select" as const,
                              required: true,
                              options: [
                                    { value: "confidential", label: "Confidential (Server-Side)" },
                                    { value: "public", label: "Public (SPA / Mobile)" },
                              ],
                        },
                        {
                              name: "redirectUris",
                              label: t("oauthApps.redirectUris") || "Redirect URIs",
                              type: "text" as const,
                              placeholder: "https://app.example.com/callback",
                              required: true,
                        },
                        {
                              name: "allowedScopes",
                              label: t("oauthApps.allowedScopes") || "Allowed Scopes",
                              type: "text" as const,
                              placeholder: "openid profile email",
                        },
                        {
                              name: "allowedGrantTypes",
                              label: t("oauthApps.allowedGrantTypes") || "Grant Types",
                              type: "text" as const,
                              placeholder: "authorization_code refresh_token",
                        },
                        {
                              name: "requirePkce",
                              label: t("oauthApps.requirePkce") || "Require PKCE",
                              type: "switch" as const,
                        },
                        {
                              name: "requireConsent",
                              label: t("oauthApps.requireConsent") || "Require Consent Screen",
                              type: "switch" as const,
                        },
                        {
                              name: "description",
                              label: t("oauthApps.descriptionLabel") || "Description",
                              type: "text" as const,
                              placeholder: t("oauthApps.descriptionPlaceholder") || "What does this app do?",
                        },
                  ],
                  editFields: [
                        {
                              name: "displayName",
                              label: t("oauthApps.displayName") || "Application Name",
                              type: "text" as const,
                        },
                        {
                              name: "redirectUris",
                              label: t("oauthApps.redirectUris") || "Redirect URIs",
                              type: "text" as const,
                        },
                        {
                              name: "allowedScopes",
                              label: t("oauthApps.allowedScopes") || "Allowed Scopes",
                              type: "text" as const,
                        },
                        {
                              name: "allowedGrantTypes",
                              label: t("oauthApps.allowedGrantTypes") || "Grant Types",
                              type: "text" as const,
                        },
                        {
                              name: "requirePkce",
                              label: t("oauthApps.requirePkce") || "Require PKCE",
                              type: "switch" as const,
                        },
                        {
                              name: "requireConsent",
                              label: t("oauthApps.requireConsent") || "Require Consent Screen",
                              type: "switch" as const,
                        },
                        {
                              name: "description",
                              label: t("oauthApps.descriptionLabel") || "Description",
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
            [t, oauthAppRepository],
      );

      return {
            vm,
            getConfigBase,
            handleRegenerateSecret: (id: string) => regenerateSecretMutation.mutate(id),
            isRegenerating: regenerateSecretMutation.isPending,
            regeneratingId: regenerateSecretMutation.variables,
            generatedSecret,
            clearGeneratedSecret: () => setGeneratedSecret(null),
            t,
      };
}
