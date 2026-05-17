import type { DeveloperProfile } from "../entities/DeveloperProfile";

export interface IDevelopersRepository {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<{ items: DeveloperProfile[]; totalCount: number; totalPages: number; page: number; pageSize: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  getById(id: string): Promise<DeveloperProfile>;
  getByTenant(tenantId: string): Promise<DeveloperProfile>;
  create(data: { displayName: string; contactEmail: string; website?: string; bio?: string }): Promise<string>;
  update(id: string, data: Partial<{ displayName: string; contactEmail: string; website: string; bio: string }>): Promise<void>;
  verify(id: string): Promise<void>;
}
