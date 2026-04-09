/**
 * Notification Model (DTO)
 *
 * JSON shapes matching the API contracts.
 *
 * @module notification-sender/data
 */

export interface NotificationTargetJson {
      id: string;
      name: string;
      type: "admin" | "role" | "tenant";
}

export interface SendNotificationJson {
      title: string;
      body: string;
      target: string;
      userId: string | null;
      tenantId: string | null;
      type: string;
      category: string;
      actionUrl?: string;
      metadataJson?: string;
}
