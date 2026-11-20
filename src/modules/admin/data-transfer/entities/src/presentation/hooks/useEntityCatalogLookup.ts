"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { getEntityDisplayName, isTenantRequiredError } from "@core/data-exchange";
import { getDataTransferContainer } from "../../../../di";
import { DataExchangeEntityMapper } from "../../data/mappers/DataExchangeEntityMapper";
import type {
  DataExchangeEntity,
  DataExchangeEntitySummaryView,
} from "../../domain/entities/DataExchangeEntity";

/** Localized entity filter option constructed from live catalog + observed entity keys. */
export interface EntityFilterOption {
  entityKey: string;
  label: string;
}

/**
 * Builds deduplicated sorted entity filter options from the union of live tenant catalog
 * entities and observed entity keys (never relying on hardcoded entity lists).
 */
export function buildEntityFilterOptions(
  catalogEntities: DataExchangeEntitySummaryView[],
  observedKeys: string[],
  resolveName: (entityKey: string) => string,
  locale: string
): EntityFilterOption[] {
  const byLower = new Map<string, string>();
  for (const entity of catalogEntities) {
    if (entity.entityKey) {
      byLower.set(entity.entityKey.toLowerCase(), entity.entityKey);
    }
  }
  for (const observedKey of observedKeys) {
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
 * Consolidated ViewModel helper hook loading the live tenant Data Exchange entity catalog
 * via DI container repositories and providing dynamic entity lookup and localized display names.
 */
export function useEntityCatalogLookup() {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { activeTenantId } = useAdminContext();
  const container = getDataTransferContainer();
  const dataExchangeRepo = container.dataExchangeRepository;
  const entitiesRepo = container.entitiesRepository;

  const { data: catalogEntities = [], isLoading: isCatalogLoading } = useQuery<
    DataExchangeEntity[]
  >({
    queryKey: ["data-transfer", "entity-catalog", activeTenantId ?? "no-tenant"],
    enabled: Boolean(activeTenantId),
    queryFn: async ({ signal }) => {
      if (dataExchangeRepo?.listEntities) {
        const dtos = await dataExchangeRepo.listEntities(signal);
        return (dtos ?? []).map((dto) => DataExchangeEntityMapper.toDomain(dto));
      }
      return entitiesRepo.getAll(signal);
    },
    staleTime: 30_000,
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
  });

  const catalogMap = useMemo(() => {
    const map = new Map<string, DataExchangeEntity>();
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
    (entityKey: string): DataExchangeEntity | undefined => {
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
