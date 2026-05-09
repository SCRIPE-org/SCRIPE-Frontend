/**
 * Auth Model (DTO)
 *
 * Represents the raw API request/response for authentication.
 * Contains static methods for JSON serialization/deserialization.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they are stripped from API responses by the backend CookieAuthMiddleware
 * and are never present in the frontend data layer.
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper → Entity (used in app)
 * - Entity → Mapper → Model.toJson() → API Request
 *
 * @module auth/data
 */

// ===== JSON Shapes (API contracts) =====

export interface LoginRequestJson {
  identifier: string;
  password: string;
  tenantId?: string;
  deviceInfo?: string;
  /** Signals explicit platform admin workspace selection — prevents discovery loop */
  isPlatformAdmin?: boolean;
}

export interface UserProfileJson {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  modifiedAt?: string | null;
  notes?: string | null;
  roles: {
    roleId: string;
    roleNameEn: string;
    roleNameAr: string;
    roleCode: string;
    tenantId?: string | null;
    tenantName?: string | null;
    inheritToChildren?: boolean;
    expiresAt?: string | null;
  }[];
  permissions: string[];
  tenantId?: string | null;
  tenantName?: string | null;
  isSuperAdmin: boolean;
  isProtected: boolean;
  isAccountActivated: boolean;
  mustChangePassword: boolean;
  isTwoFactorEnabled?: boolean;
  backupCodesRemaining?: number | null;
  isPasswordExpired?: boolean;
  daysUntilPasswordExpiry?: number | null;
  passwordLastChanged?: string | null;
  restrictedFields?: Record<string, string[]> | null;
}

export interface WorkspaceChoiceJson {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
  isDisabled?: boolean;
  disabledReason?: string | null;
}

export interface LoginResponseJson {
  success?: boolean;
  accessToken: string;
  requires2FA?: boolean;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: WorkspaceChoiceJson[] | null;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: UserProfileJson | null;
}

// ===== Model Classes =====

/**
 * Login Request Model
 */
export class LoginRequestModel {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
    public readonly tenantId?: string,
    public readonly deviceInfo?: string,
    public readonly isPlatformAdmin: boolean = false
  ) {}

  static fromJson(json: LoginRequestJson): LoginRequestModel {
    return new LoginRequestModel(
      json.identifier,
      json.password,
      json.tenantId,
      json.deviceInfo,
      json.isPlatformAdmin ?? false
    );
  }

  toJson(): LoginRequestJson {
    return {
      identifier: this.identifier,
      password: this.password,
      tenantId: this.tenantId,
      deviceInfo: this.deviceInfo,
      isPlatformAdmin: this.isPlatformAdmin || undefined, // omit when false to keep payload lean
    };
  }
}

/**
 * Login Response Model
 */
export class LoginResponseModel {
  constructor(
    public readonly accessToken: string,
    public readonly success: boolean = true,
    public readonly requires2FA: boolean = false,
    public readonly requiresWorkspaceSelection: boolean = false,
    public readonly availableWorkspaces: WorkspaceChoiceJson[] | null = null,
    public readonly mustChangePassword: boolean = false,
    public readonly subscriptionStatus: string | null = null,
    public readonly gracePhase: string | null = null,
    public readonly editionName: string | null = null,
    public readonly userProfile: UserProfileJson | null = null
  ) {}

  static fromJson(json: LoginResponseJson): LoginResponseModel {
    return new LoginResponseModel(
      json.accessToken ?? "",
      json.success ?? true,
      json.requires2FA ?? false,
      json.requiresWorkspaceSelection ?? false,
      json.availableWorkspaces ?? null,
      json.mustChangePassword ?? false,
      json.subscriptionStatus ?? null,
      json.gracePhase ?? null,
      json.editionName ?? null,
      json.userProfile ?? null
    );
  }

  toJson(): LoginResponseJson {
    return {
      success: this.success,
      accessToken: this.accessToken,
      requires2FA: this.requires2FA,
      requiresWorkspaceSelection: this.requiresWorkspaceSelection,
      availableWorkspaces: this.availableWorkspaces,
      mustChangePassword: this.mustChangePassword,
      subscriptionStatus: this.subscriptionStatus,
      gracePhase: this.gracePhase,
      editionName: this.editionName,
      userProfile: this.userProfile,
    };
  }

  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}
