/**
* IPartyOrganizationService Interface
*
* Defines the contract for PartyOrganization API operations.
* Implemented by PartyOrganizationService in the data layer.
*/
import type { PartyOrganizationModel } from "../../data/models/PartyOrganizationModel";

export interface PartyOrganizationListResult {
items: PartyOrganizationModel[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
}

export interface IPartyOrganizationService {
getAll(params: { page: number; pageSize: number; search?: string }): Promise<PartyOrganizationListResult>;
      getById(id: string): Promise<PartyOrganizationModel>;
            create(data: Record<string, unknown>): Promise<{ id: string }>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }