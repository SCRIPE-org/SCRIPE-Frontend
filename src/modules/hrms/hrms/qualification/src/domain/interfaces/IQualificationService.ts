/**
 * IQualificationService Interface
 *
 * Defines the contract for Qualification API operations.
 * Implemented by QualificationService in the data layer.
 */
import type { QualificationModel } from "../../data/models/QualificationModel";

export interface QualificationListResult {
  items: QualificationModel[];
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
export interface IQualificationService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<QualificationListResult>;
  getById(id: string): Promise<QualificationModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
