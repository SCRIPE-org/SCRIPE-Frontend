/**
 * Email Model (DTO)
 *
 * Represents the raw API response/request shapes for emails.
 * Service returns these; Mapper converts them to domain Entities.
 *
 * @module email-composer/data
 */

// ===== JSON Shapes (API contracts) =====

/**
 * Interface structure detailing the properties and attributes of Email Recipient Json.
 */
export interface EmailRecipientJson {
  id: string;
  email: string;
  name: string;
  type: "admin" | "user" | "custom";
}

/**
 * Interface structure detailing the properties and attributes of Sent Email Json.
 */
export interface SentEmailJson {
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
  recipientId: string | null;
  cc: string | null;
  bcc: string | null;
  retryCount: number;
  attachments: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Sent Email List Response Json.
 */
export interface SentEmailListResponseJson {
  items: SentEmailJson[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Email Template Json.
 */
export interface EmailTemplateJson {
  id: string;
  key: string;
  channel: string;
  language: string;
  subject: string | null;
  body: string;
  isActive: boolean;
  description: string | null;
  placeholderSchema: string | null;
  designVariables: string | null;
  category: string | null;
  tags: string | null;
  usageCount: number;
  lastUsedAt: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Email Template List Response Json.
 */
export interface EmailTemplateListResponseJson {
  items: EmailTemplateJson[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Send Manual Email Json.
 */
export interface SendManualEmailJson {
  recipientType: string;
  recipientId: string | null;
  recipientEmail: string;
  subject: string;
  body: string;
  templateKey?: string;
  templateLanguage?: string;
  templatePlaceholders?: Record<string, unknown>;
  scheduledAt?: string | null;
  attachments?: string[];
  signatureHtml?: string | null;
  cc?: string[];
  bcc?: string[];
}

/**
 * Interface structure detailing the properties and attributes of Attachment Upload Result Json.
 */
export interface AttachmentUploadResultJson {
  fileName: string;
  size: number;
  url: string;
  contentType: string;
}
