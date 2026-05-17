import type { AppSubmission } from "../entities/AppSubmission";

export interface ISubmissionsRepository {
  getAll(params: { page: number; pageSize: number; status?: string }): Promise<{ items: AppSubmission[]; totalCount: number; totalPages: number; page: number; pageSize: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  getById(id: string): Promise<AppSubmission>;
  create(data: { appListingId: string; submittedVersion: string; notes?: string }): Promise<string>;
  approve(id: string): Promise<void>;
  reject(id: string, notes: string): Promise<void>;
  requestRevisions(id: string, notes: string): Promise<void>;
}
