/**
 * IPartyPersonService Interface
 *
 * Defines the contract for PartyPerson API operations.
 * Implemented by PartyPersonService in the data layer.
 */
import type { PartyPersonModel } from "../../data/models/PartyPersonModel";

export interface PartyPersonListResult {
  items: PartyPersonModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPartyPersonService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyPersonListResult>;
  getById(id: string): Promise<PartyPersonModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
