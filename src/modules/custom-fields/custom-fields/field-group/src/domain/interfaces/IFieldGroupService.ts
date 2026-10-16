/**
 * IFieldGroupService Interface
 *
 * Contract for the field-group API operations (Wave 5 row 5.2).
 * Implemented by FieldGroupService in the data layer; speaks Models, not
 * Entities.
 */
import type {
  FieldGroupModel,
  CreateFieldGroupRequestJson,
  UpdateFieldGroupRequestJson,
  ReorderFieldGroupsRequestJson,
} from "../../data/models/FieldGroupModel";

/**
 * Documentation for module export
 */
export interface IFieldGroupService {
  /**
   * `GET /v1/custom-fields/field-groups?entityTypeKey=...`
   *
   * `entityTypeKey` is REQUIRED by the endpoint -- there is no "all groups"
   * read. Returns the groups already ordered for display (SortOrder, then
   * LabelEn), so callers must not re-sort by anything else.
   */
  getByEntityType(entityTypeKey: string): Promise<FieldGroupModel[]>;
  create(data: CreateFieldGroupRequestJson): Promise<{ id: string }>;
  update(id: string, data: UpdateFieldGroupRequestJson): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(data: ReorderFieldGroupsRequestJson): Promise<void>;
}
