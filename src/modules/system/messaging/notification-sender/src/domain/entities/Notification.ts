/**
 * Notification Sender entities — aligned with backend enums and DTOs
 */

export interface NotificationTarget {
      id: string;
      name: string;
      type: "admin" | "role" | "tenant";
}

/**
 * Backend NotificationType enum values
 */
export type NotificationType = "Info" | "Success" | "Warning" | "Error";

/**
 * Backend NotificationCategory enum values
 */
export type NotificationCategory = "General" | "Security" | "System" | "Activity";

/**
 * Backend NotificationTarget enum values
 */
export type NotificationTargetType = "User" | "Role" | "Tenant" | "Broadcast";

/**
 * Matches backend SendNotificationRequest exactly.
 * One request per target — the frontend batches multiple targets.
 */
export interface SendNotificationPayload {
      title: string;
      body: string;
      target: NotificationTargetType;
      userId: string | null;
      tenantId: string | null;
      type: NotificationType;
      category: NotificationCategory;
      actionUrl?: string;
      metadataJson?: string;
}
