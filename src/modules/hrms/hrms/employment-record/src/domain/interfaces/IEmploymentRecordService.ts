/**
 * IEmploymentRecordService Interface
 *
 * Defines the contract for EmploymentRecord API operations.
 * Implemented by EmploymentRecordService in the data layer.
 */
import type { EmploymentRecordModel } from "../../data/models/EmploymentRecordModel";

export interface EmploymentRecordListResult {
  items: EmploymentRecordModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IEmploymentRecordService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<EmploymentRecordListResult>;
  getById(id: string): Promise<EmploymentRecordModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
