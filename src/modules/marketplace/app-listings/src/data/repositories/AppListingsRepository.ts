"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import type { IAppListingsRepository, PagedResult } from "../../domain/interfaces/IAppListingsRepository";
import type { AppListing } from "../../domain/entities/AppListing";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { AppListingMapper } from "../mappers/AppListingMapper";
import type { AppListingDto, AppListingListDto } from "../models/AppListingModel";


/**
 * AppListingsRepository
 *
 * Bridges the data and domain layers:
 * 1. Calls the service (or IApiService directly) to fetch DTOs
 * 2. Uses AppListingMapper to convert DTOs → Entities
 * 3. Returns typed domain entities to the presentation layer
 */
export class AppListingsRepository implements IAppListingsRepository {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }): Promise<PagedResult<AppListing>> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.search && { search: params.search }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.isPublished !== undefined && { isPublished: String(params.isPublished) }),
      ...(params.isFeatured !== undefined && { isFeatured: String(params.isFeatured) }),
    });
    const data = await this.api.get<AppListingListDto>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG}?${query}`
    );
    return {
      items: data.items.map(AppListingMapper.toEntity),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage,
      hasPreviousPage: data.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<AppListing> {
    const data = await this.api.get<AppListingDto>(
      MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id)
    );
    return AppListingMapper.toEntity(data);
  }

  async getFeatured(): Promise<AppListing[]> {
    const data = await this.api.get<AppListingDto[]>(
      MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_FEATURED
    );
    return data.map(AppListingMapper.toEntity);
  }

  async create(data: Parameters<IAppListingsRepository["create"]>[0]): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG,
      data
    );
    return result.id;
  }

  async update(id: string, data: Parameters<IAppListingsRepository["update"]>[1]): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id));
  }

  async publish(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_PUBLISH(id), {});
  }

  async unpublish(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_UNPUBLISH(id), {});
  }

  async toggleFeatured(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_FEATURE(id), {});
  }

  async setPricing(id: string, data: Parameters<IAppListingsRepository["setPricing"]>[1]): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_PRICING(id), data);
  }
}
