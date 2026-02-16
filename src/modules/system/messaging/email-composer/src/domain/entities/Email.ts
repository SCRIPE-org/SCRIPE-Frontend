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
      scheduledAt?: string | null;    // ISO date, null for default delay
      attachments?: string[];         // uploaded attachment URLs
      signatureHtml?: string | null;  // HTML signature block
      cc?: string[];                  // CC email addresses
      bcc?: string[];                 // BCC email addresses
}

export interface SentEmail {
      id: string;
      to: string;
      subject: string;
      body: string;
      status: "Sent" | "Failed" | "Pending" | "Cancelled";
      createdAt: string;
      sentAt: string | null;
      scheduledAt: string;
      errorMessage: string | null;
      sentByAdminId: string;
      templateKey: string | null;
      recipientType: string;
      cc: string | null;              // comma-separated CC addresses
      bcc: string | null;             // comma-separated BCC addresses
      retryCount: number;
}

/**
 * Lightweight template reference for the template picker.
 * Only includes fields needed to select and fill the composer.
 */
export interface EmailTemplate {
      id: string;
      key: string;
      channel: string;
      language: string;
      subject: string | null;
      body: string;
      isActive: boolean;
}

export interface EmailTemplateListResponse {
      items: EmailTemplate[];
      totalCount: number;
}
