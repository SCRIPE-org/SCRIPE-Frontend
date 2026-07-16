/**
 * CustomField Service
 *
 * Handles all API calls for the CustomFields module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, CUSTOMFIELDS_ENDPOINTS } from "@core/config/api-endpoints";
import {
  CustomFieldModel,
  type CustomFieldJson,
  type CustomFieldListResponseJson,
} from "../models/CustomFieldModel";
import type {
  ICustomFieldService,
  CustomFieldListResult,
} from "../../domain/interfaces/ICustomFieldService";

const BASE_URL = CUSTOMFIELDS_ENDPOINTS.CUSTOM_FIELDS.LIST;

export class CustomFieldService implements ICustomFieldService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    entityTypeKey?: string;
  }): Promise<CustomFieldListResult> {
    const url = buildUrl(BASE_URL, {
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
    const json = await this.api.get<CustomFieldJson>(`${BASE_URL}/${id}`);
    return CustomFieldModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(BASE_URL, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(`${BASE_URL}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${BASE_URL}/${id}`);
  }
}
