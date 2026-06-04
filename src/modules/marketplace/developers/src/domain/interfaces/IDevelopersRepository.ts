import type { DeveloperProfile } from "../entities/DeveloperProfile";

/**
 * Developers Repository Interface
 *
 * Contract for marketplace developer profile operations.
 * Paginated responses match Core.Application.Common.PagedResult<T>.
 * Payloads match backend CreateDeveloperProfileRequest / UpdateDeveloperProfileRequest DTOs.
 */
export interface IDevelopersRepository {
  /** Paginated list of developer profiles with optional search filter. */
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<{
    items: DeveloperProfile[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;

  /** Get a single developer profile by encrypted ID. */
  getById(id: string): Promise<DeveloperProfile>;

  /** Get a developer profile by tenant encrypted ID. */
  getByTenant(tenantId: string): Promise<DeveloperProfile>;

  /**
   * Create a new developer profile.
   * Payload matches backend CreateDeveloperProfileRequest(TenantId, DeveloperName, Website, SupportEmail, Bio).
   */
  create(data: {
    tenantId: string;
    developerName: string;
    website: string;
    supportEmail: string;
    bio: string;
  }): Promise<string>;

  /**
   * Update an existing developer profile.
   * Payload matches backend UpdateDeveloperProfileRequest(DeveloperName, Website, SupportEmail, Bio).
   */
  update(
    id: string,
    data: {
      developerName: string;
      website: string;
      supportEmail: string;
      bio: string;
    }
  ): Promise<void>;

  /** Verify a developer profile (admin action). */
  verify(id: string): Promise<void>;
}
