/**
 * IDevelopersService
 *
 * Contract for the Developer Profiles HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/** API response shape matching DeveloperProfileListResponse from backend. */
export interface DeveloperDto {
  id: string;
  tenantId: string;
  developerName?: string;
  supportEmail?: string;
  website?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  isVerified?: boolean;
  appCount?: number;
  totalRevenue?: number;
  currency?: string;
  createdAt?: string;
}

/** Paginated API response wrapper matching Core.Application.Common.PagedResult<T>. */
export interface PaginatedDevelopersResponse {
  items: DeveloperDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Payload for creating a developer profile. */
export interface CreateDeveloperPayload {
  tenantId: string;
  developerName: string;
  website: string;
  supportEmail: string;
  bio: string;
}

/** Payload for updating a developer profile. */
export interface UpdateDeveloperPayload {
  developerName: string;
  website: string;
  supportEmail: string;
  bio: string;
}

export interface IDevelopersService {
  /** Fetch paginated list of developer profiles. */
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PaginatedDevelopersResponse>;
  /** Fetch a developer profile by ID. */
  getById(id: string): Promise<DeveloperDto>;
  /** Fetch a developer profile by tenant ID. */
  getByTenant(tenantId: string): Promise<DeveloperDto>;
  /** Create a developer profile. Returns new profile ID. */
  create(payload: CreateDeveloperPayload): Promise<{ id: string }>;
  /** Update a developer profile. */
  update(id: string, payload: UpdateDeveloperPayload): Promise<void>;
  /** Verify a developer profile (admin action). */
  verify(id: string): Promise<void>;
}
