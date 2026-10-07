"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "../../../../di";
import type { Facility } from "../../../../facility/src/domain/entities/Facility";
import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
} from "../../domain/entities/FacilityResourceProfile";

const PAGE_SIZE = 100;

export function useFacilityResourceProfilesViewModel() {
  const { facilityRepository, facilityResourceProfileRepository } = getVenueContainer();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [profiles, setProfiles] = useState<FacilityResourceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFacilities = useCallback(async () => {
    const result = await facilityRepository.getAll({ page: 1, pageSize: PAGE_SIZE });
    setFacilities(result.items);
    setSelectedFacilityId((current) => current || result.items[0]?.id || "");
  }, [facilityRepository]);

  const loadProfiles = useCallback(async () => {
    if (!selectedFacilityId) {
      setProfiles([]);
      return;
    }
    const result = await facilityResourceProfileRepository.getAll({
      page: 1,
      pageSize: PAGE_SIZE,
      facilityId: selectedFacilityId,
    });
    setProfiles(result.items);
  }, [facilityResourceProfileRepository, selectedFacilityId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (facilities.length === 0) await loadFacilities();
      await loadProfiles();
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("resource-profile-load-failed"));
    } finally {
      setLoading(false);
    }
  }, [facilities.length, loadFacilities, loadProfiles]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadFacilities().catch((caught) => {
        setError(caught instanceof Error ? caught : new Error("facility-load-failed"));
        setLoading(false);
      });
    });
  }, [loadFacilities]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadProfiles()
        .catch((caught) =>
          setError(caught instanceof Error ? caught : new Error("resource-profile-load-failed"))
        )
        .finally(() => setLoading(false));
    });
  }, [loadProfiles]);

  const save = useCallback(
    async (data: FacilityResourceProfileWrite, id?: string) => {
      if (id) await facilityResourceProfileRepository.update(id, data);
      else await facilityResourceProfileRepository.create(data);
      await loadProfiles();
    },
    [facilityResourceProfileRepository, loadProfiles]
  );

  const loadDetail = useCallback(
    (id: string) => facilityResourceProfileRepository.getById(id),
    [facilityResourceProfileRepository]
  );

  return {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    profiles,
    loading,
    error,
    refresh,
    save,
    loadDetail,
  };
}
