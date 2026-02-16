import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { MessageTemplateListResponse, MessageTemplateJson } from "../models/MessageTemplateModel";

export interface IMessageTemplateService {
      getAll(params: { page: number; pageSize: number; search?: string }): Promise<MessageTemplateListResponse>;
      getById(id: string): Promise<MessageTemplateJson>;
      create(data: Record<string, unknown>): Promise<{ id: string }>;
      update(id: string, data: Record<string, unknown>): Promise<void>;
      delete(id: string): Promise<void>;
      clone(id: string, suffix?: string): Promise<{ id: string }>;
      preview(data: Record<string, unknown>): Promise<{ subject: string | null; body: string }>;
}

export class MessageTemplateService implements IMessageTemplateService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: { page: number; pageSize: number; search?: string }): Promise<MessageTemplateListResponse> {
            const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.LIST, params);
            return this.api.get<MessageTemplateListResponse>(url);
      }

      async getById(id: string): Promise<MessageTemplateJson> {
            return this.api.get<MessageTemplateJson>(API_ENDPOINTS.MESSAGE_TEMPLATES.BY_ID(id));
      }

      async create(data: Record<string, unknown>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.MESSAGE_TEMPLATES.CREATE, data);
      }

      async update(id: string, data: Record<string, unknown>): Promise<void> {
            await this.api.put(API_ENDPOINTS.MESSAGE_TEMPLATES.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.MESSAGE_TEMPLATES.DELETE(id));
      }

      async clone(id: string, suffix?: string): Promise<{ id: string }> {
            const url = buildUrl(API_ENDPOINTS.MESSAGE_TEMPLATES.CLONE(id), suffix ? { suffix } : undefined);
            return this.api.post<{ id: string }>(url, {});
      }

      async preview(data: Record<string, unknown>): Promise<{ subject: string | null; body: string }> {
            return this.api.post<{ subject: string | null; body: string }>(API_ENDPOINTS.MESSAGE_TEMPLATES.PREVIEW, data);
      }
}
