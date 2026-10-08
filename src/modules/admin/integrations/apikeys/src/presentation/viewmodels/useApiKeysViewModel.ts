/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Keys List ViewModel
 *
 * Orchestrates state, mutations, and actions for API Key management.
 * Uses useCrudViewModel for list fetching and revocation.
 */
"use client";

import { useCallback, useState } from "react";
import { integrationsContainer } from "@modules/integrations/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermissionCatalog } from "@core/hooks/use-permission-catalog";
import { resolveBilingualLabel } from "@core/common/utils";
import { ApiKey, CreateApiKeyRequest } from "../../domain/entities/ApiKey";

// Query keys for caching
/**
 * Documentation for module export
 */
export const apiKeyKeys = {
  all: ["apikeys"] as const,
  list: (filters: Record<string, unknown>) => ["apikeys", "list", filters] as const,
};

/**
 * Documentation for module export
 */
export function useApiKeysViewModel() {
  const { apiKeyRepository } = integrationsContainer;
  const { t, language } = useI18n();
  const { success, error: toastError } = useEnhancedToast();

  // Query permissions based on active tenant scope via core catalog hook
  const { data: permissions = [] } = usePermissionCatalog();

  // Plaintext key storage (shown once to user upon creation)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Core CRUD hook
  const vm = useCrudViewModel<ApiKey, any, any>([...apiKeyKeys.all], {
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
          rateLimitPerMinute: data.rateLimitPerMinute
            ? parseInt(data.rateLimitPerMinute, 10)
            : null,
          monthlyQuota: data.monthlyQuota ? parseInt(data.monthlyQuota, 10) : null,
          description: data.description || "",
          ipWhitelist: data.ipWhitelist || null,
        };
        const result = await apiKeyRepository.create(requestBody);
        // The plaintext secret is shown exactly once and can never be retrieved
        // again, so this fires unconditionally regardless of what happens next.
        setGeneratedKey(result.plainTextKey);
        // No manual success() toast here on purpose -- deferSuccessEffects (below)
        // holds it until GenericCrudView confirms the custom-field save (if any)
        // also succeeded; firing it here unconditionally would defeat that. The
        // GeneratedKeyDialog above already gives the user clear, immediate
        // confirmation that the key itself was created.
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
          title: t("common.error"),
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
          title: t("apikeys.revoked"),
          description: t("apikeys.revokedDesc"),
        });
      } catch (err: any) {
        toastError({
          title: t("common.error"),
          description: err.message || "Failed to revoke API Key",
        });
        throw err;
      }
    },
  }, { deferSuccessEffects: true });

  // Configuration for GenericCrudView
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<ApiKey>> => ({
      createFields: [
        {
          name: "name",
          label: t("apikeys.name"),
          type: "text" as const,
          placeholder: t("apikeys.namePlaceholder"),
          required: true,
        },
        {
          name: "scopes",
          label: t("apikeys.scopes"),
          type: "multi-select" as const,
          required: true,
          placeholder: t("apikeys.scopesPlaceholder"),
          searchPlaceholder: t("apikeys.scopesSearch"),
          searchType: "client" as const,
          description: t("apikeys.scopesDescription"),
          options: permissions.map((p) => ({
            label: `${resolveBilingualLabel(p.nameEn ?? p.displayNameEn ?? "", p.nameAr ?? p.displayNameAr ?? "", language) || p.code} (${p.code})`,
            value: p.code,
          })),
        },
        {
          name: "expiryDays",
          label: t("apikeys.expiration"),
          type: "select" as const,
          placeholder: t("apikeys.expirationPlaceholder"),
          required: false,
          options: [
            { label: t("apikeys.expirations.never"), value: "" },
            { label: t("apikeys.expirations.days30"), value: "30" },
            { label: t("apikeys.expirations.days90"), value: "90" },
            { label: t("apikeys.expirations.days365"), value: "365" },
          ],
        },
        {
          name: "description",
          label: t("apikeys.settings.desc"),
          type: "textarea" as const,
          placeholder: t("apikeys.settings.descPlaceholder"),
          required: false,
        },
        {
          name: "rateLimitPerMinute",
          label: t("apikeys.settings.rateLimit"),
          type: "number" as const,
          placeholder: "e.g. 100",
          required: false,
        },
        {
          name: "monthlyQuota",
          label: t("apikeys.settings.quota"),
          type: "number" as const,
          placeholder: "e.g. 50000 (leave blank for unlimited)",
          required: false,
        },
        {
          name: "ipWhitelist",
          label: t("apikeys.settings.whitelist"),
          type: "text" as const,
          placeholder: "e.g. 192.168.1.1, 10.0.0.0/24",
          required: false,
        },
      ],
      createInitialValues: {
        name: "",
        scopes: [],
        expiryDays: null,
        description: "",
        rateLimitPerMinute: null,
        monthlyQuota: null,
        ipWhitelist: "",
      },
      getItemDisplayName: (item: ApiKey) => item.name || item.prefix,
      deleteService: async (id: string) => {
        await apiKeyRepository.revoke(id);
      },
      permissions: {
        canCreate: "apikeys.create",
        canDelete: "apikeys.delete",
      },
    }),
    [t, language, apiKeyRepository, permissions]
  );

  return {
    vm,
    getConfigBase,
    generatedKey,
    setGeneratedKey,
    t,
  };
}
