import type { ICustomFieldValueRepository } from "../../domain/interfaces/ICustomFieldValueRepository";
import type { ICustomFieldValueService } from "../../domain/interfaces/ICustomFieldValueService";
import { CustomFieldValueMapper } from "../mappers/CustomFieldValueMapper";

/**
 * Documentation for module export
 */
export class CustomFieldValueRepository implements ICustomFieldValueRepository {
  constructor(private readonly service: ICustomFieldValueService) {}

  getDefinitions(entityTypeKey: string) {
    return this.service.getDefinitions(entityTypeKey);
  }

  async getValues(entityTypeKey: string, ownerId: string) {
    const values = await this.service.getValues(entityTypeKey, ownerId);
    return values.map(CustomFieldValueMapper.toEntity);
  }

  saveValues(entityTypeKey: string, ownerId: string, values: Record<string, unknown>) {
    return this.service.saveValues(entityTypeKey, ownerId, values);
  }

  async getBulkValues(entityTypeKey: string, ownerIds: string[]) {
    const bulk = await this.service.getBulkValues(entityTypeKey, ownerIds);
    return CustomFieldValueMapper.toBulkEntity(bulk);
  }

  async revealValue(entityTypeKey: string, ownerId: string, fieldKey: string) {
    const res = await this.service.revealValue(entityTypeKey, ownerId, fieldKey);
    return res.value;
  }
}
