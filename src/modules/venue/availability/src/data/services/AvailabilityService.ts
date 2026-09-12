import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  SaveAvailabilityCalendar,
} from "../../domain/entities/Availability";
import type {
  IAvailabilityService,
  ReplaceAvailabilityCalendarPayload,
} from "../../domain/interfaces/IAvailabilityService";
import { AVAILABILITY_ENDPOINTS } from "./availability.endpoints";

interface CalendarPage {
  items: Array<Pick<AvailabilityCalendar, "id" | "resourceId" | "status">>;
}

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
    return this.api.get(buildUrl(AVAILABILITY_ENDPOINTS.SEARCH, {
      resourceId: data.resourceId,
      timeZoneId: data.timeZoneId,
      startLocal: data.startLocal,
      endLocal: data.endLocal,
      quantity: data.quantity,
    }));
  }
}
