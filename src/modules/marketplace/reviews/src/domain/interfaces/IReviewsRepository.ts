import type { AppReview } from "../entities/AppReview";

export interface IReviewsRepository {
  getAll(params: { page: number; pageSize: number; appListingId?: string }): Promise<{ items: AppReview[]; totalCount: number; totalPages: number; page: number; pageSize: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  delete(id: string): Promise<void>;
}
