/**
 * ICustomFieldService Interface
 *
 * Defines the contract for CustomField API operations.
 * Implemented by CustomFieldService in the data layer.
 */
import type { CustomFieldModel, EntityTypeItemJson } from "../../data/models/CustomFieldModel";
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
export interface CustomFieldListResult {
  items: CustomFieldModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export interface ICustomFieldService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    entityTypeKey?: string;
  }): Promise<CustomFieldListResult>;
  getById(id: string): Promise<CustomFieldModel>;
  getEntityTypes(): Promise<EntityTypeItemJson[]>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  /**
   * @param force - Wave 6 row 6.3. Without it the server refuses with 409 when the definition still
   *   holds values. Pass true only after the user has confirmed against the real counts.
   */
  delete(id: string, force?: boolean): Promise<void>;
  getHistory(id: string, page: number, pageSize: number): Promise<FieldHistoryPage>;
  getUsage(id: string): Promise<FieldUsage>;
  /** `GET /custom-fields/versions/{id}` -- the field's version chain. See `FieldVersionsResponse`. */
  getVersions(id: string): Promise<FieldVersionsResponse>;
  /** `POST /custom-fields/versions/{customFieldId}/draft` -- mints draft version. */
  createFieldVersionDraft(customFieldId: string): Promise<CreateFieldVersionDraftResult>;
  /** `POST /custom-fields/versions/{customFieldId}/publish` -- publishes draft version. */
  publishFieldVersion(customFieldId: string): Promise<PublishFieldVersionResult>;
  /** `POST /custom-fields/versions/{customFieldId}/discard-draft` -- discards draft version. */
  discardFieldVersionDraft(customFieldId: string): Promise<DiscardFieldVersionDraftResult>;
  /** `GET /custom-fields/visibility-rules?customFieldId={customFieldId}` -- the field's visibility rules. */
  getVisibilityRules(customFieldId: string): Promise<FieldVisibilityRuleAdmin[]>;
  createVisibilityRule(data: CreateFieldVisibilityRuleRequest): Promise<{ id: string }>;
  updateVisibilityRule(id: string, data: UpdateFieldVisibilityRuleRequest): Promise<void>;
  deleteVisibilityRule(id: string): Promise<void>;
  /** `POST /custom-fields/{id}/change-type` -- converts stored values to target type. */
  changeFieldType(id: string, data: ChangeFieldTypeRequest): Promise<ChangeFieldTypeResult>;
  /** `POST /custom-fields/change-type/{jobRunId}/rollback` -- restores converted values. */
  rollbackFieldTypeChange(jobRunId: string): Promise<RollbackFieldTypeChangeResult>;
}

