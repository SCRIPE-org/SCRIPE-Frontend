/**
 * FinancialsService
 *
 * HTTP service implementation for the Marketplace Financials sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in FinancialsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IFinancialsService,
  PaginatedFinancialsResponse,
  PurchaseDto,
  PayoutDto,
  CreatePurchasePayload,
} from "../../domain/interfaces/IFinancialsService";
import { FINANCIALS_ENDPOINTS } from "./financials.endpoints";

/**
 * Http API network service for financials.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class FinancialsService implements IFinancialsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated purchase transactions. */
  async getPurchases(params: {
    page: number;
    pageSize: number;
    tenantId?: string;
  }): Promise<PaginatedFinancialsResponse<PurchaseDto>> {
    const url = buildUrl(FINANCIALS_ENDPOINTS.PURCHASES, {
      page: params.page,
      pageSize: params.pageSize,
      tenantId: params.tenantId || undefined,
    });
    return this.api.get<PaginatedFinancialsResponse<PurchaseDto>>(url);
  }

  /** Initiate an app purchase. */
  async createPurchase(payload: CreatePurchasePayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(FINANCIALS_ENDPOINTS.PURCHASES, payload);
  }

  /** Fetch paginated developer payouts. */
  async getPayouts(params: {
    developerProfileId: string;
    page: number;
    pageSize: number;
  }): Promise<PaginatedFinancialsResponse<PayoutDto>> {
    const url = buildUrl(FINANCIALS_ENDPOINTS.PAYOUTS, {
      developerProfileId: params.developerProfileId,
      page: params.page,
      pageSize: params.pageSize,
    });
    return this.api.get<PaginatedFinancialsResponse<PayoutDto>>(url);
  }

  /** Process (disburse) a pending developer payout. */
  async processPayout(id: string, externalReference?: string): Promise<void> {
    await this.api.post(FINANCIALS_ENDPOINTS.PAYOUT_PROCESS(id), {
      externalReference: externalReference ?? null,
    });
  }
}
