import type { EmailRecipient, SendManualEmailPayload, SentEmail, EmailTemplateListResponse } from "../entities/Email";

export interface IEmailRepository {
      searchRecipients(query: string): Promise<EmailRecipient[]>;
      send(data: SendManualEmailPayload): Promise<void>;
      getSentHistory(params: { page: number; pageSize: number; search?: string; status?: string }): Promise<{ items: SentEmail[]; totalCount: number }>;
      cancelEmail(id: string): Promise<void>;
      resendEmail(id: string): Promise<{ id: string }>;
      getEmailTemplates(params: { page: number; pageSize: number; search?: string }): Promise<EmailTemplateListResponse>;
}
