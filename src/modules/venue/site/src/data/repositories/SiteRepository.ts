import type {
  ISiteRepository,
  PagedSiteResult,
} from "../../domain/interfaces/ISiteRepository";
import type {
  ISiteService,
  ListSitesParams,
  CreateSitePayload,
  UpdateSitePayload,
} from "../../domain/interfaces/ISiteService";
import type { Site } from "../../domain/entities/Site";
import { SiteMapper } from "../mappers/SiteMapper";

export class SiteRepository implements ISiteRepository {
  constructor(private readonly service: ISiteService) {}

  async getAll(params: ListSitesParams): Promise<PagedSiteResult> {
    const result = await this.service.getAll(params);
    return {
      items: (result.items || []).map(SiteMapper.toEntity),
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    };
  }

  async getById(id: string): Promise<Site> {
    const dto = await this.service.getById(id);
    return SiteMapper.toEntity(dto);
  }

  async create(payload: CreateSitePayload): Promise<string> {
    const res = await this.service.create(payload);
    return res.id;
  }

  async update(id: string, payload: UpdateSitePayload): Promise<void> {
    await this.service.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
