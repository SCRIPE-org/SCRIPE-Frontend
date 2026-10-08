import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  ResourceBlock,
  ResourceBlockKind,
  SaveAvailabilityCalendar,
  SaveResourceBlock,
} from "../../domain/entities/Availability";
import type { IAvailabilityRepository } from "../../domain/interfaces/IAvailabilityRepository";
import type { IAvailabilityService } from "../../domain/interfaces/IAvailabilityService";

/**
 * Documentation for module export
 */
export class AvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly service: IAvailabilityService) {}

  getCurrentCalendar(resourceId: string) {
    return this.service.getCurrentCalendar(resourceId);
  }

  async saveCalendar(
    existing: AvailabilityCalendar | null,
    data: SaveAvailabilityCalendar
  ): Promise<string> {
    if (!existing) {
      return (await this.service.defineCalendar(data)).id;
    }

    const { resourceId: _immutableResourceId, ...replacement } = data;
    await this.service.replaceCalendar(existing.id, {
      ...replacement,
      expectedVersion: existing.version,
    });
    return existing.id;
  }

  search(data: AvailabilitySearchInput) {
    return this.service.search(data);
  }

  getBlocks(kind: ResourceBlockKind, resourceId: string) {
    return this.service.getBlocks(kind, resourceId);
  }

  async createBlock(kind: ResourceBlockKind, data: SaveResourceBlock): Promise<string> {
    return (await this.service.createBlock(kind, data)).id;
  }

  updateBlock(
    kind: ResourceBlockKind,
    existing: ResourceBlock,
    data: Omit<SaveResourceBlock, "resourceId">
  ) {
    return this.service.updateBlock(kind, existing.id, {
      ...data,
      expectedVersion: existing.version,
    });
  }

  deleteBlock(kind: ResourceBlockKind, existing: ResourceBlock) {
    return this.service.deleteBlock(kind, existing.id, existing.version);
  }
}
