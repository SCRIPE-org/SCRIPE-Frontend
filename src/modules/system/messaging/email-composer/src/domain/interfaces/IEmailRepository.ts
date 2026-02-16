import type { EmailRecipient, SendEmailRequest, SentEmail } from "../entities/Email";

export interface IEmailRepository {
      searchRecipients(query: string): Promise<EmailRecipient[]>;
      send(data: SendEmailRequest): Promise<void>;
      getSentHistory(params: { page: number; pageSize: number }): Promise<{ items: SentEmail[]; totalCount: number }>;
}
