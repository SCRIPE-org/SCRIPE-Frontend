import type { PagedResult } from "@core/interfaces/common.interface";
import type { MessageTemplate } from "../entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
} from "../entities/MessageTemplateRequests";

export interface IMessageTemplateRepository {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PagedResult<MessageTemplate>>;
  getById(id: string): Promise<MessageTemplate>;
  create(data: CreateMessageTemplateRequest): Promise<string>;
  update(id: string, data: UpdateMessageTemplateRequest): Promise<void>;
  delete(id: string): Promise<void>;
  clone(id: string, suffix?: string): Promise<string>;
  preview(data: PreviewTemplateRequest): Promise<PreviewTemplateResponse>;
}
