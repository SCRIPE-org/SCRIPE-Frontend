/**
 * Auth Types - Domain Layer
 *
 * @module auth/core/domain
 */
export interface LoginRequestJson {
  identifier: string;
  password: string;
  tenantId?: string;
  deviceInfo?: string;
  isPlatformAdmin?: boolean;
}

export interface LoginRequestModel {
  toJson(): LoginRequestJson;
}

export interface LoginResponseJson {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  success?: boolean;
  userProfile?: unknown | null;
  requires2FA?: boolean;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: Array<{
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    logoUrl: string | null;
    isPlatformAdmin: boolean;
    isActivated: boolean;
    isDisabled?: boolean;
    disabledReason?: string | null;
  }> | null;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  isSuccessful?: boolean;
}

export interface LoginResponseModel extends LoginResponseJson {
  success: boolean;
  requires2FA: boolean;
  requiresWorkspaceSelection: boolean;
  availableWorkspaces: Array<{
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    logoUrl: string | null;
    isPlatformAdmin: boolean;
    isActivated: boolean;
    isDisabled?: boolean;
    disabledReason?: string | null;
  }> | null;
  mustChangePassword: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  userProfile: unknown | null;
  isSuccessful: boolean;
  toJson(): LoginResponseJson;
}

export interface Verify2FARequestJson {
  identifier: string;
  password: string;
  code: string;
  tenantId?: string;
}

export interface Verify2FARequestModel {
  toJson(): Verify2FARequestJson;
}

export interface Verify2FAResponseJson {
  accessToken: string;
  expiresAt: string;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: unknown;
}

export interface Verify2FAResponseModel extends Verify2FAResponseJson {
  mustChangePassword: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
}

export interface WorkspaceInfoDto {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
}

export interface DiscoverWorkspacesResponseDto {
  workspaces: WorkspaceInfoDto[];
  hasPlatformAccess: boolean;
}
