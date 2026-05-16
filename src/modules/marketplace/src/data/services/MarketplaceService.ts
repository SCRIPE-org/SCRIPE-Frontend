/**
 * Marketplace Service
 *
 * Handles all API calls for the Marketplace module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@core/config/api-endpoints";
import {
  MarketplaceModel,
  type MarketplaceJson,
  type MarketplaceListResponseJson,
} from "../models/MarketplaceModel";
import type {
  IMarketplaceService,
  MarketplaceListResult,
} from "../../domain/interfaces/IMarketplaceService";

const BASE_URL = "/v1/Marketplace";

export class MarketplaceService implements IMarketplaceService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }): Promise<MarketplaceListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<MarketplaceListResponseJson>(url);

    return {
      items: response.items.map((json) => MarketplaceModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<MarketplaceModel> {
    const json = await this.api.get<MarketplaceJson>(`${BASE_URL}/${id}`);
    return MarketplaceModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(BASE_URL, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(`${BASE_URL}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${BASE_URL}/${id}`);
  }
}
