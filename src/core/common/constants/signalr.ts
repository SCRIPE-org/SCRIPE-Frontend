/**
 * SignalR Hub Constants — Single source of truth.
 *
 * Event names MUST match the backend hub client interface methods.
 * Method names MUST match the hub public method signatures.
 * Group names MUST match the backend HubGroupNames constants.
 *
 * If the backend renames a method/event, update ONLY this file.
 */

// ─── Hub Events (Server → Client) ────────────────────────────────────
export const HUB_EVENTS = {
  /** Receives a real-time audit event notification */
  AUDIT_EVENT: "AuditEvent",
  /** Receives a new notification push (matches INotificationHubClient.ReceiveNotification) */
  RECEIVE_NOTIFICATION: "ReceiveNotification",
  /** Receives updated unread count (matches INotificationHubClient.UnreadCountUpdated) */
  UNREAD_COUNT_UPDATED: "UnreadCountUpdated",
} as const;

// ─── Hub Methods (Client → Server) ───────────────────────────────────
export const HUB_METHODS = {
  /** Join the global group (super admin — all events) */
  JOIN_GLOBAL_GROUP: "JoinGlobalGroup",
  /** Leave the global group */
  LEAVE_GLOBAL_GROUP: "LeaveGlobalGroup",
  /** Join a tenant-specific group */
  JOIN_TENANT_GROUP: "JoinTenantGroup",
  /** Leave a tenant-specific group */
  LEAVE_TENANT_GROUP: "LeaveTenantGroup",
} as const;

// ─── Hub Paths ────────────────────────────────────────────────────────
export const HUB_PATHS = {
  /** Audit events hub endpoint */
  AUDIT: "/hubs/audit",
  /** Notification hub endpoint */
  NOTIFICATIONS: "/hubs/notifications",
} as const;
