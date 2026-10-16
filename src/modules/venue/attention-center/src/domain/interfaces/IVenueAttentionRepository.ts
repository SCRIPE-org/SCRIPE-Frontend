import type { VenueAttentionPage } from "../entities/VenueAttention";

/**
 * Documentation for module export
 */
export interface IVenueAttentionRepository {
  get(page?: number, pageSize?: number): Promise<VenueAttentionPage>;
}
