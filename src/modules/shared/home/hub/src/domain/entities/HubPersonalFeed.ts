/**
 * Domain entities for the operator's personal operational feeds rendered on `/hub`.
 */

export interface HubNotificationItem {
  id: string;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export interface HubNotificationsFeed {
  unreadCount: number;
  items: HubNotificationItem[];
}

export interface HubSignInActivityEntry {
  id: string;
  eventType: string;
  category: string;
  outcome: string;
  endpoint: string | null;
  ipAddress: string | null;
  timestampUtc: string;
}

export interface HubSignInActivityFeed {
  totalCount: number;
  entries: HubSignInActivityEntry[];
}
