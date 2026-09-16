import type { VenueAttentionPage } from "../entities/VenueAttention";

export interface IVenueAttentionRepository {
  get(page?: number, pageSize?: number): Promise<VenueAttentionPage>;
}
