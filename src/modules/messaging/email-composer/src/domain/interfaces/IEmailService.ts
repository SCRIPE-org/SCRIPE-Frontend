/**
 * Email Service Interface
 *
 * Defines the contract for Email API operations.
 * Service returns JSON/Models (DTOs), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module email-composer/domain
 */
import type {
  EmailRecipientJson,
  SentEmailListResponseJson,
  EmailTemplateListResponseJson,
  SendManualEmailJson,
  AttachmentUploadResultJson,
} from "../types/EmailTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for service sent history params.
 */
export interface ServiceSentHistoryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for service email template list params.
 */
export interface ServiceEmailTemplateListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Http API network service for i email.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IEmailService {
  searchRecipients(query: string): Promise<EmailRecipientJson[]>;
  send(data: SendManualEmailJson): Promise<void>;
  getSentHistory(params: ServiceSentHistoryParams): Promise<SentEmailListResponseJson>;
  cancelEmail(id: string): Promise<void>;
  resendEmail(id: string): Promise<{ id: string }>;
  getEmailTemplates(params: ServiceEmailTemplateListParams): Promise<EmailTemplateListResponseJson>;
  uploadAttachment(file: File): Promise<AttachmentUploadResultJson>;
}
