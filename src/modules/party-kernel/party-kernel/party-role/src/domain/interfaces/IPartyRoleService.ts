/**
 * IPartyRoleService Interface
 *
 * Defines the contract for PartyRole API operations.
 * Implemented by PartyRoleService in the data layer.
 */
import type { PartyRoleModel } from "../../data/models/PartyRoleModel";

export interface PartyRoleListResult {
  items: PartyRoleModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPartyRoleService {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<PartyRoleListResult>;
  getById(id: string): Promise<PartyRoleModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
