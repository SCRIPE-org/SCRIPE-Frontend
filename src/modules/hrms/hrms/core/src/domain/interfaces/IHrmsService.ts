/**
 * IHrmsService Interface
 *
 * Defines the contract for Hrms API operations.
 * Implemented by HrmsService in the data layer.
 */
import type { HrmsModel } from "../../data/models/HrmsModel";

export interface HrmsListResult {
  items: HrmsModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IHrmsService {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<HrmsListResult>;
  getById(id: string): Promise<HrmsModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
