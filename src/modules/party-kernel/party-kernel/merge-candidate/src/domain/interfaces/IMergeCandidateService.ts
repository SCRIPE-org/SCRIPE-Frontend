/**
 * IMergeCandidateService Interface
 *
 * Defines the contract for MergeCandidate API operations.
 * Implemented by MergeCandidateService in the data layer.
 */
import type { MergeCandidateModel } from "../../data/models/MergeCandidateModel";

export interface MergeCandidateListResult {
  items: MergeCandidateModel[];
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
export interface IMergeCandidateService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<MergeCandidateListResult>;
  getById(id: string): Promise<MergeCandidateModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
