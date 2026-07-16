import type { IAccountSetupRepository } from "@modules/auth/core/domain/interfaces/IAccountSetupRepository";
import type {
  ActivateAccountRequest,
  ActivateAccountResponse,
  IAccountSetupService,
  ValidateTokenResponse,
} from "../../../../core/domain/interfaces/IAccountSetupService";

/**
 * AccountSetupRepository is the concrete implementation of the IAccountSetupRepository.
 * Acts as the clean boundary data layer coordinating between presentation ViewModels
 * and backend public services to process workspace administrator setup.
 */
export class AccountSetupRepository implements IAccountSetupRepository {
  constructor(private readonly service: IAccountSetupService) {}

  validateToken(token: string): Promise<ValidateTokenResponse> {
    return this.service.validateToken(token);
  }

  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    return this.service.activateAccount(request);
  }
}
