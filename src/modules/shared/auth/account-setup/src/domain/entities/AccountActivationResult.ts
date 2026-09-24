/**
 * AccountActivationResult — Domain Entity representing the finalized account setup submission outcome.
 *
 * @module auth/account-setup/domain/entities
 */

export interface AccountActivationResultData {
  success: boolean;
  adminUsername?: string;
  tenantName?: string;
  errorMessage?: string;
}

export class AccountActivationResult {
  constructor(private readonly data: AccountActivationResultData) {}

  get isSuccess(): boolean {
    return this.data.success ?? false;
  }

  get success(): boolean {
    return this.isSuccess;
  }

  get adminUsername(): string {
    return this.data.adminUsername ?? "";
  }

  get tenantName(): string {
    return this.data.tenantName ?? "";
  }

  get errorMessage(): string | undefined {
    return this.data.errorMessage;
  }

  get error(): string | undefined {
    return this.errorMessage;
  }

  copyWith(updates: Partial<AccountActivationResultData>): AccountActivationResult {
    return new AccountActivationResult({ ...this.data, ...updates });
  }
}
