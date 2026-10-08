/**
 * Account Setup Service
 *
 * Handles public API calls for the account activation flow through IPublicApiService.
 *
 * @module auth/account-setup
 */
import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  IAccountSetupService,
  SetupCustomFieldDto,
  ValidateTokenResponse,
} from "../../domain/interfaces/IAccountSetupService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import { ACCOUNT_SETUP_ENDPOINTS } from "./account-setup.endpoints";

/**
 * Documentation for module export
 */
export type { ActivateAccountRequest, ActivateAccountResponse, ValidateTokenResponse, SetupCustomFieldDto };

/**
 * Documentation for module export
 */
export class AccountSetupService implements IAccountSetupService {
  constructor(private readonly api: IPublicApiService) {}

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.api.get<ValidateTokenResponse>(ACCOUNT_SETUP_ENDPOINTS.VALIDATE_TOKEN(token));
  }

  async getCustomFields(token: string): Promise<SetupCustomFieldDto[]> {
    return this.api.get<SetupCustomFieldDto[]>(ACCOUNT_SETUP_ENDPOINTS.CUSTOM_FIELDS(token));
  }

  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.api.post<ActivateAccountResponse>(ACCOUNT_SETUP_ENDPOINTS.ACTIVATE, request);
  }
}
