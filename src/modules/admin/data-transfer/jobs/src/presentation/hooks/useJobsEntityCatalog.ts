"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { isTenantRequiredError } from "@core/data-exchange/domain/tenant-errors";
import { getEntityDisplayName } from "@core/data-exchange/presentation/utils/entity-display-names";
import type { DataExchangeEntitySummary } from "@core/data-exchange";
import { getDataTransferContainer } from "../../../../di";

/**
 * ViewModel helper hook that loads the live tenant Data Exchange entity catalog
 * via DI container repositories and provides dynamic entity lookup and display names.
 */
export function useJobsEntityCatalog() {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { activeTenantId } = useAdminContext();
  const container = getDataTransferContainer();
  const dataExchangeRepo = container.dataExchangeRepository;
  const entitiesRepo = container.entitiesRepository;

  const { data: catalogEntities = [], isLoading: isCatalogLoading } = useQuery<
    DataExchangeEntitySummary[]
  >({
    queryKey: ["data-transfer", "entity-catalog", activeTenantId ?? "no-tenant"],
    enabled: Boolean(activeTenantId),
    queryFn: async ({ signal }) => {
      if (dataExchangeRepo) {
        return dataExchangeRepo.listEntities(signal);
      }
      const entities = await entitiesRepo.getAll(signal);
      return entities.map((e) => ({
        entityKey: e.entityKey,
        owningModule: e.owningModule,
        displayNameEn: e.displayNameEn,
        displayNameAr: e.displayNameAr,
        descriptionEn: e.descriptionEn,
        descriptionAr: e.descriptionAr,
        supportsBulkAutoCreateLookup: e.supportsBulkAutoCreateLookup,
        supportsIdentityOnboardingModes: e.supportsIdentityOnboardingModes,
        supportedModes: e.supportedModes,
        parentEntityKeys: e.parentEntityKeys,
        remainingQuotaSlots: e.remainingQuotaSlots,
        quotaMaxLimit: e.quotaMaxLimit,
        isImportFeatureEnabled: e.isImportFeatureEnabled,
        isExportFeatureEnabled: e.isExportFeatureEnabled,
        canImport: e.canImport,
        canExport: e.canExport,
        relatedMultiSheetEntityKeys: e.relatedMultiSheetEntityKeys,
      }));
    },
    staleTime: 30_000,
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
  });

  const catalogMap = useMemo(() => {
    const map = new Map<string, DataExchangeEntitySummary>();
    for (const entry of catalogEntities) {
      if (entry.entityKey) {
        map.set(entry.entityKey.toLowerCase(), entry);
      }
    }
    return map;
  }, [catalogEntities]);

  const importableEntities = useMemo(
    () => catalogEntities.filter((e) => e.canImport && e.isImportFeatureEnabled),
    [catalogEntities]
  );

  const getCatalogEntry = useCallback(
    (entityKey: string): DataExchangeEntitySummary | undefined => {
      if (!entityKey) return undefined;
      return catalogMap.get(entityKey.toLowerCase());
    },
    [catalogMap]
  );

  const resolveEntityName = useCallback(
    (entityKey: string): string => {
      return getEntityDisplayName(entityKey, t, isAr, getCatalogEntry(entityKey));
    },
    [getCatalogEntry, isAr, t]
  );

  return {
    catalogEntities,
    importableEntities,
    isCatalogLoading,
    getCatalogEntry,
    resolveEntityName,
  };
}
