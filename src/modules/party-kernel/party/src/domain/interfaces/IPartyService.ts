/**
* IPartyService Interface
*
* Defines the contract for Party API operations.
* Implemented by PartyService in the data layer.
*/
import type { PartyModel } from "../../data/models/PartyModel";

export interface PartyListResult {
items: PartyModel[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
}

export interface IPartyService {
getAll(params: { page: number; pageSize: number; search?: string }): Promise<PartyListResult>;
      getById(id: string): Promise<PartyModel>;
            create(data: Record<string, unknown>): Promise<{ id: string }>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }