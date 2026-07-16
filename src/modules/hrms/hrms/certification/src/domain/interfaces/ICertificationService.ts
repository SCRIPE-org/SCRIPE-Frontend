/**
* ICertificationService Interface
*
* Defines the contract for Certification API operations.
* Implemented by CertificationService in the data layer.
*/
import type { CertificationModel } from "../../data/models/CertificationModel";

export interface CertificationListResult {
items: CertificationModel[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
}

export interface ICertificationService {
getAll(params: { page: number; pageSize: number; search?: string }): Promise<CertificationListResult>;
      getById(id: string): Promise<CertificationModel>;
            create(data: Record<string, unknown>): Promise<{ id: string }>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }