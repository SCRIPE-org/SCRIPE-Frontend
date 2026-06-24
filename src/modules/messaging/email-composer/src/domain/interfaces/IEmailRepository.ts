import type { EmailRecipient, SentEmail, EmailTemplateListResponse } from "../entities/Email";
import type { SendManualEmailPayload } from "../entities/EmailRequests";

/**
 * Repository layer implementing client request queries for i email.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IEmailRepository {
  searchRecipients(query: string): Promise<EmailRecipient[]>;
  send(data: SendManualEmailPayload): Promise<void>;
  getSentHistory(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<{ items: SentEmail[]; totalCount: number }>;
  cancelEmail(id: string): Promise<void>;
  resendEmail(id: string): Promise<{ id: string }>;
  getEmailTemplates(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<EmailTemplateListResponse>;
  uploadAttachment(file: File): Promise<{
    fileName: string;
    size: number;
    url: string;
    contentType: string;
  }>;
}
