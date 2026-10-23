"use client";

import { useState, useEffect } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue";
import { getSavedFacilityId } from "@modules/venue";

interface UseVenueSettingsViewModelOptions {
  tenantId?: string;
}

export function useVenueSettingsViewModel(options?: UseVenueSettingsViewModelOptions) {
  const tenantId = options?.tenantId;
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const container = getVenueContainer();
      if (container.facilityRepository?.getAll) {
        container.facilityRepository
          .getAll({ page: 1, pageSize: 20 })
          .then((res) => {
            if (mounted && res?.items?.length) {
              const validId = getSavedFacilityId(res.items, tenantId);
              const match = res.items.find((f) => f.id === validId) ?? res.items[0];
              setSelectedFacility(match);
            }
          })
          .catch(() => {});
      }
    } catch {
      // Graceful fallback
    }
    return () => {
      mounted = false;
    };
  }, [tenantId]);

  // Management Mode state (Solo vs Team)
  const [managementMode, setManagementMode] = useState<"solo" | "team">(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("scripe_venue_management_mode");
      if (mode === "team" || mode === "solo") return mode;
    }
    return "solo";
  });

  const handleModeChange = (mode: "solo" | "team") => {
    setManagementMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("scripe_venue_management_mode", mode);
      window.dispatchEvent(new Event("venue-management-mode-changed"));
    }
  };

  return {
    selectedFacility,
    setSelectedFacility,
    managementMode,
    handleModeChange,
  };
}
