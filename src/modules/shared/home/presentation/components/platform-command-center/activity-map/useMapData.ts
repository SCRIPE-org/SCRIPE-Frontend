"use client";

import { useMemo } from "react";
import { COUNTRIES_DATA } from "../data/worldMapData";
import { RegionNodeInfo, EnrichedCountryData } from "./types";
import type {
  DashboardSummary,
  RecentChange,
} from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

export function useMapData(
  regionNodes: RegionNodeInfo[] = [],
  summary?: DashboardSummary,
  recentActivity: RecentChange[] = []
) {
  // Enrich country telemetry with real tenant distribution & host node
  const enrichedCountries = useMemo<EnrichedCountryData[]>(() => {
    const nodeMap = new Map<string, RegionNodeInfo>();
    (regionNodes ?? []).forEach((rn) => {
      nodeMap.set(rn.countryName.toLowerCase(), rn);
    });

    const totalLogins = summary?.loginsToday ?? 0;
    const totalEvents = recentActivity.length;
    const totalErrors = summary?.failedLogins24h ?? 0;
    const totalTenants = summary?.totalTenants ?? 0;

    return COUNTRIES_DATA.map((c) => {
      const node = nodeMap.get(c.name.toLowerCase());
      if (!node) {
        return {
          ...c,
          tenantCount: 0,
          tenantNames: [],
          isHost: false,
          isTenantRegion: false,
        };
      }

      const ratio = totalTenants > 0 ? node.tenantCount / totalTenants : 1;
      const requests =
        Math.round(totalLogins * ratio) || (node.isHost ? Math.max(1, totalLogins) : 0);
      const signins = Math.round(totalLogins * ratio);
      const events = Math.round(totalEvents * ratio);
      const errors = Math.round(totalErrors * ratio);

      return {
        ...c,
        tenantCount: node.tenantCount,
        tenantNames: node.tenantNames ?? [],
        isHost: !!node.isHost,
        isTenantRegion: node.tenantCount > 0,
        requests,
        signins,
        events,
        errors,
      };
    });
  }, [regionNodes, summary, recentActivity]);

  // Active regions prioritized for focus dropdown
  const activeCountries = useMemo(() => {
    return enrichedCountries
      .filter((c) => c.isHost || c.isTenantRegion)
      .sort((a, b) => b.tenantCount - a.tenantCount || a.name.localeCompare(b.name));
  }, [enrichedCountries]);

  // Sorted countries for focus dropdown
  const sortedCountries = useMemo(() => {
    return [...enrichedCountries].sort((a, b) => a.name.localeCompare(b.name));
  }, [enrichedCountries]);

  // Compute country styling mapped to Host, Tenant, and Inactive regions
  const countryStyles = useMemo(() => {
    const map = new Map<
      string,
      {
        fill: string;
        stroke: string;
        strokeWidth: number;
        isHost: boolean;
        isTenantRegion: boolean;
      }
    >();
    enrichedCountries.forEach((p) => {
      if (p.isHost) {
        map.set(p.name, {
          fill: "rgba(198, 255, 0, 0.18)",
          stroke: "var(--primary)",
          strokeWidth: 1.25,
          isHost: true,
          isTenantRegion: false,
        });
      } else if (p.isTenantRegion) {
        map.set(p.name, {
          fill: "rgba(14, 165, 233, 0.18)",
          stroke: "rgb(14, 165, 233)",
          strokeWidth: 1.15,
          isHost: false,
          isTenantRegion: true,
        });
      } else {
        map.set(p.name, {
          fill: "#112330",
          stroke: "rgba(100, 140, 165, 0.35)",
          strokeWidth: 0.62,
          isHost: false,
          isTenantRegion: false,
        });
      }
    });
    return map;
  }, [enrichedCountries]);

  return {
    enrichedCountries,
    activeCountries,
    sortedCountries,
    countryStyles,
  };
}
