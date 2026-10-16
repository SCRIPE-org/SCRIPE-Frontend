import type { CountryData } from "../data/worldMapData";
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
} from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

export interface RegionNodeInfo {
  countryName: string;
  countryCode?: string;
  tenantCount: number;
  tenantNames?: string[];
  isHost?: boolean;
}

export interface EnrichedCountryData extends CountryData {
  tenantCount: number;
  tenantNames: string[];
  isHost: boolean;
  isTenantRegion: boolean;
}

export interface PlatformActivityMapProps {
  summary?: DashboardSummary;
  loginActivity?: LoginActivityPoint[];
  recentActivity?: RecentChange[];
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  regionNodes?: RegionNodeInfo[];
  isLoading?: boolean;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DEFAULT_VB: ViewBox = { x: 135, y: 68, w: 750, h: 315 };

export const fmt = (n: number | string) => Number(n).toLocaleString();

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "now";
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  } catch {
    return "now";
  }
}
