/**
 * Notification Sender Entities — Domain types for the notification module.
 *
 * Classes with getters and domain logic.
 * Request payloads are in NotificationRequests.ts.
 *
 * @module notification-sender/domain
 */

// ─── Shared Types ──────────────────────────────────────────────

/**
 * Type declaration definition describing the schema of notification type.
 */
export type NotificationType = "Info" | "Success" | "Warning" | "Error";
/**
 * Type declaration definition describing the schema of notification category.
 */
export type NotificationCategory = "General" | "Security" | "System" | "Activity";
/**
 * Type declaration definition describing the schema of notification target type.
 */
export type NotificationTargetType = "User" | "Role" | "Tenant" | "Broadcast";

// ─── Notification Target Entity ────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Notification Target Data.
 */
export interface NotificationTargetData {
  id: string;
  name: string;
  type: "admin" | "role" | "tenant";
}

/**
 * Notification Target Entity
 */
export class NotificationTarget {
  constructor(private readonly data: NotificationTargetData) {}

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get type(): "admin" | "role" | "tenant" {
    return this.data.type;
  }

  /** Display label with type prefix */
  get displayLabel(): string {
    const prefix = this.type.charAt(0).toUpperCase() + this.type.slice(1);
    return `${prefix}: ${this.name}`;
  }

  copyWith(updates: Partial<NotificationTargetData>): NotificationTarget {
    return new NotificationTarget({
      ...this.data,
      ...updates,
    } as NotificationTargetData);
  }
}
