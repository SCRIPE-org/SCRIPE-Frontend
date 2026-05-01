/**
 * Notification Bell — Domain Entity
 *
 * Represents a single notification item and the unread-count response
 * used by the notification bell UI.
 */

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  metadataJson: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UnreadCountResponse {
  count: number;
}
