import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  ResourceBlock,
  ResourceBlockKind,
  SaveAvailabilityCalendar,
  SaveResourceBlock,
} from "../entities/Availability";

/**
 * Documentation for ReplaceAvailabilityCalendarPayload
 */
export interface ReplaceAvailabilityCalendarPayload
  extends Omit<SaveAvailabilityCalendar, "resourceId"> {
  expectedVersion: number;
}

/**
 * Documentation for module export
 */
export interface IAvailabilityService {
  getCurrentCalendar(resourceId: string): Promise<AvailabilityCalendar | null>;
  defineCalendar(data: SaveAvailabilityCalendar): Promise<{ id: string }>;
  replaceCalendar(id: string, data: ReplaceAvailabilityCalendarPayload): Promise<void>;
  search(data: AvailabilitySearchInput): Promise<AvailabilitySearchResult>;
  getBlocks(kind: ResourceBlockKind, resourceId: string): Promise<ResourceBlock[]>;
  createBlock(kind: ResourceBlockKind, data: SaveResourceBlock): Promise<{ id: string }>;
  updateBlock(kind: ResourceBlockKind, id: string, data: Omit<SaveResourceBlock, "resourceId"> & { expectedVersion: number }): Promise<void>;
  deleteBlock(kind: ResourceBlockKind, id: string, expectedVersion: number): Promise<void>;
}
