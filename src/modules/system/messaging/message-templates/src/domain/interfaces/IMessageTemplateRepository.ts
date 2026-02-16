import type { PagedResult } from "@modules/system/core/domain/types";
import type {
      MessageTemplate,
      CreateMessageTemplateRequest,
      UpdateMessageTemplateRequest,
      PreviewTemplateRequest,
      PreviewTemplateResponse,
} from "../entities/MessageTemplate";

export interface IMessageTemplateRepository {
      getAll(params: { page: number; pageSize: number; search?: string }): Promise<PagedResult<MessageTemplate>>;
      getById(id: string): Promise<MessageTemplate>;
      create(data: CreateMessageTemplateRequest): Promise<string>;
      update(id: string, data: UpdateMessageTemplateRequest): Promise<void>;
      delete(id: string): Promise<void>;
      clone(id: string, suffix?: string): Promise<string>;
      preview(data: PreviewTemplateRequest): Promise<PreviewTemplateResponse>;
}
