/**
 * ICustomFieldRepository Interface
 *
 * Defines the contract for CustomField data access.
 * Works with domain entities, not DTOs.
 */
import type { CustomField, EntityTypeInfo } from "../entities/CustomField";
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
} from "../entities/FieldInsight";

/**
 * Documentation for module export
 */
export interface CustomFieldListParams {
  page: number;
  pageSize: number;
  search?: string;
  entityTypeKey?: string;
}

/**
 * Documentation for module export
 */
export interface ICustomFieldRepository {
  getAll(
    params: CustomFieldListParams
  ): Promise<{
    items: CustomField[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<CustomField>;
  getEntityTypes(): Promise<EntityTypeInfo[]>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  /** @param force - See ICustomFieldService.delete. */
  delete(id: string, force?: boolean): Promise<void>;
  getHistory(id: string, page: number, pageSize: number): Promise<FieldHistoryPage>;
  getUsage(id: string): Promise<FieldUsage>;
  getVersions(id: string): Promise<FieldVersionsResponse>;
  createFieldVersionDraft(customFieldId: string): Promise<CreateFieldVersionDraftResult>;
  publishFieldVersion(customFieldId: string): Promise<PublishFieldVersionResult>;
  discardFieldVersionDraft(customFieldId: string): Promise<DiscardFieldVersionDraftResult>;
  getVisibilityRules(customFieldId: string): Promise<FieldVisibilityRuleAdmin[]>;
  createVisibilityRule(data: CreateFieldVisibilityRuleRequest): Promise<string>;
  updateVisibilityRule(id: string, data: UpdateFieldVisibilityRuleRequest): Promise<void>;
  deleteVisibilityRule(id: string): Promise<void>;
  changeFieldType(id: string, data: ChangeFieldTypeRequest): Promise<ChangeFieldTypeResult>;
  rollbackFieldTypeChange(jobRunId: string): Promise<RollbackFieldTypeChangeResult>;
}

