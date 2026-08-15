/**
 * IPartyPersonRepository Interface
 *
 * Defines the contract for PartyPerson data access.
 */
import type { PartyPerson } from "../entities/PartyPerson";

export interface PartyPersonListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IPartyPersonRepository {
  getAll(
    params: PartyPersonListParams
  ): Promise<{
    items: PartyPerson[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<PartyPerson>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
