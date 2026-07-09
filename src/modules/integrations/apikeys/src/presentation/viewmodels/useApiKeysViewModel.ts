/**
 * API Keys List ViewModel
 *
 * Orchestrates state, mutations, and actions for API Key management.
 * Uses useCrudViewModel for list fetching and revocation.
 */
"use client";

import { useCallback, useState } from "react";
import { integrationsContainer } from "@modules/integrations/di";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { ApiKey, CreateApiKeyRequest } from "../../domain/entities/ApiKey";
import { useEnhancedToast } from "@/core/hooks/use-enhanced-toast";

// Query keys for caching
export const apiKeyKeys = {
  all: ["apikeys"] as const,
  list: (filters: Record<string, unknown>) => ["apikeys", "list", filters] as const,
};

export function useApiKeysViewModel() {
  const { apiKeyRepository } = integrationsContainer;
  const { permissionRepository } = identityContainer;
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { success, error: toastError } = useEnhancedToast();

  // ── Tenant Context Resolution for permission scopes picker ────────────────
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { currentTenant, isInTenantWorld } = useTenantContext();
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;

  // Query permissions based on active tenant scope
  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions", "scopes-picker", effectiveTenantId],
    queryFn: () => {
      if (isSystemCatalogMode || !effectiveTenantId) {
        return permissionRepository.getAll();
      }
      return permissionRepository.getForTenant(effectiveTenantId);
    },
    staleTime: 10 * 60 * 1000, // 10 min cache - permissions rarely change
    retry: 1,
  });

  // Plaintext key storage (shown once to user upon creation)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Core CRUD hook
  const vm = useCrudViewModel<ApiKey, any, any>(
    [...apiKeyKeys.all],
    {
      getAll: async (params) => {
        const res = await apiKeyRepository.getAll({
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
        try {
          const requestBody: CreateApiKeyRequest = {
            ...data,
            scopes: Array.isArray(data.scopes) ? data.scopes.join(",") : data.scopes,
          };
          const result = await apiKeyRepository.create(requestBody);
          setGeneratedKey(result.plainTextKey);
          success({
            title: t("apikeys.created") || "API Key Generated",
            description: t("apikeys.createdDesc") || "API key created successfully.",
          });
          return new ApiKey({
            id: result.id,
            name: data.name,
            prefix: result.plainTextKey.substring(0, 16),
            scopes: requestBody.scopes,
            expiresAt: null,
            revokedAt: null,
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        } catch (err: any) {
          toastError({
            title: t("common.error") || "Error",
            description: err.message || "Failed to generate API Key",
          });
          throw err;
        }
      },
      update: async () => {
        return {} as ApiKey;
      },
      delete: async (id: string) => {
        try {
          await apiKeyRepository.revoke(id);
          success({
            title: t("apikeys.revoked") || "API Key Revoked",
            description: t("apikeys.revokedDesc") || "API key revoked successfully.",
          });
        } catch (err: any) {
          toastError({
            title: t("common.error") || "Error",
            description: err.message || "Failed to revoke API Key",
          });
          throw err;
        }
      },
    }
  );

  // Configuration for GenericCrudView
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<ApiKey>> => ({
      createFields: [
        {
          name: "name",
          label: t("apikeys.name") || "Key Name",
          type: "text" as const,
          placeholder: t("apikeys.namePlaceholder") || "e.g. CI/CD integration key",
          required: true,
        },
        {
          name: "scopes",
          label: t("apikeys.scopes") || "Permissions / Scopes",
          type: "multi-select" as const,
          required: true,
          placeholder: t("apikeys.scopesPlaceholder") || "Select permissions…",
          searchPlaceholder: t("apikeys.scopesSearch") || "Search permissions…",
          searchType: "client" as const,
          description:
            t("apikeys.scopesDescription") ||
            "Each permission is shown as 'Name (code)'. Select what this key can access.",
          options: permissions.map((p) => ({
            label: `${(isAr ? p.nameAr : p.nameEn) || p.code} (${p.code})`,
            value: p.code,
          })),
        },
        {
          name: "expiryDays",
          label: t("apikeys.expiration") || "Expiration",
          type: "select" as const,
          placeholder: t("apikeys.expirationPlaceholder") || "Select expiration",
          required: false,
          options: [
            { label: t("apikeys.expirations.never") || "Never (No Expiration)", value: "" },
            { label: t("apikeys.expirations.days30") || "30 Days", value: "30" },
            { label: t("apikeys.expirations.days90") || "90 Days", value: "90" },
            { label: t("apikeys.expirations.days365") || "1 Year", value: "365" },
          ],
        },
      ],
      createInitialValues: {
        name: "",
        scopes: [],
        expiryDays: null,
      },
      getItemDisplayName: (item: ApiKey) => item.name || item.prefix,
      deleteService: async (id: string) => {
        await apiKeyRepository.revoke(id);
      },
      permissions: {
        canCreate: "apikeys:create",
        canDelete: "apikeys:delete",
      },
    }),
    [t, isAr, apiKeyRepository, permissions]
  );

  return {
    vm,
    getConfigBase,
    generatedKey,
    setGeneratedKey,
    t,
  };
}
