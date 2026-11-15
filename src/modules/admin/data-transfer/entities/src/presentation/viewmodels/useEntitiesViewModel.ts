"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { isTenantRequiredError } from "@core/data-exchange/domain/tenant-errors";
import { getDataTransferContainer } from "../../../../di";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";

/**
 * ViewModel hook for the Data Transfer Entities catalog view.
 * Supports filtering, searching, client-side pagination, and action dispatch.
 */
export function useEntitiesViewModel() {
  const { language, t } = useI18n();
  const { activeTenantId } = useAdminContext();
  const repo = getDataTransferContainer().entitiesRepository;

  const [search, setSearchState] = useState("");
  const [selectedModule, setSelectedModuleState] = useState<string>("all");
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [activeStudioEntity, setActiveStudioEntity] = useState<string | null>(null);
  const [activeExportEntity, setActiveExportEntity] = useState<string | null>(null);
  const [activeMultiSheetKeys, setActiveMultiSheetKeys] = useState<string[] | null>(null);
  const [downloadingTemplateEntity, setDownloadingTemplateEntity] = useState<string | null>(null);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPageState(1);
  }, []);

  const setSelectedModule = useCallback((val: string) => {
    setSelectedModuleState(val);
    setPageState(1);
  }, []);

  const setPage = useCallback((nextPage: number) => {
    const valid = Number.isFinite(nextPage) && nextPage >= 1 ? Math.floor(nextPage) : 1;
    setPageState(valid);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    const valid = Number.isFinite(nextSize) && nextSize > 0 ? Math.floor(nextSize) : 10;
    setPageSizeState(valid);
    setPageState(1);
  }, []);

  const query = useQuery({
    queryKey: ["data-transfer", "entities", activeTenantId ?? "no-tenant"],
    queryFn: ({ signal }) => repo.getAll(signal),
    enabled: Boolean(activeTenantId),
    staleTime: 60_000,
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
  });

  const entities = query.data ?? [];
  const isTenantRequired = isTenantRequiredError(query.error);

  const moduleSet = new Set<string>();
  for (const e of entities) {
    if (e.owningModule) moduleSet.add(e.owningModule);
  }
  const availableModules = Array.from(moduleSet).sort();

  const q = search.trim().toLowerCase();
  const filteredEntities = entities.filter((e) => {
    if (selectedModule !== "all" && e.owningModule !== selectedModule) {
      return false;
    }
    if (!q) return true;
    const name = language === "ar" ? e.displayNameAr : e.displayNameEn;
    return (
      e.entityKey.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      e.owningModule.toLowerCase().includes(q)
    );
  });

  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 10);
  const totalCount = Number.isFinite(filteredEntities.length)
    ? Math.max(0, filteredEntities.length)
    : 0;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pagesCount);

  const start = (safePage - 1) * safePageSize;
  const pagedEntities = filteredEntities.slice(start, start + safePageSize);

  const kpis = {
    total: entities.length,
    importable: entities.filter((e) => e.canImport && e.isImportFeatureEnabled).length,
    exportable: entities.filter((e) => e.canExport && e.isExportFeatureEnabled).length,
    quotaConstrained: entities.filter((e) => typeof e.remainingQuotaSlots === "number").length,
  };

  const downloadTemplate = useCallback(
    async (entity: DataExchangeEntity) => {
      setDownloadingTemplateEntity(entity.entityKey);
      try {
        const blob = await repo.downloadTemplate({
          entityKey: entity.entityKey,
          format: "xlsx",
          locale: language,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entity.entityKey}-template.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch {
        // Handled silently
      } finally {
        setDownloadingTemplateEntity(null);
      }
    },
    [language, repo]
  );

  return {
    t,
    language,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isTenantRequired,
    entities: pagedEntities,
    allFilteredEntities: filteredEntities,
    availableModules,
    search,
    setSearch,
    selectedModule,
    setSelectedModule,
    page: safePage,
    pageNumber: safePage,
    setPage,
    setPageNumber: setPage,
    pageSize: safePageSize,
    setPageSize,
    totalCount,
    pagesCount,
    totalPages: pagesCount,
    pagination: {
      page: safePage,
      currentPage: safePage,
      pageNumber: safePage,
      pageSize: safePageSize,
      itemsCount: totalCount,
      totalCount,
      pagesCount,
      totalPages: pagesCount,
    },
    kpis,
    downloadTemplate,
    downloadingTemplateEntity,
    activeStudioEntity,
    setActiveStudioEntity,
    activeExportEntity,
    setActiveExportEntity,
    activeMultiSheetKeys,
    setActiveMultiSheetKeys,
    refetch: query.refetch,
  };
}
