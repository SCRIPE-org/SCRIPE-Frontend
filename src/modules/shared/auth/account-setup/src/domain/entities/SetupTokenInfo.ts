/**
 * SetupTokenInfo — Domain Entity representing validated account setup token details.
 * Encapsulates tenant identity, assigned admin credentials, pre-filled profile details,
 * and tenant-specific password complexity requirements.
 *
 * @module auth/account-setup/domain/entities
 */

export interface SetupTokenInfoData {
  adminUsername: string;
  tenantName: string;
  email: string;
  isValid: boolean;
  errorMessage?: string;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  adminId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  tenantId?: string;
  tenantCode?: string;
  expiresAt?: string;
}

export class SetupTokenInfo {
  constructor(private readonly data: SetupTokenInfoData) {}

  get adminUsername(): string {
    return this.data.adminUsername ?? "";
  }

  get tenantName(): string {
    return this.data.tenantName ?? "";
  }

  get email(): string {
    return this.data.email ?? "";
  }

  get adminEmail(): string {
    return this.email;
  }

  get isValid(): boolean {
    return this.data.isValid ?? false;
  }

  get errorMessage(): string | undefined {
    return this.data.errorMessage;
  }

  get error(): string | undefined {
    return this.errorMessage;
  }

  get passwordMinLength(): number {
    return this.data.passwordMinLength ?? 8;
  }

  get passwordRequireUppercase(): boolean {
    return this.data.passwordRequireUppercase ?? true;
  }

  get passwordRequireNumber(): boolean {
    return this.data.passwordRequireNumber ?? true;
  }

  get passwordRequireSpecial(): boolean {
    return this.data.passwordRequireSpecial ?? true;
  }

  get adminId(): string | undefined {
    return this.data.adminId;
  }

  get firstName(): string {
    return this.data.firstName ?? "";
  }

  get lastName(): string {
    return this.data.lastName ?? "";
  }

  get phoneNumber(): string {
    return this.data.phoneNumber ?? "";
  }

  get profileImageUrl(): string {
    return this.data.profileImageUrl ?? "";
  }

  get tenantId(): string | undefined {
    return this.data.tenantId;
  }

  get tenantCode(): string {
    return this.data.tenantCode ?? "";
  }

  get expiresAt(): string | undefined {
    return this.data.expiresAt;
  }

  /**
   * Computed display name combining first and last name, or falling back to username.
   */
  get displayName(): string {
    const full = `${this.firstName} ${this.lastName}`.trim();
    return full.length > 0 ? full : this.adminUsername;
  }

  /**
   * Whether the invitation has pre-populated name details from provisioning.
   */
  get hasProfileName(): boolean {
    return Boolean(this.firstName || this.lastName);
  }

  copyWith(updates: Partial<SetupTokenInfoData>): SetupTokenInfo {
    return new SetupTokenInfo({ ...this.data, ...updates });
  }
}
