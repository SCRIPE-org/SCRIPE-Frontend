/**
 * IStaffCompetencyService Interface
 *
 * Defines the contract for StaffCompetency API operations.
 * Implemented by StaffCompetencyService in the data layer.
 */
import type { StaffCompetencyModel } from "../../data/models/StaffCompetencyModel";

export interface StaffCompetencyListResult {
  items: StaffCompetencyModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IStaffCompetencyService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<StaffCompetencyListResult>;
  getById(id: string): Promise<StaffCompetencyModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
