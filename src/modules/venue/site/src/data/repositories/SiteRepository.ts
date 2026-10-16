import type { ISiteRepository, PagedSiteResult } from "../../domain/interfaces/ISiteRepository";
import type {
  ISiteService,
  ListSitesParams,
  CreateSitePayload,
  UpdateSitePayload,
} from "../../domain/interfaces/ISiteService";
import type { Site } from "../../domain/entities/Site";
import { SiteMapper } from "../mappers/SiteMapper";

/**
 * Concrete repository mediating access to Venue Site persistence.
 * Implements {@link ISiteRepository} and transforms network DTOs to domain {@link Site} entities via {@link SiteMapper}.
 */
export class SiteRepository implements ISiteRepository {
  constructor(private readonly service: ISiteService) {}

  /**
   * Fetches a paginated, optionally filtered collection of venue sites.
   * @param params Query parameters including pagination window and search term.
   * @returns Paginated result wrapped in domain entities.
   */
  async getAll(params: ListSitesParams): Promise<PagedSiteResult> {
    const result = await this.service.getAll(params);
    return {
      items: (result.items || []).map(SiteMapper.toEntity),
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    };
  }

  /**
   * Retrieves a single venue site by its unique identifier.
   * @param id The unique site identifier.
   * @returns The mapped domain Site entity.
   */
  async getById(id: string): Promise<Site> {
    const dto = await this.service.getById(id);
    return SiteMapper.toEntity(dto);
  }

  /**
   * Creates a new venue site entity.
   * @param payload Site attributes including name, address, and time zone.
   * @returns The newly created site identifier.
   */
  async create(payload: CreateSitePayload): Promise<string> {
    const res = await this.service.create(payload);
    return res.id;
  }

  /**
   * Updates an existing venue site entity.
   * @param id The site identifier to update.
   * @param payload Modified site fields.
   */
  async update(id: string, payload: UpdateSitePayload): Promise<void> {
    await this.service.update(id, payload);
  }

  /**
   * Removes a venue site entity by identifier.
   * @param id The site identifier to remove.
   */
  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
