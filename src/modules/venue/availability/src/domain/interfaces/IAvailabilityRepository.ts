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
 * Documentation for module export
 */
export interface IAvailabilityRepository {
  getCurrentCalendar(resourceId: string): Promise<AvailabilityCalendar | null>;
  saveCalendar(
    existing: AvailabilityCalendar | null,
    data: SaveAvailabilityCalendar
  ): Promise<string>;
  search(data: AvailabilitySearchInput): Promise<AvailabilitySearchResult>;
  getBlocks(kind: ResourceBlockKind, resourceId: string): Promise<ResourceBlock[]>;
  createBlock(kind: ResourceBlockKind, data: SaveResourceBlock): Promise<string>;
  updateBlock(
    kind: ResourceBlockKind,
    existing: ResourceBlock,
    data: Omit<SaveResourceBlock, "resourceId">
  ): Promise<void>;
  deleteBlock(kind: ResourceBlockKind, existing: ResourceBlock): Promise<void>;
}
