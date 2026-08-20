/**
 * FieldGroup Repository Implementation
 *
 * Implements IFieldGroupRepository over IFieldGroupService, mapping Models to
 * Entities. Same layering as CustomFieldRepository:
 * - Service handles API calls, returns Models
 * - Repository maps to Entities
 * - ViewModel works with Entities only
 */
import type {
  IFieldGroupRepository,
  CreateFieldGroupInput,
  UpdateFieldGroupInput,
  FieldGroupReorderItem,
} from "../../domain/interfaces/IFieldGroupRepository";
import type { IFieldGroupService } from "../../domain/interfaces/IFieldGroupService";
import type { FieldGroup } from "../../domain/entities/FieldGroup";
import { FieldGroupMapper } from "../mappers/FieldGroupMapper";

export class FieldGroupRepository implements IFieldGroupRepository {
  constructor(private readonly service: IFieldGroupService) {}

  async getByEntityType(entityTypeKey: string): Promise<FieldGroup[]> {
    const models = await this.service.getByEntityType(entityTypeKey);
    return models.map((model) => FieldGroupMapper.toEntity(model));
  }

  async create(data: CreateFieldGroupInput): Promise<string> {
    const response = await this.service.create({
      entityTypeKey: data.entityTypeKey,
      stableKey: data.stableKey,
      labelEn: data.labelEn,
      labelAr: data.labelAr ?? null,
      sortOrder: data.sortOrder,
      isGlobal: data.isGlobal,
    });
    return response.id;
  }

  async update(id: string, data: UpdateFieldGroupInput): Promise<void> {
    // Only the three properties UpdateFieldGroupRequest declares are sent.
    // entityTypeKey and scope are immutable and are not forwarded even if a
    // caller's object happens to carry them.
    await this.service.update(id, {
      labelEn: data.labelEn,
      labelAr: data.labelAr ?? null,
      sortOrder: data.sortOrder,
    });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async reorder(items: FieldGroupReorderItem[]): Promise<void> {
    await this.service.reorder({ items });
  }
}
