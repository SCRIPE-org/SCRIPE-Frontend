"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { getDataTransferContainer } from "../../../../di";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";

/**
 * ViewModel hook for the Data Transfer Entities catalog view.
 */
export function useEntitiesViewModel() {
  const { language, t } = useI18n();
  const repo = getDataTransferContainer().entitiesRepository;

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [activeStudioEntity, setActiveStudioEntity] = useState<string | null>(null);
  const [activeExportEntity, setActiveExportEntity] = useState<string | null>(null);
  const [downloadingTemplateEntity, setDownloadingTemplateEntity] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["data-transfer", "entities"],
    queryFn: ({ signal }) => repo.getAll(signal),
    staleTime: 60_000,
  });

  const entities = useMemo(() => query.data ?? [], [query.data]);

  const availableModules = useMemo(() => {
    const set = new Set<string>();
    for (const e of entities) {
      if (e.owningModule) set.add(e.owningModule);
    }
    return Array.from(set).sort();
  }, [entities]);

  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entities.filter((e) => {
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
  }, [entities, search, selectedModule, language]);

  const kpis = useMemo(() => {
    const total = entities.length;
    const importable = entities.filter((e) => e.canImport && e.isImportFeatureEnabled).length;
    const exportable = entities.filter((e) => e.canExport && e.isExportFeatureEnabled).length;
    const quotaConstrained = entities.filter(
      (e) => typeof e.remainingQuotaSlots === "number"
    ).length;
    return { total, importable, exportable, quotaConstrained };
  }, [entities]);

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
        // Silently handled or surface via caller
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
    entities: filteredEntities,
    availableModules,
    search,
    setSearch,
    selectedModule,
    setSelectedModule,
    kpis,
    downloadTemplate,
    downloadingTemplateEntity,
    activeStudioEntity,
    setActiveStudioEntity,
    activeExportEntity,
    setActiveExportEntity,
    refetch: query.refetch,
  };
}
