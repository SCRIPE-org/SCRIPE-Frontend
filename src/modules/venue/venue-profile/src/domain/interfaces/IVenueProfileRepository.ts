import type { VenueProfile } from "../entities/VenueProfile";

export interface VenueProfileListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IVenueProfileRepository {
  getAll(params: VenueProfileListParams): Promise<{
    items: VenueProfile[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<VenueProfile>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
