/**
 * DevelopersService
 *
 * HTTP service implementation for the Developer Profiles sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in DevelopersRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  IDevelopersService,
  DeveloperDto,
  PaginatedDevelopersResponse,
  CreateDeveloperPayload,
  UpdateDeveloperPayload,
} from "../../domain/interfaces/IDevelopersService";

/**
 * Http API network service for developers.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DevelopersService implements IDevelopersService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated list of developer profiles. */
  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PaginatedDevelopersResponse> {
    const q = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.search && { search: params.search }),
    });
    return this.api.get<PaginatedDevelopersResponse>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPERS}?${q}`
    );
  }

  /** Fetch a developer profile by ID. */
  async getById(id: string): Promise<DeveloperDto> {
    return this.api.get<DeveloperDto>(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_ID(id));
  }

  /** Fetch a developer profile by tenant ID. */
  async getByTenant(tenantId: string): Promise<DeveloperDto> {
    return this.api.get<DeveloperDto>(
      MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_TENANT(tenantId)
    );
  }

  /** Create a new developer profile. */
  async create(payload: CreateDeveloperPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPERS, payload);
  }

  /** Update an existing developer profile. */
  async update(id: string, payload: UpdateDeveloperPayload): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_ID(id), payload);
  }

  /** Verify a developer profile (admin action). */
  async verify(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_VERIFY(id), {});
  }
}
