import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";
import type { EmailRecipient, SendManualEmailPayload, SentEmail, EmailTemplateListResponse } from "../../domain/entities/Email";
import type { IEmailService } from "../services/EmailService";

export class EmailRepository implements IEmailRepository {
      constructor(private readonly service: IEmailService) { }

      async searchRecipients(query: string): Promise<EmailRecipient[]> {
            return this.service.searchRecipients(query);
      }

      async send(data: SendManualEmailPayload): Promise<void> {
            await this.service.send(data);
      }

      async getSentHistory(params: { page: number; pageSize: number; search?: string; status?: string }): Promise<{ items: SentEmail[]; totalCount: number }> {
            return this.service.getSentHistory(params);
      }

      async cancelEmail(id: string): Promise<void> {
            await this.service.cancelEmail(id);
      }

      async resendEmail(id: string): Promise<{ id: string }> {
            return this.service.resendEmail(id);
      }

      async getEmailTemplates(params: { page: number; pageSize: number; search?: string }): Promise<EmailTemplateListResponse> {
            return this.service.getEmailTemplates(params);
      }
}
