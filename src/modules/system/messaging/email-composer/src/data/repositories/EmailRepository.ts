import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";
import type { EmailRecipient, SendManualEmailPayload, SentEmail } from "../../domain/entities/Email";
import type { IEmailService } from "../services/EmailService";

export class EmailRepository implements IEmailRepository {
      constructor(private readonly service: IEmailService) { }

      async searchRecipients(query: string): Promise<EmailRecipient[]> {
            return this.service.searchRecipients(query);
      }

      async send(data: SendManualEmailPayload): Promise<void> {
            await this.service.send(data);
      }

      async getSentHistory(params: { page: number; pageSize: number }): Promise<{ items: SentEmail[]; totalCount: number }> {
            return this.service.getSentHistory(params);
      }
}
