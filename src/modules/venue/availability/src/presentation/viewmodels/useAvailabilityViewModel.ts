"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "../../../../di";
import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  SaveAvailabilityCalendar,
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadResources();
      await loadCalendar();
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("availability-load-failed"));
    } finally {
      setLoading(false);
    }
  }, [loadCalendar, loadResources]);

  useEffect(() => {
    void loadResources()
      .catch((caught) =>
        setError(caught instanceof Error ? caught : new Error("resource-load-failed"))
      )
      .finally(() => setLoading(false));
  }, [loadResources]);

  useEffect(() => {
    setSearchResult(null);
    void loadCalendar().catch((caught) =>
      setError(caught instanceof Error ? caught : new Error("availability-load-failed"))
    );
  }, [loadCalendar]);

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

  return {
    resources: searchableResources,
    selectedResource,
    selectedResourceId,
    setSelectedResourceId,
    calendar,
    searchResult,
    loading,
    saving,
    searching,
    error,
    refresh,
    saveCalendar,
    search,
  };
}
