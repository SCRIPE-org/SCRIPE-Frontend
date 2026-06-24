import type { PagedResult } from "@core/interfaces/common.interface";
import type { MessageTemplate } from "../entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
} from "../entities/MessageTemplateRequests";

/**
 * Repository layer implementing client request queries for i message template.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
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
