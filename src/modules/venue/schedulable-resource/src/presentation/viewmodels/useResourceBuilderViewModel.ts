"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "../../../../di";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";
import { buildResourceTree, type SchedulableResourceTreeNode } from "./resourceTree";

const LARGE_PAGE_SIZE = 500;

export function useResourceBuilderViewModel() {
  const { schedulableResourceRepository, facilityResourceProfilePickerService } = getVenueContainer();
  const [tree, setTree] = useState<SchedulableResourceTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await schedulableResourceRepository.getAll({ page: 1, pageSize: LARGE_PAGE_SIZE });
      setTree(buildResourceTree(result.items));
    } catch {
      setError("load-failed");
    } finally {
      setLoading(false);
    }
  }, [schedulableResourceRepository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      await schedulableResourceRepository.create(data);
      await refresh();
    },
    [schedulableResourceRepository, refresh]
  );

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      await schedulableResourceRepository.update(id, data);
      await refresh();
    },
    [schedulableResourceRepository, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await schedulableResourceRepository.delete(id);
      await refresh();
    },
    [schedulableResourceRepository, refresh]
  );

  const getPublicationChecklist = useCallback(
    (id: string): Promise<PublicationChecklistReport> => schedulableResourceRepository.getPublicationChecklist(id),
    [schedulableResourceRepository]
  );

  const publish = useCallback(
    async (id: string) => {
      await schedulableResourceRepository.publish(id);
      await refresh();
    },
    [schedulableResourceRepository, refresh]
  );

  // Powers the "Facility Resource Profile" `server-select` field on the
  // create form — there is no dedicated CRUD page for this entity yet.
  const searchFacilityResourceProfiles = useCallback(
    async (query: string) => {
      const results = await facilityResourceProfilePickerService.search(query);
      return results.map((profile) => ({ value: profile.id, label: profile.name }));
    },
    [facilityResourceProfilePickerService]
  );

  return {
    tree,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    getPublicationChecklist,
    publish,
    searchFacilityResourceProfiles,
  };
}
