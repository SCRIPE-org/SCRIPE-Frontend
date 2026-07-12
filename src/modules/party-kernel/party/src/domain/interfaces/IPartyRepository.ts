/**
* IPartyRepository Interface
*
* Defines the contract for Party data access.
*/
import type { Party } from "../entities/Party";

export interface PartyListParams {
page: number;
pageSize: number;
search?: string;
}

export interface IPartyRepository {
getAll(params: PartyListParams): Promise<{ items: Party[]; totalCount: number; page: number;
      pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean; }>;
      getById(id: string): Promise<Party>;
            create(data: Record<string, unknown>): Promise<string>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }