/**
 * Message Template Service Implementation
 *
 * Handles all message template API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module message-templates/data
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  IMessageTemplateService,
  ServiceTemplateListParams,
} from "../../domain/interfaces/IMessageTemplateService";
import type {
  MessageTemplateListResponse,
  MessageTemplateJson,
  CreateMessageTemplateJson,
  UpdateMessageTemplateJson,
  PreviewTemplateJson,
  PreviewTemplateResponseJson,
} from "../models/MessageTemplateModel";
import { MESSAGE_TEMPLATE_ENDPOINTS } from "./message-template.endpoints";

/**
 * Http API network service for message template.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class MessageTemplateService implements IMessageTemplateService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ServiceTemplateListParams): Promise<MessageTemplateListResponse> {
    const url = buildUrl(
      MESSAGE_TEMPLATE_ENDPOINTS.LIST,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
    return this.api.get<MessageTemplateListResponse>(url);
  }

  async getById(id: string): Promise<MessageTemplateJson> {
    return this.api.get<MessageTemplateJson>(MESSAGE_TEMPLATE_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateMessageTemplateJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MESSAGE_TEMPLATE_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateMessageTemplateJson): Promise<void> {
    await this.api.put(MESSAGE_TEMPLATE_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MESSAGE_TEMPLATE_ENDPOINTS.DELETE(id));
  }

  async clone(id: string, suffix?: string): Promise<{ id: string }> {
    const url = buildUrl(MESSAGE_TEMPLATE_ENDPOINTS.CLONE(id), suffix ? { suffix } : undefined);
    return this.api.post<{ id: string }>(url, {});
  }

  async preview(data: PreviewTemplateJson): Promise<PreviewTemplateResponseJson> {
    return this.api.post<PreviewTemplateResponseJson>(MESSAGE_TEMPLATE_ENDPOINTS.PREVIEW, data);
  }

  async resetDesign(id: string): Promise<void> {
    await this.api.post(MESSAGE_TEMPLATE_ENDPOINTS.RESET_DESIGN(id), {});
  }
}
