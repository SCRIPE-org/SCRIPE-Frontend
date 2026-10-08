/**
 * IPartyRelationshipRepository Interface
 *
 * Defines the contract for PartyRelationship data access.
 */
import type { PartyRelationship } from "../entities/PartyRelationship";

export interface PartyRelationshipListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface IPartyRelationshipRepository {
  getAll(params: PartyRelationshipListParams): Promise<{
    items: PartyRelationship[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<PartyRelationship>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
