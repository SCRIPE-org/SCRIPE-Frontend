/**
 * Message Template Service Interface
 *
 * Defines the contract for Message Template API operations.
 * Service returns JSON/Model types, not domain entities.
 *
 * @module message-templates/domain
 */
import type {
      MessageTemplateListResponse,
      MessageTemplateJson,
      CreateMessageTemplateJson,
      UpdateMessageTemplateJson,
      PreviewTemplateJson,
      PreviewTemplateResponseJson,
} from "../types/MessageTemplateTypes";

export interface ServiceTemplateListParams {
      page: number;
      pageSize: number;
      search?: string;
}

export interface IMessageTemplateService {
      getAll(params: ServiceTemplateListParams): Promise<MessageTemplateListResponse>;
      getById(id: string): Promise<MessageTemplateJson>;
      create(data: CreateMessageTemplateJson): Promise<{ id: string }>;
      update(id: string, data: UpdateMessageTemplateJson): Promise<void>;
      delete(id: string): Promise<void>;
      clone(id: string, suffix?: string): Promise<{ id: string }>;
      preview(data: PreviewTemplateJson): Promise<PreviewTemplateResponseJson>;
}
