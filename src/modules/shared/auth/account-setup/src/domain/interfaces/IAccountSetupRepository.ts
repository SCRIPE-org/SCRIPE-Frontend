/**
 * IAccountSetupRepository — Domain repository contract for account setup.
 * Returns rich, immutable domain entities.
 *
 * @module auth/account-setup/domain/interfaces
 */

import type {
  SetupTokenInfo,
  SetupCustomField,
  AccountActivationResult,
} from "../entities";
import type { ActivateAccountRequest } from "./IAccountSetupService";

/**
 * Documentation for module export
 */
export interface IAccountSetupRepository {
  validateToken(token: string): Promise<SetupTokenInfo>;
  getCustomFields(token: string): Promise<SetupCustomField[]>;
  activateAccount(request: ActivateAccountRequest): Promise<AccountActivationResult>;
}
