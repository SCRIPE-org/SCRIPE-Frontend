import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { EmailRecipient, SentEmail } from "../../domain/entities/Email";

export interface IEmailService {
      searchRecipients(query: string): Promise<EmailRecipient[]>;
      send(data: Record<string, unknown>): Promise<void>;
      getSentHistory(params: { page: number; pageSize: number }): Promise<{ items: SentEmail[]; totalCount: number }>;
}

export class EmailService implements IEmailService {
      constructor(private readonly api: IApiService) { }

      async searchRecipients(query: string): Promise<EmailRecipient[]> {
            const url = buildUrl(API_ENDPOINTS.EMAILS.SEARCH_RECIPIENTS, { query });
            return this.api.get<EmailRecipient[]>(url);
      }

      async send(data: Record<string, unknown>): Promise<void> {
            await this.api.post(API_ENDPOINTS.EMAILS.SEND, data);
      }

      async getSentHistory(params: { page: number; pageSize: number }): Promise<{ items: SentEmail[]; totalCount: number }> {
            const url = buildUrl(API_ENDPOINTS.EMAILS.SENT_HISTORY, params);
            return this.api.get(url);
      }
}
