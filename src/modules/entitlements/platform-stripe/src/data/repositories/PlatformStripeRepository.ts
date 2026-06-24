/**
 * Platform Stripe Repository — calls service, maps DTOs → domain entities.
 * Implements IPlatformStripeRepository.
 */
import type { IPlatformStripeRepository } from "../../domain/interfaces/IPlatformStripeRepository";
import type { IPlatformStripeService } from "../../domain/interfaces/IPlatformStripeService";
import type { PlatformStripeDashboard } from "../../domain/entities/PlatformStripeDashboard";
import { PlatformStripeMapper } from "../mappers/PlatformStripeMapper";

/**
 * Repository implementation for managing database operations on PlatformStripe resources.
 */
export class PlatformStripeRepository implements IPlatformStripeRepository {
  constructor(private readonly service: IPlatformStripeService) {}

  async getDashboard(): Promise<PlatformStripeDashboard> {
    const dto = await this.service.getDashboard();
    return PlatformStripeMapper.toDashboardEntity(dto);
  }
}
