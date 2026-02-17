/**
 * Email Repository Implementation
 *
 * Uses EmailService + EmailMapper to convert between Models and Entities.
 *
 * @module email-composer/data
 */
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";
import type { IEmailService } from "../../domain/interfaces/IEmailService";
import type {
      EmailRecipient,
      SentEmail,
      EmailTemplateListResponse,
} from "../../domain/entities/Email";
import type { SendManualEmailPayload } from "../../domain/entities/EmailRequests";
import { EmailMapper } from "../mappers/EmailMapper";

export class EmailRepository implements IEmailRepository {
      constructor(private readonly service: IEmailService) { }

      async searchRecipients(query: string): Promise<EmailRecipient[]> {
            const jsonList = await this.service.searchRecipients(query);
            return jsonList.map((json) => EmailMapper.toRecipientEntity(json));
      }

      async send(data: SendManualEmailPayload): Promise<void> {
            await this.service.send(data);
      }

      async getSentHistory(params: {
            page: number;
            pageSize: number;
            search?: string;
            status?: string;
      }): Promise<{ items: SentEmail[]; totalCount: number }> {
            const result = await this.service.getSentHistory(params);
            return {
                  items: result.items.map((json) => EmailMapper.toSentEmailEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      async cancelEmail(id: string): Promise<void> {
            await this.service.cancelEmail(id);
      }

      async resendEmail(id: string): Promise<{ id: string }> {
            return this.service.resendEmail(id);
      }

      async getEmailTemplates(params: {
            page: number;
            pageSize: number;
            search?: string;
      }): Promise<EmailTemplateListResponse> {
            const result = await this.service.getEmailTemplates(params);
            return {
                  items: result.items.map((json) => EmailMapper.toTemplateEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      async uploadAttachment(file: File): Promise<{
            fileName: string;
            size: number;
            url: string;
            contentType: string;
      }> {
            return this.service.uploadAttachment(file);
      }
}
