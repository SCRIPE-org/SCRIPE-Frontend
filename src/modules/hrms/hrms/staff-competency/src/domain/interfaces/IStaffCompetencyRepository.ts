/**
* IStaffCompetencyRepository Interface
*
* Defines the contract for StaffCompetency data access.
*/
import type { StaffCompetency } from "../entities/StaffCompetency";

export interface StaffCompetencyListParams {
page: number;
pageSize: number;
search?: string;
}

export interface IStaffCompetencyRepository {
getAll(params: StaffCompetencyListParams): Promise<{ items: StaffCompetency[]; totalCount: number; page: number;
      pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean; }>;
      getById(id: string): Promise<StaffCompetency>;
            create(data: Record<string, unknown>): Promise<string>;
                        update(id: string, data: Record<string, unknown>): Promise<void>;
                                    delete(id: string): Promise<void>;
                                          }