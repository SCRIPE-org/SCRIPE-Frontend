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
import type { IPublicApiService } from "@core/interfaces/public-api.interface";

/**
 * Re-exports type definitions representing account setup request and response contracts
 * to expose them cleanly as part of the module interface boundaries.
 */
export type { ActivateAccountRequest, ActivateAccountResponse, ValidateTokenResponse };

/**
 * AccountSetupService provides the concrete implementation of the IAccountSetupService.
 * Coordinates with the backend public API to validate initialization tokens and register the root tenant administrator.
 */
export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: IPublicApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.get<ValidateTokenResponse>(API_ENDPOINTS.ACCOUNT_SETUP.VALIDATE_TOKEN(token));
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.post<ActivateAccountResponse>(API_ENDPOINTS.ACCOUNT_SETUP.ACTIVATE, request);
  }
}
