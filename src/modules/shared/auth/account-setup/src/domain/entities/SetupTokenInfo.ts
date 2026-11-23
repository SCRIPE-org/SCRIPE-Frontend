/**
 * SetupTokenInfo — Domain Entity representing validated account setup token details.
 * Encapsulates tenant identity, assigned admin credentials, pre-filled profile details,
 * and tenant-specific password complexity requirements.
 *
 * @module auth/account-setup/domain/entities
 */

import { mapLegacySetupPolicy, type PasswordPolicyModel } from "@core/common/password-policy";

/** Raw hydrated account-setup invitation payload returned by the backend validation endpoint. */
export interface SetupTokenInfoData {
  adminUsername: string;
  tenantName: string;
  email: string;
  isValid: boolean;
  errorMessage?: string;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  passwordPolicy?: import("@core/common/password-policy").PasswordPolicyModel | null;
  adminId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  tenantId?: string;
  tenantCode?: string;
  expiresAt?: string;
}

/**
 * Documentation for module export
 */
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
    return this.passwordPolicy?.minLength ?? this.data.passwordMinLength ?? 8;
  }

  get passwordRequireUppercase(): boolean {
    return this.passwordPolicy?.requireUppercase ?? this.data.passwordRequireUppercase ?? false;
  }

  get passwordRequireLowercase(): boolean {
    return this.passwordPolicy?.requireLowercase ?? this.data.passwordRequireLowercase ?? false;
  }

  get passwordRequireNumber(): boolean {
    return this.passwordPolicy?.requireNumber ?? this.data.passwordRequireNumber ?? false;
  }

  get passwordRequireSpecial(): boolean {
    return this.passwordPolicy?.requireSpecial ?? this.data.passwordRequireSpecial ?? false;
  }

  get passwordPolicy(): PasswordPolicyModel | null {
    return mapLegacySetupPolicy({
      passwordPolicy: this.data.passwordPolicy,
      passwordMinLength: this.data.passwordMinLength,
      passwordRequireUppercase: this.data.passwordRequireUppercase,
      passwordRequireLowercase: this.data.passwordRequireLowercase,
      passwordRequireNumber: this.data.passwordRequireNumber,
      passwordRequireSpecial: this.data.passwordRequireSpecial,
    });
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
