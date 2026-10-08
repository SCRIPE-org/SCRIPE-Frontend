/**
 * IMergeCandidateRepository Interface
 *
 * Defines the contract for MergeCandidate data access.
 */
import type { MergeCandidate } from "../entities/MergeCandidate";

export interface MergeCandidateListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface IMergeCandidateRepository {
  getAll(params: MergeCandidateListParams): Promise<{
    items: MergeCandidate[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<MergeCandidate>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
