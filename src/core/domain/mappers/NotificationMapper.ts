/**
 * Notification Mappers
 * 
 * Handles conversion between notification domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  Notification,
  NotificationConfig,
  NotificationType,
  NotificationPosition,
  type NotificationData,
  type NotificationConfigData
} from '@core/domain/entities/Notification';

export class NotificationMapper {
  /**
   * Convert JSON/API response to Notification domain model
   */
  static notificationFromJson(json: any): Notification {
    return new Notification({
      id: json.id || this.generateId(),
      title: json.title || '',
      message: json.message || '',
      type: this.parseNotificationType(json.type),
      position: this.parseNotificationPosition(json.position),
      duration: json.duration || 5000,
      isVisible: json.isVisible !== undefined ? json.isVisible : true,
      timestamp: json.timestamp || new Date().toISOString(),
      actions: json.actions || [],
    });
  }

  /**
   * Convert Notification domain model to JSON for API requests
   */
  static notificationToJson(notification: Notification): any {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      position: notification.position,
      duration: notification.duration,
      isVisible: notification.isVisible,
      timestamp: notification.timestamp,
      actions: notification.actions,
    };
  }

  /**
   * Convert Notification domain model to plain object
   */
  static notificationToPlainObject(notification: Notification): NotificationData {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      position: notification.position,
      duration: notification.duration,
      isVisible: notification.isVisible,
      timestamp: notification.timestamp,
      actions: notification.actions,
    };
  }

  /**
   * Convert plain object to Notification domain model
   */
  static notificationFromPlainObject(data: NotificationData): Notification {
    return new Notification(data);
  }

  /**
   * Convert JSON/API response to NotificationConfig domain model
   */
  static notificationConfigFromJson(json: any): NotificationConfig {
    return new NotificationConfig({
      position: this.parseNotificationPosition(json.position),
      duration: json.duration || 5000,
      maxNotifications: json.maxNotifications || 5,
      enableSound: json.enableSound || false,
      enableVibration: json.enableVibration || false,
    });
  }

  /**
   * Convert NotificationConfig domain model to JSON
   */
  static notificationConfigToJson(config: NotificationConfig): any {
    return {
      position: config.position,
      duration: config.duration,
      maxNotifications: config.maxNotifications,
      enableSound: config.enableSound,
      enableVibration: config.enableVibration,
    };
  }

  /**
   * Convert NotificationConfig domain model to plain object
   */
  static notificationConfigToPlainObject(config: NotificationConfig): NotificationConfigData {
    return {
      position: config.position,
      duration: config.duration,
      maxNotifications: config.maxNotifications,
      enableSound: config.enableSound,
      enableVibration: config.enableVibration,
    };
  }

  /**
   * Convert plain object to NotificationConfig domain model
   */
  static notificationConfigFromPlainObject(data: NotificationConfigData): NotificationConfig {
    return new NotificationConfig(data);
  }

  /**
   * Convert array of JSON objects to Notification array
   */
  static notificationArrayFromJson(jsonArray: any[]): Notification[] {
    return jsonArray.map(json => this.notificationFromJson(json));
  }

  /**
   * Convert Notification array to JSON array
   */
  static notificationArrayToJson(notifications: Notification[]): any[] {
    return notifications.map(notification => this.notificationToJson(notification));
  }

  /**
   * Create notification from simple parameters
   */
  static createNotification(
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    options: Partial<NotificationData> = {}
  ): Notification {
    return new Notification({
      id: this.generateId(),
      title,
      message,
      type,
      position: options.position || NotificationPosition.TOP_RIGHT,
      duration: options.duration || 5000,
      isVisible: options.isVisible !== undefined ? options.isVisible : true,
      timestamp: new Date().toISOString(),
      actions: options.actions || [],
    });
  }

  /**
   * Create success notification
   */
  static createSuccessNotification(
    message: string,
    title: string = 'Success',
    options: Partial<NotificationData> = {}
  ): Notification {
    return this.createNotification(title, message, NotificationType.SUCCESS, options);
  }

  /**
   * Create error notification
   */
  static createErrorNotification(
    message: string,
    title: string = 'Error',
    options: Partial<NotificationData> = {}
  ): Notification {
    return this.createNotification(title, message, NotificationType.ERROR, options);
  }

  /**
   * Create info notification
   */
  static createInfoNotification(
    message: string,
    title: string = 'Information',
    options: Partial<NotificationData> = {}
  ): Notification {
    return this.createNotification(title, message, NotificationType.INFO, options);
  }

  /**
   * Create warning notification
   */
  static createWarningNotification(
    message: string,
    title: string = 'Warning',
    options: Partial<NotificationData> = {}
  ): Notification {
    return this.createNotification(title, message, NotificationType.WARNING, options);
  }

  /**
   * Parse notification type from string
   */
  private static parseNotificationType(type: string): NotificationType {
    switch (type?.toLowerCase()) {
      case 'success':
        return NotificationType.SUCCESS;
      case 'error':
        return NotificationType.ERROR;
      case 'info':
        return NotificationType.INFO;
      case 'warning':
        return NotificationType.WARNING;
      default:
        return NotificationType.INFO;
    }
  }

  /**
   * Parse notification position from string
   */
  private static parseNotificationPosition(position: string): NotificationPosition {
    switch (position?.toLowerCase()) {
      case 'top-left':
        return NotificationPosition.TOP_LEFT;
      case 'top-right':
        return NotificationPosition.TOP_RIGHT;
      case 'top-center':
        return NotificationPosition.TOP_CENTER;
      case 'bottom-left':
        return NotificationPosition.BOTTOM_LEFT;
      case 'bottom-right':
        return NotificationPosition.BOTTOM_RIGHT;
      case 'bottom-center':
        return NotificationPosition.BOTTOM_CENTER;
      default:
        return NotificationPosition.TOP_RIGHT;
    }
  }

  /**
   * Generate unique ID for notifications
   */
  private static generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
