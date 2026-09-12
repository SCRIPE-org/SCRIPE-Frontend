import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  SaveAvailabilityCalendar,
} from "../../domain/entities/Availability";
import type { IAvailabilityRepository } from "../../domain/interfaces/IAvailabilityRepository";
import type { IAvailabilityService } from "../../domain/interfaces/IAvailabilityService";

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
}
