/**
 * Notification Bell — Service Layer
 *
 * Wraps IApiService for notification bell API calls.
 * Uses local COMMUNICATION_ENDPOINTS — no raw URLs.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { NOTIFICATION_ENDPOINTS } from "./notification.endpoints";
import type { NotificationListResponse, UnreadCountResponse } from "../entities/NotificationItem";

export interface INotificationBellService {
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

export class NotificationBellService implements INotificationBellService {
  constructor(private readonly api: IApiService) {}

  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
  }): Promise<NotificationListResponse> {
    const url = buildUrl(NOTIFICATION_ENDPOINTS.LIST, {
      page: params?.page,
      pageSize: params?.pageSize,
      isRead: params?.isRead,
    });
    return this.api.get<NotificationListResponse>(url);
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
  }

  async markAsRead(id: string): Promise<void> {
    await this.api.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id), {});
  }

  async markAllAsRead(): Promise<void> {
    await this.api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(NOTIFICATION_ENDPOINTS.DELETE(id));
  }
}
