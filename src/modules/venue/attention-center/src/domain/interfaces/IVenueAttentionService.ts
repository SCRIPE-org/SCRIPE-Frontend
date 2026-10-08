import type { VenueAttentionPage } from "../entities/VenueAttention";

/**
 * Documentation for module export
 */
export interface IVenueAttentionService {
  get(page?: number, pageSize?: number): Promise<VenueAttentionPage>;
}
