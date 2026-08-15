import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  ValidateTokenResponse,
} from "./IAccountSetupService";

export interface IAccountSetupRepository {
  validateToken(token: string): Promise<ValidateTokenResponse>;
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
