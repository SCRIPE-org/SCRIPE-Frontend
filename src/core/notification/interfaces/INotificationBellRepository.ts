/**
 * Notification Bell — Repository Interface
 *
 * Contract for notification bell data access.
 * Following Dependency Inversion: ViewModel depends on this interface, not the implementation.
 */
import type { NotificationListResponse, UnreadCountResponse } from "../entities/NotificationItem";

export interface INotificationBellRepository {
  getNotifications(params?: {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
  }): Promise<NotificationListResponse>;
  getUnreadCount(): Promise<UnreadCountResponse>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}
