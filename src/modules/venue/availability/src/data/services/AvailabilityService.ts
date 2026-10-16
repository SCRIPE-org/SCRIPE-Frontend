import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  ResourceBlock,
  ResourceBlockKind,
  SaveAvailabilityCalendar,
  SaveResourceBlock,
} from "../../domain/entities/Availability";
import type {
  IAvailabilityService,
  ReplaceAvailabilityCalendarPayload,
} from "../../domain/interfaces/IAvailabilityService";
import { AVAILABILITY_ENDPOINTS } from "./availability.endpoints";

interface CalendarPage {
  items: Array<Pick<AvailabilityCalendar, "id" | "resourceId" | "status">>;
}

interface ResourceBlockPage {
  items: ResourceBlock[];
}

/**
 * Documentation for module export
 */
export class AvailabilityService implements IAvailabilityService {
  constructor(private readonly api: IApiService) {}

  async getCurrentCalendar(resourceId: string): Promise<AvailabilityCalendar | null> {
    const page = await this.api.get<CalendarPage>(
      buildUrl(AVAILABILITY_ENDPOINTS.CALENDARS, { page: 1, pageSize: 20, resourceId })
    );
    const selected = page.items.find((calendar) => calendar.status === "Active") ?? page.items[0];
    return selected
      ? this.api.get<AvailabilityCalendar>(AVAILABILITY_ENDPOINTS.CALENDAR_BY_ID(selected.id))
      : null;
  }

  defineCalendar(data: SaveAvailabilityCalendar): Promise<{ id: string }> {
    return this.api.post(AVAILABILITY_ENDPOINTS.CALENDARS, data);
  }

  async replaceCalendar(id: string, data: ReplaceAvailabilityCalendarPayload): Promise<void> {
    await this.api.put(AVAILABILITY_ENDPOINTS.CALENDAR_BY_ID(id), data);
  }

  search(data: AvailabilitySearchInput): Promise<AvailabilitySearchResult> {
    return this.api.get(
      buildUrl(AVAILABILITY_ENDPOINTS.SEARCH, {
        resourceId: data.resourceId,
        timeZoneId: data.timeZoneId,
        startLocal: data.startLocal,
        endLocal: data.endLocal,
        quantity: data.quantity,
      })
    );
  }

  async getBlocks(kind: ResourceBlockKind, resourceId: string): Promise<ResourceBlock[]> {
    const endpoint =
      kind === "blackout"
        ? AVAILABILITY_ENDPOINTS.BLACKOUTS
        : AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS;
    const page = await this.api.get<ResourceBlockPage>(
      buildUrl(endpoint, { resourceId, page: 1, pageSize: 100 })
    );
    return page.items;
  }

  createBlock(kind: ResourceBlockKind, data: SaveResourceBlock): Promise<{ id: string }> {
    const endpoint =
      kind === "blackout"
        ? AVAILABILITY_ENDPOINTS.BLACKOUTS
        : AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS;
    return this.api.post(endpoint, data);
  }

  async updateBlock(
    kind: ResourceBlockKind,
    id: string,
    data: Omit<SaveResourceBlock, "resourceId"> & { expectedVersion: number }
  ): Promise<void> {
    const endpoint =
      kind === "blackout"
        ? AVAILABILITY_ENDPOINTS.BLACKOUT_BY_ID(id)
        : AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCK_BY_ID(id);
    await this.api.put(endpoint, data);
  }

  async deleteBlock(kind: ResourceBlockKind, id: string, expectedVersion: number): Promise<void> {
    const endpoint =
      kind === "blackout"
        ? AVAILABILITY_ENDPOINTS.BLACKOUT_BY_ID(id)
        : AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCK_BY_ID(id);
    await this.api.delete(buildUrl(endpoint, { expectedVersion }));
  }
}
