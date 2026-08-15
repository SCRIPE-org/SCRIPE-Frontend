import type { FacilityModel } from "../../data/models/FacilityModel";

export interface FacilityListResult {
  items: FacilityModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IFacilityService {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<FacilityListResult>;
  getById(id: string): Promise<FacilityModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
