import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { EmailRecipient, SendManualEmailPayload, SentEmail, EmailTemplateListResponse } from "../../domain/entities/Email";

export interface IEmailService {
      searchRecipients(query: string): Promise<EmailRecipient[]>;
      send(data: SendManualEmailPayload): Promise<void>;
      getSentHistory(params: { page: number; pageSize: number; search?: string; status?: string }): Promise<{ items: SentEmail[]; totalCount: number }>;
      cancelEmail(id: string): Promise<void>;
      resendEmail(id: string): Promise<{ id: string }>;
      getEmailTemplates(params: { page: number; pageSize: number; search?: string }): Promise<EmailTemplateListResponse>;
      uploadAttachment(file: File): Promise<{ fileName: string; size: number; url: string; contentType: string }>;
}

export class EmailService implements IEmailService {
      constructor(private readonly api: IApiService) { }

      async searchRecipients(query: string): Promise<EmailRecipient[]> {
            const url = buildUrl(API_ENDPOINTS.EMAILS.SEARCH_RECIPIENTS, { search: query });
            return this.api.get<EmailRecipient[]>(url);
      }

      async send(data: SendManualEmailPayload): Promise<void> {
            await this.api.post(API_ENDPOINTS.EMAILS.SEND, data);
      }

      async getSentHistory(params: { page: number; pageSize: number; search?: string; status?: string }): Promise<{ items: SentEmail[]; totalCount: number }> {
            const url = buildUrl(API_ENDPOINTS.EMAILS.SENT_HISTORY, params);
            return this.api.get(url);
      }

      async cancelEmail(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.EMAILS.CANCEL(id));
      }

      async resendEmail(id: string): Promise<{ id: string }> {
            return this.api.post(API_ENDPOINTS.EMAILS.RESEND(id), {});
      }

      async getEmailTemplates(params: { page: number; pageSize: number; search?: string }): Promise<EmailTemplateListResponse> {
            const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.LIST, { ...params, channel: "Email" });
            return this.api.get<EmailTemplateListResponse>(url);
      }

      async uploadAttachment(file: File): Promise<{ fileName: string; size: number; url: string; contentType: string }> {
            const formData = new FormData();
            formData.append("file", file);
            return this.api.post(API_ENDPOINTS.EMAILS.UPLOAD_ATTACHMENT, formData);
      }
}
