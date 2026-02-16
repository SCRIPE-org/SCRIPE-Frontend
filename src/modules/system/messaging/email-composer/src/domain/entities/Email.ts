/**
 * Email Composer entities
 */

export interface EmailRecipient {
      id: string;
      email: string;
      name: string;
      type: "admin" | "user" | "custom";
}

/**
 * Matches backend SendManualEmailCommand exactly.
 * One request per recipient — the frontend batches multiple recipients.
 */
export interface SendManualEmailPayload {
      recipientType: string;          // "Admin" | "User" | "Custom"
      recipientId: string | null;     // system user ID, null for custom
      recipientEmail: string;         // the actual email address
      subject: string;
      body: string;
      templateKey?: string;
      templatePlaceholders?: Record<string, unknown>;
}

export interface SentEmail {
      id: string;
      to: string;
      subject: string;
      body: string;
      sentAt: string;
      status: "sent" | "failed" | "pending";
      errorMessage: string | null;
}
