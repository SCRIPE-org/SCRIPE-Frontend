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

export interface HubActivitySummaryData {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItemData[];
}

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
