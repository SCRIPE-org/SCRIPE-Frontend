import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  ISiteService,
  ListSitesParams,
  CreateSitePayload,
  UpdateSitePayload,
} from "../../domain/interfaces/ISiteService";
import type { SiteDto, SiteListResponseDto } from "../models/SiteDto";
import { SITE_ENDPOINTS } from "./site.endpoints";

/**
 * Documentation for module export
 */
export class SiteService implements ISiteService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ListSitesParams): Promise<SiteListResponseDto> {
    const url = buildUrl(SITE_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<SiteListResponseDto>(url);
  }

  async getById(id: string): Promise<SiteDto> {
    return this.api.get<SiteDto>(SITE_ENDPOINTS.BY_ID(id));
  }

  async create(payload: CreateSitePayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(SITE_ENDPOINTS.CREATE, payload);
  }

  async update(id: string, payload: UpdateSitePayload): Promise<void> {
    await this.api.put(SITE_ENDPOINTS.UPDATE(id), payload);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(SITE_ENDPOINTS.DELETE(id));
  }
}
