/**
 * Message Template Service Implementation
 *
 * Handles all message template API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module message-templates/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
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

export class MessageTemplateService implements IMessageTemplateService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: ServiceTemplateListParams): Promise<MessageTemplateListResponse> {
            const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.LIST, params as unknown as Record<string, string | number | boolean | null | undefined>);
            return this.api.get<MessageTemplateListResponse>(url);
      }

      async getById(id: string): Promise<MessageTemplateJson> {
            return this.api.get<MessageTemplateJson>(API_ENDPOINTS.MESSAGE_TEMPLATES.BY_ID(id));
      }

      async create(data: CreateMessageTemplateJson): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.MESSAGE_TEMPLATES.CREATE, data);
      }

      async update(id: string, data: UpdateMessageTemplateJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.MESSAGE_TEMPLATES.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.MESSAGE_TEMPLATES.DELETE(id));
      }

      async clone(id: string, suffix?: string): Promise<{ id: string }> {
            const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.CLONE(id), suffix ? { suffix } : undefined);
            return this.api.post<{ id: string }>(url, {});
      }

      async preview(data: PreviewTemplateJson): Promise<PreviewTemplateResponseJson> {
            return this.api.post<PreviewTemplateResponseJson>(API_ENDPOINTS.MESSAGE_TEMPLATES.PREVIEW, data);
      }
}
