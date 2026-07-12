/**
 * IPartyKernelRepository Interface
 *
 * Defines the contract for PartyKernel data access.
 * Works with domain entities, not DTOs.
 */
import type { PartyKernel } from "../entities/PartyKernel";

export interface PartyKernelListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IPartyKernelRepository {
  getAll(params: PartyKernelListParams): Promise<{ items: PartyKernel[]; totalCount: number; page: number; pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  getById(id: string): Promise<PartyKernel>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
