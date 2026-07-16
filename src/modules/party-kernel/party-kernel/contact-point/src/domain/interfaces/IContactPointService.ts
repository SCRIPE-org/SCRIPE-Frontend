/**
* IContactPointService Interface
*
* Defines the contract for ContactPoint API operations.
* Implemented by ContactPointService in the data layer.
*/
import type { ContactPointModel } from "../../data/models/ContactPointModel";

export interface ContactPointListResult {
items: ContactPointModel[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
}

export interface IContactPointService {
getAll(params: { page: number; pageSize: number; search?: string }): Promise<ContactPointListResult>;
      getById(id: string): Promise<ContactPointModel>;
            create(data: Record<string, unknown>): Promise<{ id: string }>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }