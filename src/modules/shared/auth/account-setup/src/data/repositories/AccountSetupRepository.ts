/**
 * AccountSetupRepository — Data repository implementation for account setup.
 * Invokes AccountSetupService and transforms DTOs to rich Domain Entities via AccountSetupMapper.
 *
 * @module auth/account-setup/data/repositories
 */

import type { IAccountSetupRepository } from "../../domain/interfaces/IAccountSetupRepository";
import type {
  ActivateAccountRequest,
  IAccountSetupService,
} from "../../domain/interfaces/IAccountSetupService";
import type {
  SetupTokenInfo,
  SetupCustomField,
  AccountActivationResult,
} from "../../domain/entities";
import { AccountSetupMapper } from "../mappers/AccountSetupMapper";

export class AccountSetupRepository implements IAccountSetupRepository {
  constructor(private readonly service: IAccountSetupService) {}

  async validateToken(token: string): Promise<SetupTokenInfo> {
    const dto = await this.service.validateToken(token);
    return AccountSetupMapper.toTokenInfoEntity(dto);
  }

  async getCustomFields(token: string): Promise<SetupCustomField[]> {
    const dtos = await this.service.getCustomFields(token);
    return dtos.map(AccountSetupMapper.toCustomFieldEntity);
  }

  async activateAccount(request: ActivateAccountRequest): Promise<AccountActivationResult> {
    const dto = await this.service.activateAccount(request);
    return AccountSetupMapper.toActivationResultEntity(dto);
  }
}
