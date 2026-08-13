import type { ICustomFieldValueRepository } from "../../domain/interfaces/ICustomFieldValueRepository";
import type { ICustomFieldValueService } from "../../domain/interfaces/ICustomFieldValueService";

export class CustomFieldValueRepository implements ICustomFieldValueRepository {
  constructor(private readonly service: ICustomFieldValueService) {}

  getDefinitions(entityTypeKey: string) {
    return this.service.getDefinitions(entityTypeKey);
  }

  getValues(entityTypeKey: string, ownerId: string) {
    return this.service.getValues(entityTypeKey, ownerId);
  }

  saveValues(entityTypeKey: string, ownerId: string, values: Record<string, unknown>) {
    return this.service.saveValues(entityTypeKey, ownerId, values);
  }

  getBulkValues(entityTypeKey: string, ownerIds: string[]) {
    return this.service.getBulkValues(entityTypeKey, ownerIds);
  }
}
