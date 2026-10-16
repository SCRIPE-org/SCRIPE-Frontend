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

/**
 * Documentation for module export
 */
export type {
  ValidateTokenResponse,
  SetupCustomFieldDto,
  ActivateAccountRequest,
  ActivateAccountResponse,
};

/**
 * Documentation for module export
 */
export interface IAccountSetupService {
  validateToken(token: string): Promise<ValidateTokenResponse>;
  getCustomFields(token: string): Promise<SetupCustomFieldDto[]>;
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
