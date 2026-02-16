/**
 * Notification Bell — Service Layer
 *
 * Wraps IApiService for notification bell API calls.
 * Uses centralized API_ENDPOINTS — no raw URLs.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { NotificationItem, NotificationListResponse, UnreadCountResponse } from "../entities/NotificationItem";

export interface INotificationBellService {
      getNotifications(params?: { page?: number; pageSize?: number; isRead?: boolean }): Promise<NotificationListResponse>;
      getUnreadCount(): Promise<UnreadCountResponse>;
      markAsRead(id: string): Promise<void>;
      markAllAsRead(): Promise<void>;
      deleteNotification(id: string): Promise<void>;
}

export class NotificationBellService implements INotificationBellService {
      constructor(private readonly api: IApiService) { }

      async getNotifications(params?: { page?: number; pageSize?: number; isRead?: boolean }): Promise<NotificationListResponse> {
            const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS.LIST, {
                  page: params?.page,
                  pageSize: params?.pageSize,
                  isRead: params?.isRead,
            });
            return this.api.get<NotificationListResponse>(url);
      }

      async getUnreadCount(): Promise<UnreadCountResponse> {
            return this.api.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      }

      async markAsRead(id: string): Promise<void> {
            await this.api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {});
      }

      async markAllAsRead(): Promise<void> {
            await this.api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
      }

      async deleteNotification(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      }
}
