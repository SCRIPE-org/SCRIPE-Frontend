/**
 * Email Request Payloads
 *
 * Domain-layer request types for email mutation operations.
 * Separated from entity definitions per clean architecture rules.
 *
 * @module email-composer/domain
 */

/**
 * Matches backend SendManualEmailCommand exactly.
 * One request per recipient — the frontend batches multiple recipients.
 */
export interface SendManualEmailPayload {
  recipientType: string; // "Admin" | "User" | "Custom"
  recipientId: string | null; // system user ID, null for custom
  recipientEmail: string; // the actual email address
  subject: string;
  body: string;
  templateKey?: string;
  templateLanguage?: string; // language of the selected template (ar/en)
  templatePlaceholders?: Record<string, unknown>;
  scheduledAt?: string | null; // ISO date, null for default delay
  attachments?: string[]; // uploaded attachment URLs
  signatureHtml?: string | null; // HTML signature block
  cc?: string[]; // CC email addresses
  bcc?: string[]; // BCC email addresses
}
