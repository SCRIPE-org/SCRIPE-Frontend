/**
 * Notification Sender entities
 */

export interface NotificationTarget {
      id: string;
      name: string;
      type: "admin" | "role" | "tenant";
}

export type NotificationCategory = "info" | "warning" | "success" | "error" | "system";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface SendNotificationRequest {
      targetIds: string[];
      title: string;
      message: string;
      category: NotificationCategory;
      priority: NotificationPriority;
      actionUrl?: string;
}
