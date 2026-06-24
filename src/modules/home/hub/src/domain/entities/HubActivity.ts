/**
 * Hub Activity Domain Entities
 */

export interface HubRecentItemData {
  eventType: string;
  entityType: string | null;
  moduleTag: string | null;
  username: string | null;
  timestamp: string;
}

/**
 * Domain model representing a Hub Recent Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class HubRecentItem {
  constructor(public readonly data: HubRecentItemData) {}

  get eventType() {
    return this.data.eventType;
  }
  get entityType() {
    return this.data.entityType;
  }
  get moduleTag() {
    return this.data.moduleTag;
  }
  get username() {
    return this.data.username;
  }
  get timestamp() {
    return this.data.timestamp;
  }

  copyWith(updates: Partial<HubRecentItemData>): HubRecentItem {
    return new HubRecentItem({
      ...this.data,
      ...updates,
    } as HubRecentItemData);
  }
}

/**
 * Domain model representing a Hub Activity Summary Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface HubActivitySummaryData {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItemData[];
}

/**
 * Domain model representing a Hub Activity Summary structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class HubActivitySummary {
  constructor(public readonly data: HubActivitySummaryData) {}

  get todayActionCount() {
    return this.data.todayActionCount;
  }
  get todayModuleCount() {
    return this.data.todayModuleCount;
  }
  get yesterdayActionCount() {
    return this.data.yesterdayActionCount;
  }
  get recentItems(): HubRecentItem[] {
    return (this.data.recentItems || []).map((item) => new HubRecentItem(item));
  }
}
