import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  SaveAvailabilityCalendar,
} from "../entities/Availability";

export interface ReplaceAvailabilityCalendarPayload
  extends Omit<SaveAvailabilityCalendar, "resourceId"> {
  expectedVersion: number;
}

export interface IAvailabilityService {
  getCurrentCalendar(resourceId: string): Promise<AvailabilityCalendar | null>;
  defineCalendar(data: SaveAvailabilityCalendar): Promise<{ id: string }>;
  replaceCalendar(id: string, data: ReplaceAvailabilityCalendarPayload): Promise<void>;
  search(data: AvailabilitySearchInput): Promise<AvailabilitySearchResult>;
}
