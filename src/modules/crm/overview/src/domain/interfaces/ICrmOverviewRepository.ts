import type { OverviewEntity } from "../entities/OverviewEntity";

/**
 * Repository interface mediating CRM Overview dashboard domain entities.
 */
export interface ICrmOverviewRepository {
  /** Loads and maps the CRM Overview command center entity. */
  getOverview(searchQuery?: string): Promise<OverviewEntity>;
}
