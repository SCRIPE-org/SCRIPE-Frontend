/**
 * Email Service Implementation
 *
 * Handles all email API calls. Returns raw JSON / Model types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module email-composer/data
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
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
import { EMAIL_ENDPOINTS } from "./email.endpoints";

/**
 * Http API network service for email.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class EmailService implements IEmailService {
  constructor(private readonly api: IApiService) {}

  async searchRecipients(query: string): Promise<EmailRecipientJson[]> {
    const url = buildUrl(EMAIL_ENDPOINTS.SEARCH_RECIPIENTS, { search: query });
    return this.api.get<EmailRecipientJson[]>(url);
  }

  async send(data: SendManualEmailJson): Promise<void> {
    await this.api.post(EMAIL_ENDPOINTS.SEND, data);
  }

  async getSentHistory(params: ServiceSentHistoryParams): Promise<SentEmailListResponseJson> {
    const url = buildUrl(
      EMAIL_ENDPOINTS.SENT_HISTORY,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get(url);
  }

  async cancelEmail(id: string): Promise<void> {
    await this.api.delete(EMAIL_ENDPOINTS.CANCEL(id));
  }

  async resendEmail(id: string): Promise<{ id: string }> {
    return this.api.post(EMAIL_ENDPOINTS.RESEND(id), {});
  }

  async getEmailTemplates(
    params: ServiceEmailTemplateListParams
  ): Promise<EmailTemplateListResponseJson> {
    const url = buildUrl(EMAIL_ENDPOINTS.MESSAGE_TEMPLATES_LIST, {
      ...params,
      channel: "Email",
    } as unknown as Record<string, string | number | boolean | null | undefined>);
    return this.api.get<EmailTemplateListResponseJson>(url);
  }

  async uploadAttachment(file: File): Promise<AttachmentUploadResultJson> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post(EMAIL_ENDPOINTS.UPLOAD_ATTACHMENT, formData);
  }
}
