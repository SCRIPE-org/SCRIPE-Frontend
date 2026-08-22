/**
 * CustomField Submodule Public Exports
 *
 * This file is the submodule's whole external surface. Nothing outside
 * `custom-field/` may import a path under `custom-field/src/` -- the same
 * Dependency Rule that already stops `core` importing `src/modules`, applied one
 * level down. Before this barrel existed it listed six exports and none of the
 * things consumers actually needed, so nine other modules had no choice but to
 * reach past it into `src/presentation/*`; any reshuffle inside then broke all
 * nine at once, which is why the folder was never tidied.
 *
 * WHAT BELONGS HERE. Exactly what a consumer outside this submodule uses today,
 * named one export at a time. A barrel that re-exported the internals wholesale
 * (`export * from "./src/presentation/..."`) would be the deep import with extra
 * steps: it would publish every helper, every private prop type and every future
 * addition by default, and the boundary would be back to being aspirational.
 * Notably absent, and deliberately:
 *
 *   - The data layer. `CustomFieldService` / `CustomFieldRepository` are
 *     constructed only by the module container at `../di.ts`, which is this
 *     submodule's composition root rather than a consumer, and which imports
 *     them by relative path. Publishing them here would both invite a view to
 *     new up its own service and create a real import cycle -- this barrel
 *     eagerly loads `CustomFieldListView`, which imports that container.
 *   - The per-value-type controls (`controls/*`) and the two insight dialogs
 *     (`dialogs/*`). Nothing outside chooses a control by hand; they all go
 *     through `renderCustomFieldControl`, which is what keeps one dispatcher
 *     authoritative over which control a value type gets.
 *   - `entityScreenManifest`, `fieldGroupFieldConfig`,
 *     `customFieldEditInitialValues`, `useCustomFieldViewModel`,
 *     `useFieldInsightViewModel`. Internal to this submodule's own screens.
 *
 * INTERNAL IMPORTS DO NOT COME THROUGH HERE. Files inside `src/` import each
 * other by relative path, never through this barrel: routing an internal import
 * through it would make the module import itself and turn any two-way
 * relationship into an initialisation cycle.
 */

// ---------------------------------------------------------------------------
// Screens -- one per app route under /custom-fields
// ---------------------------------------------------------------------------
export { CustomFieldListView } from "./src/presentation/views/CustomFieldList/CustomFieldListView";
export { EntityTypeCatalogView } from "./src/presentation/views/EntityTypeCatalog/EntityTypeCatalogView";
export { ValueTypeCatalogView } from "./src/presentation/views/ValueTypeCatalog/ValueTypeCatalogView";

// ---------------------------------------------------------------------------
// Drawing a custom field inside somebody else's form
//
// `renderCustomFieldControl` is the shared per-type edit control the eight
// hand-wired consumer sections call instead of hand-rolling a switch;
// `GenericFormCustomFieldControl` is the bridge that lets a plain <GenericForm>
// draw one through core's CustomFieldsExtensionApi; `formatCustomFieldValue` is
// the read-side counterpart for a table cell.
// ---------------------------------------------------------------------------
export { renderCustomFieldControl } from "./src/presentation/form/renderCustomFieldControl";
export { GenericFormCustomFieldControl } from "./src/presentation/form/GenericFormCustomFieldControl";
export { formatCustomFieldValue } from "./src/presentation/form/formatCustomFieldValue";

// ---------------------------------------------------------------------------
// Save-time validation
//
// The one client-side gate the hand-wired sites have: they render each field
// through `renderCustomFieldControl` inside their own sections and so never run
// GenericForm's required pass. `CustomFieldValidationError` is exported with it
// because a caller's catch block has to tell "we refused this value" apart from
// "the save request failed".
// ---------------------------------------------------------------------------
export {
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "./src/presentation/form/customFieldValueValidation";

// ---------------------------------------------------------------------------
// Value-type and validator vocabulary
//
// Pure data mirroring the backend enums. Exported because the inline
// add-a-definition dialog in the custom-field-value submodule builds the same
// pickers this submodule's own list screen does, and two independently
// maintained copies of one backend enum is the drift this catalog exists to
// prevent.
// ---------------------------------------------------------------------------
export {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
} from "./src/presentation/registries/valueTypeRegistry";
export type { CustomFieldValueTypeName } from "./src/presentation/registries/valueTypeRegistry";
export {
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
} from "./src/presentation/registries/validatorKindRegistry";
export type { ValidatorKindName } from "./src/presentation/registries/validatorKindRegistry";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useRestrictableCustomFieldKeys } from "./src/presentation/viewmodels/useRestrictableCustomFieldKeys";

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
export { CustomField } from "./src/domain/entities/CustomField";
export type { CustomFieldData } from "./src/domain/entities/CustomField";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------
export type { ICustomFieldRepository } from "./src/domain/interfaces/ICustomFieldRepository";
export type { ICustomFieldService } from "./src/domain/interfaces/ICustomFieldService";
