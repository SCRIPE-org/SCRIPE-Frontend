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

export type { ActivateAccountRequest, ActivateAccountResponse, ValidateTokenResponse };

export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: IPublicApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.get<ValidateTokenResponse>(API_ENDPOINTS.ACCOUNT_SETUP.VALIDATE_TOKEN(token));
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.post<ActivateAccountResponse>(API_ENDPOINTS.ACCOUNT_SETUP.ACTIVATE, request);
  }
}
