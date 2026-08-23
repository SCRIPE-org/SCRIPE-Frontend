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
import type {
  FieldHistoryPage,
  FieldUsage,
  FieldVersionsResponse,
} from "../../domain/entities/FieldInsight";

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
      page: response.pageNumber,
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

  async delete(id: string, force?: boolean): Promise<void> {
    await this.api.delete(CUSTOM_FIELD_ENDPOINTS.DELETE(id, force));
  }

  async getHistory(id: string, page: number, pageSize: number): Promise<FieldHistoryPage> {
    // Returned as-is: display-only projections with no round trip to lose anything on. See
    // FieldInsight.ts for why these skip the entity/model/mapper ceremony CustomField needs.
    return this.api.get<FieldHistoryPage>(
      CUSTOM_FIELD_ENDPOINTS.HISTORY(id, page, pageSize)
    );
  }

  async getUsage(id: string): Promise<FieldUsage> {
    return this.api.get<FieldUsage>(CUSTOM_FIELD_ENDPOINTS.USAGE(id));
  }

  async getVersions(id: string): Promise<FieldVersionsResponse> {
    // Returned as-is, same as getHistory/getUsage above: a display-only projection with no round
    // trip to lose anything on.
    return this.api.get<FieldVersionsResponse>(CUSTOM_FIELD_ENDPOINTS.VERSIONS(id));
  }
}
