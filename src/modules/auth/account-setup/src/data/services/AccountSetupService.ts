/**
 * Account Setup Service
 *
 * Handles public API calls for the account activation flow through IApiService.
 *
 * @module auth/account-setup
 */
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  IAccountSetupService,
  ValidateTokenResponse,
} from "../../../../core/domain/interfaces/IAccountSetupService";
import type { PublicApiService } from "../../../../core/data/services/PublicApiService";

export type { ActivateAccountRequest, ActivateAccountResponse, ValidateTokenResponse };

export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: PublicApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.get<ValidateTokenResponse>(API_ENDPOINTS.ACCOUNT_SETUP.VALIDATE_TOKEN(token));
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.post<ActivateAccountResponse>(API_ENDPOINTS.ACCOUNT_SETUP.ACTIVATE, request);
  }
}
