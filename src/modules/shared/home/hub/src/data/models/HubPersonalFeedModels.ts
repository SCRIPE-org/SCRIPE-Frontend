/**
 * Raw API DTO models for personal notifications and sign-in activity shown on `/hub`.
 * Mirrors Identity.Application `AccountNotificationsDto` and `AccountActivityDto` camelCase JSON.
 */

export interface HubNotificationItemModel {
  id: string;
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  category?: string;
  isRead?: boolean;
  readAt?: string | null;
  actionUrl?: string | null;
  createdAt?: string;
}

export interface HubAccountNotificationsModel {
  unreadNotificationsCount?: number;
  recentNotifications?: HubNotificationItemModel[];
}

export interface HubActivityEntryModel {
  id: string;
  eventType?: string;
  category?: string;
  outcome?: string;
  endpoint?: string | null;
  httpMethod?: string | null;
  statusCode?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestampUtc?: string;
}

export interface HubAccountActivityModel {
  totalEntries?: number;
  totalCount?: number;
  entries?: HubActivityEntryModel[];
}
