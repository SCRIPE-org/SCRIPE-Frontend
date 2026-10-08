import type { VenueProfileModel } from "../../data/models/VenueProfileModel";

/**
 * Documentation for module export
 */
export interface VenueProfileListResult {
  items: VenueProfileModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export interface IVenueProfileService {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<VenueProfileListResult>;
  getById(id: string): Promise<VenueProfileModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
