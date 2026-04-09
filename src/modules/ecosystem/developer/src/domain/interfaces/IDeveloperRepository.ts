import type { DeveloperEntity } from "../entities/DeveloperEntity";

export interface IDeveloperRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: DeveloperEntity[]; totalCount: number }>;
}
