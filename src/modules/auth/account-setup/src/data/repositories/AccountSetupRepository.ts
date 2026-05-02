import type { IAccountSetupRepository } from "../../../../core/domain/interfaces/IAccountSetupRepository";
import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  IAccountSetupService,
  ValidateTokenResponse,
} from "../../../../core/domain/interfaces/IAccountSetupService";

export class AccountSetupRepository implements IAccountSetupRepository {
  constructor(private readonly service: IAccountSetupService) {}

  validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.service.validateToken(token);
  }

  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.service.activateAccount(request);
  }
}
