import type {
  BulkEntityCustomFieldValuesData,
  EntityCustomFieldValueData,
} from "../entities/CustomFieldValue";

/**
 * Documentation for module export
 */
export interface ICustomFieldValueRepository {
  getDefinitions(entityTypeKey: string): Promise<EntityCustomFieldValueData[]>;
  getValues(entityTypeKey: string, ownerId: string): Promise<EntityCustomFieldValueData[]>;
  saveValues(
    entityTypeKey: string,
    ownerId: string,
    values: Record<string, unknown>
  ): Promise<void>;
  /** Active definitions for entityTypeKey (as column headers) plus every requested owner's stored values, in one round trip. */
  getBulkValues(
    entityTypeKey: string,
    ownerIds: string[]
  ): Promise<BulkEntityCustomFieldValuesData>;
  /** Decrypts and reveals a sensitive custom field value for an authorized user. */
  revealValue(entityTypeKey: string, ownerId: string, fieldKey: string): Promise<unknown>;
}
