import type { EmailRecipient, SendManualEmailPayload, SentEmail } from "../entities/Email";

export interface IEmailRepository {
      searchRecipients(query: string): Promise<EmailRecipient[]>;
      send(data: SendManualEmailPayload): Promise<void>;
      getSentHistory(params: { page: number; pageSize: number }): Promise<{ items: SentEmail[]; totalCount: number }>;
}
