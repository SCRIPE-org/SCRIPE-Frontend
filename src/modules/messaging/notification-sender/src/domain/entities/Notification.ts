/**
 * Notification Sender Entities — Domain types for the notification module.
 *
 * Classes with getters and domain logic.
 * Request payloads are in NotificationRequests.ts.
 *
 * @module notification-sender/domain
 */

// ─── Shared Types ──────────────────────────────────────────────

export type NotificationType = "Info" | "Success" | "Warning" | "Error";
export type NotificationCategory = "General" | "Security" | "System" | "Activity";
export type NotificationTargetType = "User" | "Role" | "Tenant" | "Broadcast";

// ─── Notification Target Entity ────────────────────────────────

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
}
