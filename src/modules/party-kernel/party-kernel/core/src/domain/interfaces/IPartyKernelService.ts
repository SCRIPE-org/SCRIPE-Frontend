/**
 * IPartyKernelService Interface
 *
 * Defines the contract for PartyKernel API operations.
 * Implemented by PartyKernelService in the data layer.
 */
import type { PartyKernelModel } from "../../data/models/PartyKernelModel";

export interface PartyKernelListResult {
  items: PartyKernelModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPartyKernelService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyKernelListResult>;
  getById(id: string): Promise<PartyKernelModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
