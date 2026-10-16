/**
 * FieldGroup Submodule Public Exports (Wave 5 row 5.2)
 */

// Views
export { FieldGroupListView } from "./src/presentation/views/FieldGroupListView";

// ViewModels / hooks reused by the custom-field definition form's group picker
export {
  useFieldGroupOptions,
  NO_FIELD_GROUP_VALUE,
} from "./src/presentation/viewmodels/useFieldGroupOptions";
export { fieldGroupsQueryKey } from "./src/presentation/viewmodels/useFieldGroupViewModel";

// Entities
export { FieldGroup } from "./src/domain/entities/FieldGroup";
export type { FieldGroupData } from "./src/domain/entities/FieldGroup";

// Interfaces
export type { IFieldGroupRepository } from "./src/domain/interfaces/IFieldGroupRepository";
export type { IFieldGroupService } from "./src/domain/interfaces/IFieldGroupService";
