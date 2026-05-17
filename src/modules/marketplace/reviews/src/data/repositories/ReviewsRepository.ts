"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { AppReview } from "../../domain/entities/AppReview";
import type { IReviewsRepository } from "../../domain/interfaces/IReviewsRepository";

export class ReviewsRepository implements IReviewsRepository {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; appListingId?: string }) {
    const q = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.appListingId && { appListingId: params.appListingId }) });
    const data = await this.api.get<any>(`${MARKETPLACE_ENDPOINTS.MARKETPLACE.REVIEWS}?${q}`);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.REVIEW_BY_ID(id));
  }

  private map(d: any): AppReview {
    return new AppReview({
      id: d.id, appListingId: d.appListingId, appName: d.appName ?? "",
      tenantId: d.tenantId, tenantName: d.tenantName ?? "",
      rating: d.rating ?? 0, title: d.title ?? "", body: d.body ?? "",
      createdAt: d.createdAt ?? new Date().toISOString(), isModerated: d.isModerated ?? false,
    });
  }
}
