"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "../../../../di";
import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  ResourceBlock,
  ResourceBlockKind,
  SaveAvailabilityCalendar,
  SaveResourceBlock,
} from "../../domain/entities/Availability";

const PAGE_SIZE = 100;

export function useAvailabilityViewModel() {
  const { schedulableResourceRepository, availabilityRepository } = getVenueContainer();
  const [resources, setResources] = useState<
    Awaited<ReturnType<typeof schedulableResourceRepository.getAll>>["items"]
  >([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);
  const [searchResult, setSearchResult] = useState<AvailabilitySearchResult | null>(null);
  const [blackouts, setBlackouts] = useState<ResourceBlock[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<ResourceBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchableResources = useMemo(
    () => resources.filter((resource) => !resource.isComposite),
    [resources]
  );
  const selectedResource = searchableResources.find((resource) => resource.id === selectedResourceId);

  const loadResources = useCallback(async () => {
    const result = await schedulableResourceRepository.getAll({ page: 1, pageSize: PAGE_SIZE });
    setResources(result.items);
    const firstLeaf = result.items.find((resource) => !resource.isComposite);
    setSelectedResourceId((current) => current || firstLeaf?.id || "");
  }, [schedulableResourceRepository]);

  const loadCalendar = useCallback(async () => {
    if (!selectedResourceId) {
      setCalendar(null);
      return;
    }
    setCalendar(await availabilityRepository.getCurrentCalendar(selectedResourceId));
  }, [availabilityRepository, selectedResourceId]);

  const loadBlocks = useCallback(async () => {
    if (!selectedResourceId) {
      setBlackouts([]);
      setMaintenanceBlocks([]);
      return;
    }
    const [loadedBlackouts, loadedMaintenance] = await Promise.all([
      availabilityRepository.getBlocks("blackout", selectedResourceId),
      availabilityRepository.getBlocks("maintenance", selectedResourceId),
    ]);
    setBlackouts(loadedBlackouts);
    setMaintenanceBlocks(loadedMaintenance);
  }, [availabilityRepository, selectedResourceId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadResources();
      await Promise.all([loadCalendar(), loadBlocks()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("availability-load-failed"));
    } finally {
      setLoading(false);
    }
  }, [loadBlocks, loadCalendar, loadResources]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadResources()
        .catch((caught) =>
          setError(caught instanceof Error ? caught : new Error("resource-load-failed"))
        )
        .finally(() => setLoading(false));
    });
  }, [loadResources]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setSearchResult(null);
      void Promise.all([loadCalendar(), loadBlocks()]).catch((caught) =>
        setError(caught instanceof Error ? caught : new Error("availability-load-failed"))
      );
    });
  }, [loadBlocks, loadCalendar]);

  const saveCalendar = useCallback(
    async (data: SaveAvailabilityCalendar) => {
      setSaving(true);
      try {
        await availabilityRepository.saveCalendar(calendar, data);
        setCalendar(await availabilityRepository.getCurrentCalendar(data.resourceId));
      } finally {
        setSaving(false);
      }
    },
    [availabilityRepository, calendar]
  );

  const search = useCallback(
    async (data: AvailabilitySearchInput) => {
      setSearching(true);
      try {
        const result = await availabilityRepository.search(data);
        setSearchResult(result);
        return result;
      } finally {
        setSearching(false);
      }
    },
    [availabilityRepository]
  );

  const saveBlock = useCallback(async (kind: ResourceBlockKind, existing: ResourceBlock | null, data: SaveResourceBlock) => {
    setSaving(true);
    try {
      if (existing) {
        const { resourceId: _resourceId, ...update } = data;
        await availabilityRepository.updateBlock(kind, existing, update);
      } else {
        await availabilityRepository.createBlock(kind, data);
      }
      await loadBlocks();
    } finally {
      setSaving(false);
    }
  }, [availabilityRepository, loadBlocks]);

  const deleteBlock = useCallback(async (kind: ResourceBlockKind, block: ResourceBlock) => {
    setSaving(true);
    try {
      await availabilityRepository.deleteBlock(kind, block);
      await loadBlocks();
    } finally {
      setSaving(false);
    }
  }, [availabilityRepository, loadBlocks]);

  return {
    resources: searchableResources,
    selectedResource,
    selectedResourceId,
    setSelectedResourceId,
    calendar,
    blackouts,
    maintenanceBlocks,
    searchResult,
    loading,
    saving,
    searching,
    error,
    refresh,
    saveCalendar,
    search,
    saveBlock,
    deleteBlock,
  };
}
