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
 * Interface structure detailing the properties and attributes of Hub Activity Summary Model.
 */
export interface HubActivitySummaryModel {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItemModel[];
}
