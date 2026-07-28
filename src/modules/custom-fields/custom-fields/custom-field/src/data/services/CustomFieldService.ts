/**
 * CustomField Service
 *
 * Handles all API calls for the CustomFields module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import {
  CustomFieldModel,
  type CustomFieldJson,
  type CustomFieldListResponseJson,
  type EntityTypeItemJson,
} from "../models/CustomFieldModel";
import type {
  ICustomFieldService,
  CustomFieldListResult,
} from "../../domain/interfaces/ICustomFieldService";
import { CUSTOM_FIELD_ENDPOINTS } from "./custom-field.endpoints";

export class CustomFieldService implements ICustomFieldService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    entityTypeKey?: string;
  }): Promise<CustomFieldListResult> {
    const url = buildUrl(CUSTOM_FIELD_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      entityTypeKey: params.entityTypeKey,
    });

    const response = await this.api.get<CustomFieldListResponseJson>(url);

    return {
      items: response.items.map((json) => CustomFieldModel.fromListJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<CustomFieldModel> {
    const json = await this.api.get<CustomFieldJson>(CUSTOM_FIELD_ENDPOINTS.BY_ID(id));
    return CustomFieldModel.fromJson(json);
  }

  async getEntityTypes(): Promise<EntityTypeItemJson[]> {
    return this.api.get<EntityTypeItemJson[]>(CUSTOM_FIELD_ENDPOINTS.ENTITY_TYPES);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(CUSTOM_FIELD_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(CUSTOM_FIELD_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(CUSTOM_FIELD_ENDPOINTS.DELETE(id));
  }
}
