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
 * Interface structure detailing the properties and attributes of Service Sent History Params.
 */
export interface ServiceSentHistoryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

/**
 * Interface structure detailing the properties and attributes of Service Email Template List Params.
 */
export interface ServiceEmailTemplateListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Interface defining operations for the Email network service.
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
