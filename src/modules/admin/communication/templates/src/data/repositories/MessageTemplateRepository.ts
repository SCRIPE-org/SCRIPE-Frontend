/**
 * Message Template Repository Implementation
 *
 * Uses MessageTemplateService + MessageTemplateMapper.
 * All reads convert JSON → Entity via Mapper.
 * All writes convert Request → JSON via Mapper.
 *
 * @module message-templates/data
 */
import type { IMessageTemplateRepository } from "../../domain/interfaces/IMessageTemplateRepository";
import type { MessageTemplate } from "../../domain/entities/MessageTemplate";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
} from "../../domain/entities/MessageTemplateRequests";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { IMessageTemplateService } from "../../domain/interfaces/IMessageTemplateService";
import { MessageTemplateMapper } from "../mappers/MessageTemplateMapper";

/**
 * Repository layer implementing client request queries for message template.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class MessageTemplateRepository implements IMessageTemplateRepository {
  constructor(private readonly service: IMessageTemplateService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PagedResult<MessageTemplate>> {
    const response = await this.service.getAll(params);
    const totalPages = Math.ceil(response.totalCount / params.pageSize);
    return {
      items: response.items.map(MessageTemplateMapper.toEntity),
      totalCount: response.totalCount,
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalPages,
      hasNextPage: response.pageNumber < totalPages,
      hasPreviousPage: response.pageNumber > 1,
    };
  }

  async getById(id: string): Promise<MessageTemplate> {
    const json = await this.service.getById(id);
    return MessageTemplateMapper.toEntity(json);
  }

  async create(data: CreateMessageTemplateRequest): Promise<string> {
    const json = MessageTemplateMapper.toCreateJson(data);
    const result = await this.service.create(json);
    return result.id;
  }

  async update(id: string, data: UpdateMessageTemplateRequest): Promise<void> {
    const json = MessageTemplateMapper.toUpdateJson(data);
    await this.service.update(id, json);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async clone(id: string, suffix?: string): Promise<string> {
    const result = await this.service.clone(id, suffix);
    return result.id;
  }

  async preview(data: PreviewTemplateRequest): Promise<PreviewTemplateResponse> {
    const json = MessageTemplateMapper.toPreviewJson(data);
    return this.service.preview(json);
  }
}
