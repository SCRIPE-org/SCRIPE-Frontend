/**
 * Identity Providers List ViewModel
 *
 * Orchestrates the identity provider management page.
 * Uses useCrudViewModel for standard CRUD and additional
 * test-connection action.
 */
"use client";

import { useCallback } from "react";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";

export const identityProviderKeys = {
      all: ["identity-providers"] as const,
      list: (filters: Record<string, unknown>) =>
            [...identityProviderKeys.all, "list", filters] as const,
      detail: (id: string) => [...identityProviderKeys.all, "detail", id] as const,
};

export function useIdentityProvidersViewModel() {
      const { identityProviderRepository } = systemContainer;
      const { t } = useI18n();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      // ============ Core CRUD ViewModel ============
      const vm = useCrudViewModel<IdentityProviderListItem, any, any>(
            [...identityProviderKeys.all],
            {
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
                              description: t("identityProviders.createdDesc") || "Identity provider created successfully.",
                        });
                        return result as unknown as IdentityProviderListItem;
                  },
                  update: async (id: string, data: any) => {
                        await identityProviderRepository.update(id, data);
                        success({
                              title: t("identityProviders.updated") || "Provider Updated",
                              description: t("identityProviders.updatedDesc") || "Identity provider updated successfully.",
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
            },
      );

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
                        canCreate: "identity_providers:create",
                        canUpdate: "identity_providers:update",
                        canDelete: "identity_providers:delete",
                  },
            }),
            [t, identityProviderRepository],
      );

      return {
            vm,
            getConfigBase,
            handleTestConnection: (id: string) => testMutation.mutate(id),
            isTesting: testMutation.isPending,
            testingId: testMutation.variables,
            t,
      };
}
