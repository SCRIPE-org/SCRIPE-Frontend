import { LoginRequest, LoginResponse } from "../entities/Auth";
import { User } from "../entities/User";
import type { WorkspaceInfo } from "../entities/WorkspaceInfo";
import { Result } from "@core/common/types/result";

/** Result of a successful login, carrying subscription metadata alongside the User */
export interface LoginResult {
  user: User;
  mustChangePassword: boolean;
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResult>;
  verify2FA(
    identifier: string,
    password: string,
    code: string,
    tenantId?: string
  ): Promise<LoginResult>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  hasToken(): boolean;
  refreshToken(): Promise<Result<LoginResponse, Error>>;
  clearTokens(): void;
  isAuthenticated(): boolean;
  discoverWorkspaces(email: string): Promise<{
    workspaces: WorkspaceInfo[];
    hasPlatformAccess: boolean;
  }>;
  /** Start impersonation — sets httpOnly cookie, returns access token */
  impersonate(adminId: string): Promise<void>;
  /** Stop impersonation — restores original admin session */
  stopImpersonation(): Promise<void>;
  /** Abstract the OIDC Consent form parameters generation out of the Presentation layer */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string
  ): { action: string; params: Record<string, string> };
  /** Link an external SSO account to the current admin profile */
  linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void>;
}
