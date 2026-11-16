/**
 * Account Setup Service
 *
 * Handles public API calls for the account activation flow through IApiService public endpoints.
 *
 * @module auth/account-setup
 */
import type { IApiService } from "@core/interfaces/api.interface";
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
 */
export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: IApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.getPublic<ValidateTokenResponse>(
      ACCOUNT_SETUP_ENDPOINTS.VALIDATE_TOKEN(token)
    );
  }

  async getCustomFields(token: string): Promise<SetupCustomFieldDto[]> {
    return this.api.getPublic<SetupCustomFieldDto[]>(
      ACCOUNT_SETUP_ENDPOINTS.CUSTOM_FIELDS(token)
    );
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.postPublic<ActivateAccountResponse>(ACCOUNT_SETUP_ENDPOINTS.ACTIVATE, request);
  }
}
