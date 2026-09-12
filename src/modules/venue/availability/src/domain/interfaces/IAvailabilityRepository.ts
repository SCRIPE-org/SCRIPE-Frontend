import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  SaveAvailabilityCalendar,
} from "../entities/Availability";

export interface IAvailabilityRepository {
  getCurrentCalendar(resourceId: string): Promise<AvailabilityCalendar | null>;
  saveCalendar(existing: AvailabilityCalendar | null, data: SaveAvailabilityCalendar): Promise<string>;
  search(data: AvailabilitySearchInput): Promise<AvailabilitySearchResult>;
}
