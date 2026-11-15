"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { isTenantRequiredError } from "@core/data-exchange/domain/tenant-errors";
import { getEntityDisplayName } from "@core/data-exchange/presentation/utils/entity-display-names";
import type { DataExchangeEntitySummary } from "@core/data-exchange";
import { getDataTransferContainer } from "../../../../di";

/** Localized entity filter option constructed from live catalog + observed presets. */
export interface PresetEntityFilterOption {
  entityKey: string;
  label: string;
}

/**
 * Builds deduplicated sorted entity filter options from the union of live tenant catalog
 * entities and observed preset entityKeys (never relying on hardcoded lists).
 */
export function buildPresetEntityFilterOptions(
  catalogEntities: DataExchangeEntitySummary[],
  observedPresetKeys: string[],
  resolveName: (entityKey: string) => string,
  locale: string
): PresetEntityFilterOption[] {
  const byLower = new Map<string, string>();
  for (const entity of catalogEntities) {
    if (entity.entityKey) {
      byLower.set(entity.entityKey.toLowerCase(), entity.entityKey);
    }
  }
  for (const observedKey of observedPresetKeys) {
    if (observedKey && !byLower.has(observedKey.toLowerCase())) {
      byLower.set(observedKey.toLowerCase(), observedKey);
    }
  }

  return Array.from(byLower.values())
    .map((entityKey) => ({
      entityKey,
      label: resolveName(entityKey),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale === "ar" ? "ar" : "en"));
}

/**
 * ViewModel helper hook loading the live Data Exchange entity catalog via DI container
 * and resolving dynamic entity display names for Presets.
 */
export function usePresetsEntityCatalog() {
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
