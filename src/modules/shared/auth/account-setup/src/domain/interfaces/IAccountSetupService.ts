/**
 * IAccountSetupService — Low-level HTTP data contract for account setup endpoints.
 * Returns raw API DTOs.
 *
 * @module auth/account-setup/domain/interfaces
 */
import type {
  ValidateTokenResponse,
  SetupCustomFieldDto,
  ActivateAccountRequest,
  ActivateAccountResponse,
} from "../../data/models/AccountSetupModel";

export type {
  ValidateTokenResponse,
  SetupCustomFieldDto,
  ActivateAccountRequest,
  ActivateAccountResponse,
};

export interface IAccountSetupService {
  validateToken(token: string): Promise<ValidateTokenResponse>;
  getCustomFields(token: string): Promise<SetupCustomFieldDto[]>;
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
