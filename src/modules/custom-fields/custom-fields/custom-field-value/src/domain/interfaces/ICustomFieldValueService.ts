import type { EntityCustomFieldValueData } from "../../data/models/CustomFieldValueModel";

export interface ICustomFieldValueService {
  getDefinitions(entityTypeKey: string): Promise<EntityCustomFieldValueData[]>;
  getValues(entityTypeKey: string, ownerId: string): Promise<EntityCustomFieldValueData[]>;
  saveValues(
    entityTypeKey: string,
    ownerId: string,
    values: Record<string, unknown>
  ): Promise<void>;
}
