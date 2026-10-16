import type { IApiService } from "@core/interfaces/api.interface";
import type {
  BulkEntityCustomFieldValuesData,
  EntityCustomFieldValueData,
} from "../models/CustomFieldValueModel";
import type { ICustomFieldValueService } from "../../domain/interfaces/ICustomFieldValueService";
import { CUSTOM_FIELD_VALUE_ENDPOINTS } from "./custom-field-value.endpoints";

/**
 * Documentation for module export
 */
export class CustomFieldValueService implements ICustomFieldValueService {
  constructor(private readonly api: IApiService) {}

  async getDefinitions(entityTypeKey: string): Promise<EntityCustomFieldValueData[]> {
    return this.api.get<EntityCustomFieldValueData[]>(
      CUSTOM_FIELD_VALUE_ENDPOINTS.DEFINITIONS(entityTypeKey)
    );
  }

  async getValues(entityTypeKey: string, ownerId: string): Promise<EntityCustomFieldValueData[]> {
    return this.api.get<EntityCustomFieldValueData[]>(
      CUSTOM_FIELD_VALUE_ENDPOINTS.VALUES(entityTypeKey, ownerId)
    );
  }

  async saveValues(
    entityTypeKey: string,
    ownerId: string,
    values: Record<string, unknown>
  ): Promise<void> {
    await this.api.put(CUSTOM_FIELD_VALUE_ENDPOINTS.VALUES(entityTypeKey, ownerId), { values });
  }

  async getBulkValues(
    entityTypeKey: string,
    ownerIds: string[]
  ): Promise<BulkEntityCustomFieldValuesData> {
    return this.api.post<BulkEntityCustomFieldValuesData>(
      CUSTOM_FIELD_VALUE_ENDPOINTS.BULK_VALUES(entityTypeKey),
      { ownerIds }
    );
  }

  async revealValue(
    entityTypeKey: string,
    ownerId: string,
    fieldKey: string
  ): Promise<{ value: unknown }> {
    return this.api.post<{ value: unknown }>(
      CUSTOM_FIELD_VALUE_ENDPOINTS.REVEAL(entityTypeKey, ownerId, fieldKey),
      {}
    );
  }
}
