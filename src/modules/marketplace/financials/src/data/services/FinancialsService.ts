/**
 * FinancialsService
 *
 * HTTP service implementation for the Marketplace Financials sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in FinancialsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  IFinancialsService,
  PaginatedFinancialsResponse,
  PurchaseDto,
  PayoutDto,
  CreatePurchasePayload,
} from "../../domain/interfaces/IFinancialsService";

export class FinancialsService implements IFinancialsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated purchase transactions. */
  async getPurchases(
    params: { page: number; pageSize: number; tenantId?: string }
  ): Promise<PaginatedFinancialsResponse<PurchaseDto>> {
    const q = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.tenantId && { tenantId: params.tenantId }),
    });
    return this.api.get<PaginatedFinancialsResponse<PurchaseDto>>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.PURCHASES}?${q}`
    );
  }

  /** Initiate an app purchase. */
  async createPurchase(payload: CreatePurchasePayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.PURCHASES, payload);
  }

  /** Fetch paginated developer payouts. */
  async getPayouts(
    params: { developerProfileId: string; page: number; pageSize: number }
  ): Promise<PaginatedFinancialsResponse<PayoutDto>> {
    const q = new URLSearchParams({
      developerProfileId: params.developerProfileId,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    return this.api.get<PaginatedFinancialsResponse<PayoutDto>>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.PAYOUTS}?${q}`
    );
  }

  /** Process (disburse) a pending developer payout. */
  async processPayout(id: string, externalReference?: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.PAYOUT_PROCESS(id), {
      externalReference: externalReference ?? null,
    });
  }
}
