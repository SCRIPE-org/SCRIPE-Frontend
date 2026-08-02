/**
 * Hub Activity DTO Models matching backend shapes exactly.
 */

export interface HubRecentItemModel {
  eventType: string;
  entityType: string | null;
  moduleTag: string | null;
  username: string | null;
  timestamp: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for hub activity summary model.
 */
export interface HubActivitySummaryModel {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItemModel[];
}
