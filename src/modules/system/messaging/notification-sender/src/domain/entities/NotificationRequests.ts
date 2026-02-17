/**
 * Notification Request Payloads
 *
 * Domain-layer request types for notification mutation operations.
 * Separated from entity definitions per clean architecture rules.
 *
 * @module notification-sender/domain
 */
import type { NotificationType, NotificationCategory, NotificationTargetType } from "./Notification";

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
