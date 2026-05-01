/**
 * Email Service Implementation
 *
 * Handles all email API calls. Returns raw JSON / Model types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module email-composer/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  IEmailService,
  ServiceSentHistoryParams,
  ServiceEmailTemplateListParams,
} from "../../domain/interfaces/IEmailService";
import type {
  EmailRecipientJson,
  SentEmailListResponseJson,
  EmailTemplateListResponseJson,
  SendManualEmailJson,
  AttachmentUploadResultJson,
} from "../models/EmailModel";

export class EmailService implements IEmailService {
  constructor(private readonly api: IApiService) {}

  async searchRecipients(query: string): Promise<EmailRecipientJson[]> {
    const url = buildUrl(API_ENDPOINTS.EMAILS.SEARCH_RECIPIENTS, { search: query });
    return this.api.get<EmailRecipientJson[]>(url);
  }

  async send(data: SendManualEmailJson): Promise<void> {
    await this.api.post(API_ENDPOINTS.EMAILS.SEND, data);
  }

  async getSentHistory(params: ServiceSentHistoryParams): Promise<SentEmailListResponseJson> {
    const url = buildUrl(
      API_ENDPOINTS.EMAILS.SENT_HISTORY,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async cancelEmail(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.EMAILS.CANCEL(id));
  }

  async resendEmail(id: string): Promise<{ id: string }> {
    return this.api.post(API_ENDPOINTS.EMAILS.RESEND(id), {});
  }

  async getEmailTemplates(
    params: ServiceEmailTemplateListParams
  ): Promise<EmailTemplateListResponseJson> {
    const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.LIST, {
      ...params,
      channel: "Email",
    } as unknown as Record<string, string | number | boolean | null | undefined>);
    return this.api.get<EmailTemplateListResponseJson>(url);
  }

  async uploadAttachment(file: File): Promise<AttachmentUploadResultJson> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post(API_ENDPOINTS.EMAILS.UPLOAD_ATTACHMENT, formData);
  }
}
