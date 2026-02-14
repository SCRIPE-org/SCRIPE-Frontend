import { appLogger } from "@core/common/logger";
import {
  Notification,
  NotificationConfig,
  NotificationQueue,
  NotificationType,
  NotificationPosition,
  type NotificationData,
} from "@core/domain/entities/Notification";
import { NotificationMapper } from "@core/domain/mappers/NotificationMapper";

export interface INotificationService {
  success(message: string, title?: string, options?: Partial<NotificationData>): void;
  error(message: string, title?: string, options?: Partial<NotificationData>): void;
  info(message: string, title?: string, options?: Partial<NotificationData>): void;
  warning(message: string, title?: string, options?: Partial<NotificationData>): void;
  add(notification: Notification): void;
  remove(id: string): void;
  clear(): void;
  getAll(): Notification[];
  getVisible(): Notification[];
  getByType(type: NotificationType): Notification[];
  updateConfig(config: NotificationConfig): void;
  getConfig(): NotificationConfig;
}

export class NotificationService implements INotificationService {
  private queue: NotificationQueue;
  private config: NotificationConfig;

  constructor(config?: NotificationConfig) {
    this.config = config || NotificationConfig.getDefault();
    this.queue = new NotificationQueue(this.config);
  }

  /**
   * Show success notification
   */
  success(
    message: string,
    title: string = "Success",
    options: Partial<NotificationData> = {}
  ): void {
    const notification = NotificationMapper.createSuccessNotification(message, title, options);
    this.add(notification);
    appLogger.info("Success notification:", { title, message });
  }

  /**
   * Show error notification
   */
  error(message: string, title: string = "Error", options: Partial<NotificationData> = {}): void {
    const notification = NotificationMapper.createErrorNotification(message, title, options);
    this.add(notification);
    appLogger.error("Error notification:", { title, message });
  }

  /**
   * Show info notification
   */
  info(
    message: string,
    title: string = "Information",
    options: Partial<NotificationData> = {}
  ): void {
    const notification = NotificationMapper.createInfoNotification(message, title, options);
    this.add(notification);
    appLogger.info("Info notification:", { title, message });
  }

  /**
   * Show warning notification
   */
  warning(
    message: string,
    title: string = "Warning",
    options: Partial<NotificationData> = {}
  ): void {
    const notification = NotificationMapper.createWarningNotification(message, title, options);
    this.add(notification);
    appLogger.warn("Warning notification:", { title, message });
  }

  /**
   * Add notification to queue
   */
  add(notification: Notification): void {
    this.queue.add(notification);

    // Auto-remove after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Remove notification by ID
   */
  remove(id: string): void {
    this.queue.remove(id);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return this.queue.getAll();
  }

  /**
   * Get visible notifications
   */
  getVisible(): Notification[] {
    return this.queue.getVisible();
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): Notification[] {
    return this.queue.getByType(type);
  }

  /**
   * Update configuration
   */
  updateConfig(config: NotificationConfig): void {
    this.config = config;
    this.queue.updateConfig(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return this.config;
  }

  /**
   * Create custom notification
   */
  createNotification(
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    options: Partial<NotificationData> = {}
  ): Notification {
    return NotificationMapper.createNotification(title, message, type, options);
  }

  /**
   * Show notification with custom duration
   */
  showWithDuration(
    message: string,
    duration: number,
    type: NotificationType = NotificationType.INFO,
    title?: string
  ): void {
    const notification = this.createNotification(
      title || this.getDefaultTitle(type),
      message,
      type,
      { duration }
    );
    this.add(notification);
  }

  /**
   * Show notification with actions
   */
  showWithActions(
    message: string,
    actions: any[],
    type: NotificationType = NotificationType.INFO,
    title?: string
  ): void {
    const notification = this.createNotification(
      title || this.getDefaultTitle(type),
      message,
      type,
      { actions }
    );
    this.add(notification);
  }

  /**
   * Get default title based on type
   */
  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return "Success";
      case NotificationType.ERROR:
        return "Error";
      case NotificationType.INFO:
        return "Information";
      case NotificationType.WARNING:
        return "Warning";
      default:
        return "Notification";
    }
  }
}
