import type { ITenantGatewayService } from "../../domain/interfaces/ITenantGatewayService";
import type {
  ITenantGatewayRepository,
  ConfigureGatewayRequest,
} from "../../domain/interfaces/ITenantGatewayRepository";
import type { TenantGateway } from "../../domain/entities/TenantGateway";
import { TenantGatewayMapper } from "../mappers/TenantGatewayMapper";

/**
 * Repository layer implementing client request queries for tenant gateway.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class TenantGatewayRepository implements ITenantGatewayRepository {
  constructor(private readonly service: ITenantGatewayService) {}

  async getMyGateways(): Promise<TenantGateway[]> {
    const models = await this.service.getMyGateways();
    return models.map(TenantGatewayMapper.toEntity);
  }

  async configureGateway(data: ConfigureGatewayRequest): Promise<{ id: string }> {
    return this.service.configureGateway({
      gatewayType: data.gatewayType,
      apiKey: data.apiKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      merchantId: data.merchantId,
      displayLabel: data.displayLabel,
      isTestMode: data.isTestMode,
    });
  }

  async verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }> {
    return this.service.verifyGateway(gatewayType);
  }

  async removeGateway(gatewayType: string): Promise<void> {
    return this.service.removeGateway(gatewayType);
  }
}
