import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  VenueProfileModel,
  type VenueProfileJson,
  type VenueProfileListResponseJson,
} from "../models/VenueProfileModel";
import type {
  IVenueProfileService,
  VenueProfileListResult,
} from "../../domain/interfaces/IVenueProfileService";
import { VENUE_PROFILE_ENDPOINTS } from "./venue-profile.endpoints";

export class VenueProfileService implements IVenueProfileService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }): Promise<VenueProfileListResult> {
    const url = buildUrl(VENUE_PROFILE_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<VenueProfileListResponseJson>(url);

    return {
      items: response.items.map((json) => VenueProfileModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<VenueProfileModel> {
    const json = await this.api.get<VenueProfileJson>(VENUE_PROFILE_ENDPOINTS.BY_ID(id));
    return VenueProfileModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(VENUE_PROFILE_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(VENUE_PROFILE_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(VENUE_PROFILE_ENDPOINTS.DELETE(id));
  }
}
