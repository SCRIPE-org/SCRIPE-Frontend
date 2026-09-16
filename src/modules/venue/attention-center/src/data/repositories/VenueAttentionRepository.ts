import type { VenueAttentionPage } from "../../domain/entities/VenueAttention";
import type { IVenueAttentionRepository } from "../../domain/interfaces/IVenueAttentionRepository";
import type { IVenueAttentionService } from "../../domain/interfaces/IVenueAttentionService";

export class VenueAttentionRepository implements IVenueAttentionRepository {
  constructor(private readonly service: IVenueAttentionService) {}

  get(page?: number, pageSize?: number): Promise<VenueAttentionPage> {
    return this.service.get(page, pageSize);
  }
}
