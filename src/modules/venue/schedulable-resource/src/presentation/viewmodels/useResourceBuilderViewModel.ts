"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "../../../../di";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";
import { buildResourceTree, type SchedulableResourceTreeNode } from "../utils/resourceTree";

// The backend hard-caps pageSize at 100 regardless of what's requested (see
// SchedulableResourcesController — P5.3 abuse-prevention clamp), so requesting more here
// only lies about what we actually get back. Match the real cap: fine at Slice A scale (see
// resourceTree.ts) — a server-side tree endpoint is the real fix once tenants exceed it.
const LARGE_PAGE_SIZE = 100;

/**
 * Presentation ViewModel hook for building and organizing hierarchical Schedulable Resources.
 * 
 * Coordinates resource tree reconstruction, CRUD mutations, resource profile selection,
 * publication checklist generation, and lifecycle publishing states.
 * 
 * @returns State object exposing hierarchical resource `tree`, loading indicators, and mutation actions.
 */
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
