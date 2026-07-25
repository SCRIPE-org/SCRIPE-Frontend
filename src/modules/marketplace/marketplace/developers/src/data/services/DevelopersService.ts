/**
 * DevelopersService
 *
 * HTTP service implementation for the Developer Profiles sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in DevelopersRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IDevelopersService,
  DeveloperDto,
  PaginatedDevelopersResponse,
  CreateDeveloperPayload,
  UpdateDeveloperPayload,
} from "../../domain/interfaces/IDevelopersService";
import { DEVELOPERS_ENDPOINTS } from "./developers.endpoints";

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
    const url = buildUrl(DEVELOPERS_ENDPOINTS.DEVELOPERS, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PaginatedDevelopersResponse>(url);
  }

  /** Fetch a developer profile by ID. */
  async getById(id: string): Promise<DeveloperDto> {
    return this.api.get<DeveloperDto>(DEVELOPERS_ENDPOINTS.DEVELOPER_BY_ID(id));
  }

  /** Fetch a developer profile by tenant ID. */
  async getByTenant(tenantId: string): Promise<DeveloperDto> {
    return this.api.get<DeveloperDto>(DEVELOPERS_ENDPOINTS.DEVELOPER_BY_TENANT(tenantId));
  }

  /** Create a new developer profile. */
  async create(payload: CreateDeveloperPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(DEVELOPERS_ENDPOINTS.DEVELOPERS, payload);
  }

  /** Update an existing developer profile. */
  async update(id: string, payload: UpdateDeveloperPayload): Promise<void> {
    await this.api.put(DEVELOPERS_ENDPOINTS.DEVELOPER_BY_ID(id), payload);
  }

  /** Verify a developer profile (admin action). */
  async verify(id: string): Promise<void> {
    await this.api.post(DEVELOPERS_ENDPOINTS.DEVELOPER_VERIFY(id), {});
  }
}
