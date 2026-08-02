import type { Facility } from "../entities/Facility";

export interface FacilityListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IFacilityRepository {
  getAll(params: FacilityListParams): Promise<{
    items: Facility[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<Facility>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
