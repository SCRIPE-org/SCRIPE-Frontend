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

/**
 * Interface structure detailing the properties and attributes of Send Notification Json.
 */
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
