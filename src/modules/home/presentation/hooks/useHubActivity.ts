"use client";

/**
 * useHubActivity — Fetches real-time hub activity data from the backend.
 *
 * Uses the Audit/hub-summary endpoint to get:
 * - Today's action count + module count
 * - Yesterday's count (for trend %)
 * - 4 most recent entity changes
 *
 * Falls back to empty state if the API call fails (Hub still renders).
 */

import { useQuery } from "@tanstack/react-query";
import { getModuleApiService } from "@core/services/api-factory";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints/system.endpoints";

// ── Response types matching backend DTOs ──────────────────────────────────────

export interface HubRecentItem {
  eventType: string;
  entityType: string | null;
  moduleTag: string | null;
  username: string | null;
  timestamp: string; // ISO 8601
}

export interface HubActivitySummary {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItem[];
}

// ── Derived display data ─────────────────────────────────────────────────────

/** Map event types to display-friendly icon names. */
function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "Create": return "Plus";
    case "Update": return "Pencil";
    case "Delete": return "Trash2";
    case "Login": return "LogIn";
    case "Logout": return "LogOut";
    case "PasswordChange":
    case "PasswordChanged": return "KeyRound";
    case "RoleAssigned": return "UserCog";
    case "PermissionGranted": return "Shield";
    default: return "Activity";
  }
}

/** Map event types to gradient colors for the icon chip. */
function getEventGradient(eventType: string): { grad: string; glow: string } {
  switch (eventType) {
    case "Create":
      return { grad: "linear-gradient(135deg, #4DE2D0, #1AB7B0 55%, #0E6F7E)", glow: "26, 183, 176" };
    case "Update":
      return { grad: "linear-gradient(135deg, #5E91FF, #3461E8 55%, #1E3CAE)", glow: "52, 97, 232" };
    case "Delete":
      return { grad: "linear-gradient(135deg, #FF7A6B, #F04E5A 55%, #B43048)", glow: "240, 78, 90" };
    case "Login":
    case "Logout":
      return { grad: "linear-gradient(135deg, #FFC25E, #F18A1A 55%, #B95F0C)", glow: "241, 138, 26" };
    default:
      return { grad: "linear-gradient(135deg, #9DA9FF, #7C8BFF 55%, #5A60E0)", glow: "124, 139, 255" };
  }
}

/** Human-readable relative time. */
function getRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const ts = new Date(isoTimestamp).getTime();
  const diffMs = now - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

/** Build a display label from event + entity. */
function getEventLabel(item: HubRecentItem): string {
  const entity = item.entityType || "Item";
  switch (item.eventType) {
    case "Create": return `Created ${entity}`;
    case "Update": return `Updated ${entity}`;
    case "Delete": return `Deleted ${entity}`;
    case "Login": return "Logged in";
    case "Logout": return "Logged out";
    default: return `${item.eventType} ${entity}`;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface HubActivityData {
  todayCount: number;
  moduleCount: number;
  trendPercent: number; // +22, -5, etc.
  recentItems: Array<{
    icon: string;
    label: string;
    meta: string;
    grad: string;
    glow: string;
  }>;
  isLoading: boolean;
}

export function useHubActivity(): HubActivityData {
  const { data, isLoading } = useQuery<HubActivitySummary>({
    queryKey: ["hub-activity-summary"],
    queryFn: async () => {
      const api = getModuleApiService("IDENTITY");
      return api.get<HubActivitySummary>(SYSTEM_ENDPOINTS.AUDIT.HUB_SUMMARY);
    },
    staleTime: 60_000, // Refresh every minute
    refetchInterval: 120_000, // Auto-refetch every 2 minutes
    retry: 1,
  });

  // Compute trend %
  const todayCount = data?.todayActionCount ?? 0;
  const yesterdayCount = data?.yesterdayActionCount ?? 0;
  const moduleCount = data?.todayModuleCount ?? 0;

  let trendPercent = 0;
  if (yesterdayCount > 0) {
    trendPercent = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  } else if (todayCount > 0) {
    trendPercent = 100; // Up from zero
  }

  // Map recent items to display format
  const recentItems = (data?.recentItems ?? []).map((item) => ({
    icon: getEventIcon(item.eventType),
    label: getEventLabel(item),
    meta: getRelativeTime(item.timestamp),
    ...getEventGradient(item.eventType),
  }));

  return {
    todayCount,
    moduleCount,
    trendPercent,
    recentItems,
    isLoading,
  };
}
