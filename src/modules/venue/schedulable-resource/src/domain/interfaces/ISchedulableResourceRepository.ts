import type { SchedulableResource, PublicationChecklistReport } from "../entities/SchedulableResource";

/**
 * Documentation for module export
 */
export interface SchedulableResourceListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** FacilityOperations-owned profile IDs, used only as neutral cross-module references. */
  facilityResourceProfileIds?: string[];
}

/**
 * Documentation for module export
 */
export interface ISchedulableResourceRepository {
  getAll(params: SchedulableResourceListParams): Promise<{
    items: SchedulableResource[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<SchedulableResource>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  getPublicationChecklist(id: string): Promise<PublicationChecklistReport>;
  publish(id: string): Promise<void>;
}
