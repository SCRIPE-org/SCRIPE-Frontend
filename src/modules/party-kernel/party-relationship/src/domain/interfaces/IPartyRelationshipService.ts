/**
* IPartyRelationshipService Interface
*
* Defines the contract for PartyRelationship API operations.
* Implemented by PartyRelationshipService in the data layer.
*/
import type { PartyRelationshipModel } from "../../data/models/PartyRelationshipModel";

export interface PartyRelationshipListResult {
items: PartyRelationshipModel[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
}

export interface IPartyRelationshipService {
getAll(params: { page: number; pageSize: number; search?: string }): Promise<PartyRelationshipListResult>;
      getById(id: string): Promise<PartyRelationshipModel>;
            create(data: Record<string, unknown>): Promise<{ id: string }>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }