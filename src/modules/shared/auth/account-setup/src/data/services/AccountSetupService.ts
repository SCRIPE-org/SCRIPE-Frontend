/**
 * Account Setup Service
 *
 * Handles public API calls for the account activation flow through IApiService public endpoints.
 *
 * @module auth/account-setup
 */
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  IAccountSetupService,
  SetupCustomFieldDto,
  ValidateTokenResponse,
} from "../../domain/interfaces/IAccountSetupService";
import { ACCOUNT_SETUP_ENDPOINTS } from "./account-setup.endpoints";

/**
 * Re-exported account setup request and response DTO types.
 */
export type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  ValidateTokenResponse,
  SetupCustomFieldDto,
};

/**
 * HTTP service handling pre-authentication account setup and activation endpoints.
 * Uses IPublicApiService (no Bearer token or CSRF session injection).
 */
export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: IPublicApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.get<ValidateTokenResponse>(
      ACCOUNT_SETUP_ENDPOINTS.VALIDATE_TOKEN,
      undefined,
      undefined,
      { headers: { "X-Setup-Token": token } }
    );
  }

  async getCustomFields(token: string): Promise<SetupCustomFieldDto[]> {
    return this.api.get<SetupCustomFieldDto[]>(
      ACCOUNT_SETUP_ENDPOINTS.CUSTOM_FIELDS,
      undefined,
      undefined,
      { headers: { "X-Setup-Token": token } }
    );
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.post<ActivateAccountResponse>(
      ACCOUNT_SETUP_ENDPOINTS.ACTIVATE,
      request,
      undefined,
      { headers: { "X-Setup-Token": request.token } }
    );
  }
}
