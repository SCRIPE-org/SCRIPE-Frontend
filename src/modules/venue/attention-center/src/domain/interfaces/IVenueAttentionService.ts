import type { VenueAttentionPage } from "../entities/VenueAttention";

export interface IVenueAttentionService {
  get(page?: number, pageSize?: number): Promise<VenueAttentionPage>;
}
