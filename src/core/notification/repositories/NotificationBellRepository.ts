/**
 * Notification Bell — Repository Implementation
 *
 * Implements INotificationBellRepository using NotificationBellService.
 * This is the concrete implementation that maps service responses to domain entities.
 */
import type { INotificationBellRepository } from "../interfaces/INotificationBellRepository";
import type { INotificationBellService } from "../services/NotificationBellService";
import type { NotificationListResponse, UnreadCountResponse } from "../entities/NotificationItem";

export class NotificationBellRepository implements INotificationBellRepository {
  constructor(private readonly service: INotificationBellService) {}

  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
  }): Promise<NotificationListResponse> {
    return this.service.getNotifications(params);
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.service.getUnreadCount();
  }

  async markAsRead(id: string): Promise<void> {
    await this.service.markAsRead(id);
  }

  async markAllAsRead(): Promise<void> {
    await this.service.markAllAsRead();
  }

  async deleteNotification(id: string): Promise<void> {
    await this.service.deleteNotification(id);
  }
}
