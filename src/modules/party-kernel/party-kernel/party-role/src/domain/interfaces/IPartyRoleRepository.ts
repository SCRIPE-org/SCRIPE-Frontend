/**
 * IPartyRoleRepository Interface
 *
 * Defines the contract for PartyRole data access.
 */
import type { PartyRole } from "../entities/PartyRole";

export interface PartyRoleListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface IPartyRoleRepository {
  getAll(
    params: PartyRoleListParams
  ): Promise<{
    items: PartyRole[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<PartyRole>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
