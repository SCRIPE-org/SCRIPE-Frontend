/**
 * IPartyOrganizationRepository Interface
 *
 * Defines the contract for PartyOrganization data access.
 */
import type { PartyOrganization } from "../entities/PartyOrganization";

export interface PartyOrganizationListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface IPartyOrganizationRepository {
  getAll(params: PartyOrganizationListParams): Promise<{
    items: PartyOrganization[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<PartyOrganization>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
