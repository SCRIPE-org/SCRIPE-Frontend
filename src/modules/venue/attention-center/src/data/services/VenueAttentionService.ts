import type { IApiService } from "@core/interfaces/api.interface";
import type { VenueAttentionPage } from "../../domain/entities/VenueAttention";
import type { IVenueAttentionService } from "../../domain/interfaces/IVenueAttentionService";
import { VENUE_ATTENTION_ENDPOINTS } from "./venue-attention.endpoints";

/**
 * Documentation for module export
 */
export class VenueAttentionService implements IVenueAttentionService {
  constructor(private readonly api: IApiService) {}

  get(page = 1, pageSize = 20): Promise<VenueAttentionPage> {
    return this.api.get(`${VENUE_ATTENTION_ENDPOINTS.LIST}?page=${page}&pageSize=${pageSize}`);
  }
}
