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
  FieldVisibilityRuleAdmin,
  CreateFieldVisibilityRuleRequest,
  UpdateFieldVisibilityRuleRequest,
  ChangeFieldTypeRequest,
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
  CreateFieldVersionDraftResult,
  PublishFieldVersionResult,
  DiscardFieldVersionDraftResult,
} from "../../domain/entities/FieldInsight";

/**
 * Documentation for module export
 */
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
    return this.api.get<FieldHistoryPage>(CUSTOM_FIELD_ENDPOINTS.HISTORY(id, page, pageSize));
  }

  async getUsage(id: string): Promise<FieldUsage> {
    return this.api.get<FieldUsage>(CUSTOM_FIELD_ENDPOINTS.USAGE(id));
  }

  async getVersions(id: string): Promise<FieldVersionsResponse> {
    // Returned as-is, same as getHistory/getUsage above: a display-only projection with no round
    // trip to lose anything on.
    return this.api.get<FieldVersionsResponse>(CUSTOM_FIELD_ENDPOINTS.VERSIONS(id));
  }

  async createFieldVersionDraft(customFieldId: string): Promise<CreateFieldVersionDraftResult> {
    return this.api.post<CreateFieldVersionDraftResult>(
      CUSTOM_FIELD_ENDPOINTS.CREATE_VERSION_DRAFT(customFieldId),
      {}
    );
  }

  async publishFieldVersion(customFieldId: string): Promise<PublishFieldVersionResult> {
    return this.api.post<PublishFieldVersionResult>(
      CUSTOM_FIELD_ENDPOINTS.PUBLISH_VERSION(customFieldId),
      {}
    );
  }

  async discardFieldVersionDraft(customFieldId: string): Promise<DiscardFieldVersionDraftResult> {
    return this.api.post<DiscardFieldVersionDraftResult>(
      CUSTOM_FIELD_ENDPOINTS.DISCARD_VERSION_DRAFT(customFieldId),
      {}
    );
  }

  async getVisibilityRules(customFieldId: string): Promise<FieldVisibilityRuleAdmin[]> {
    return this.api.get<FieldVisibilityRuleAdmin[]>(
      CUSTOM_FIELD_ENDPOINTS.VISIBILITY_RULES(customFieldId)
    );
  }

  async createVisibilityRule(data: CreateFieldVisibilityRuleRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(CUSTOM_FIELD_ENDPOINTS.CREATE_VISIBILITY_RULE, data);
  }

  async updateVisibilityRule(id: string, data: UpdateFieldVisibilityRuleRequest): Promise<void> {
    await this.api.put(CUSTOM_FIELD_ENDPOINTS.UPDATE_VISIBILITY_RULE(id), data);
  }

  async deleteVisibilityRule(id: string): Promise<void> {
    await this.api.delete(CUSTOM_FIELD_ENDPOINTS.DELETE_VISIBILITY_RULE(id));
  }

  async changeFieldType(id: string, data: ChangeFieldTypeRequest): Promise<ChangeFieldTypeResult> {
    return this.api.post<ChangeFieldTypeResult>(CUSTOM_FIELD_ENDPOINTS.CHANGE_TYPE(id), data);
  }

  async rollbackFieldTypeChange(jobRunId: string): Promise<RollbackFieldTypeChangeResult> {
    return this.api.post<RollbackFieldTypeChangeResult>(
      CUSTOM_FIELD_ENDPOINTS.ROLLBACK_CHANGE_TYPE(jobRunId),
      {}
    );
  }
}
