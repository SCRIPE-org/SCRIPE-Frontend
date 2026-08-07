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
import { chartColor } from "@core/ui/chart";
import { homeContainer } from "../../di";
import type { HubRecentItem } from "../../hub/src/domain/entities/HubActivity";

// ── Derived display data ─────────────────────────────────────────────────────

/** Map event types to display-friendly icon names. */
function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "Create":
      return "Plus";
    case "Update":
      return "Pencil";
    case "Delete":
      return "Trash2";
    case "Login":
      return "LogIn";
    case "Logout":
      return "LogOut";
    case "PasswordChange":
    case "PasswordChanged":
      return "KeyRound";
    case "RoleAssigned":
      return "UserCog";
    case "PermissionGranted":
      return "Shield";
    default:
      return "Activity";
  }
}

// Colour follows the event category, never its rank — a fixed categorical
// chart slot per event type (same idiom as LifecycleStepItem's ACTOR_SLOT).
// Slots echo the original hue families: create=green, update=blue,
// delete=red, login/logout=orange, anything else=violet.
const EVENT_TYPE_CHART_SLOT: Record<string, number> = {
  Create: 2,
  Update: 1,
  Delete: 5,
  Login: 3,
  Logout: 3,
};
const DEFAULT_EVENT_CHART_SLOT = 4;

/** Token-backed accent colour for the event's icon chip. */
function getEventAccent(eventType: string): string {
  return chartColor(EVENT_TYPE_CHART_SLOT[eventType] ?? DEFAULT_EVENT_CHART_SLOT);
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
    case "Create":
      return `Created ${entity}`;
    case "Update":
      return `Updated ${entity}`;
    case "Delete":
      return `Deleted ${entity}`;
    case "Login":
      return "Logged in";
    case "Logout":
      return "Logged out";
    default:
      return `${item.eventType} ${entity}`;
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
    accent: string;
  }>;
  isLoading: boolean;
}

export function useHubActivity(): HubActivityData {
  const { hubActivityRepository } = homeContainer;
  const { data, isLoading } = useQuery({
    queryKey: ["hub-activity-summary"],
    queryFn: () => hubActivityRepository.getHubSummary(),
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
    accent: getEventAccent(item.eventType),
  }));

  return {
    todayCount,
    moduleCount,
    trendPercent,
    recentItems,
    isLoading,
  };
}
