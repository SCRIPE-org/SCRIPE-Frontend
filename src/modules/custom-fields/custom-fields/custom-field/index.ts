/**
 * CustomField Submodule Public Exports
 */

// Views
export { CustomFieldListView } from "./src/presentation/views/CustomFieldListView";
export { ValueTypeCatalogView } from "./src/presentation/views/ValueTypeCatalogView";

// Entities
export { CustomField } from "./src/domain/entities/CustomField";
export type { CustomFieldData } from "./src/domain/entities/CustomField";

// Interfaces
export type { ICustomFieldRepository } from "./src/domain/interfaces/ICustomFieldRepository";
export type { ICustomFieldService } from "./src/domain/interfaces/ICustomFieldService";
