/**
 * Auth Module DI Container
 *
 * Auth is part of the Identity backend module.
 * Uses NEXT_PUBLIC_IDENTITY_API_URL with fallback to NEXT_PUBLIC_API_URL.
 */
import { getBaseApiService, getModuleApiService } from "@core/services/api-factory";
import { useAppStore } from "@core/store/useAppStore";
import { authBroadcast } from "@core/common/broadcast-auth";

import { AuthService } from "./core/data/services/AuthService";
import { PublicApiService } from "@core/services";
import { TenantResolutionService } from "./core/data/services/TenantResolutionService";
import { SsoService } from "./core/data/services/SsoService";
import { PasswordResetService } from "./core/data/services/PasswordResetService";
import { AccountSetupService } from "./account-setup/src/data/services/AccountSetupService";
import { SignupService } from "./signup/src/data/services/SignupService";
import { PasskeyService } from "./core/src/data/services/PasskeyService";

import { AuthRepository } from "./core/data/repositories/AuthRepository";
import { TenantResolutionRepository } from "./core/data/repositories/TenantResolutionRepository";
import { SsoRepository } from "./core/data/repositories/SsoRepository";
import { PasswordResetRepository } from "./core/data/repositories/PasswordResetRepository";
import { AccountSetupRepository } from "./account-setup/src/data/repositories/AccountSetupRepository";
import { SignupRepository } from "./signup/src/data/repositories/SignupRepository";
import { PasskeyRepository } from "./core/src/data/repositories/PasskeyRepository";

import type { IAuthRepository } from "./core/domain/interfaces/IAuthRepository";
import type { IAuthService } from "./core/domain/interfaces/IAuthService";
import type { ITenantResolutionRepository } from "./core/domain/interfaces/ITenantResolutionRepository";
import type { ISsoRepository } from "./core/domain/interfaces/ISsoRepository";
import type { IPasswordResetRepository } from "./core/domain/interfaces/IPasswordResetRepository";
import type { IAccountSetupRepository } from "./core/domain/interfaces/IAccountSetupRepository";
import type { ISignupRepository } from "./signup/src/domain/interfaces/ISignupRepository";
import type { IPasskeyRepository } from "./core/src/domain/interfaces/IPasskeyRepository";

export interface AuthContainer {
  authService: IAuthService;
  authRepository: IAuthRepository;
  tenantResolutionRepository: ITenantResolutionRepository;
  ssoRepository: ISsoRepository;
  passwordResetRepository: IPasswordResetRepository;
  accountSetupRepository: IAccountSetupRepository;
  signupRepository: ISignupRepository;
  passkeyRepository: IPasskeyRepository;
}

let _instance: AuthContainer | null = null;

function createContainer(): AuthContainer {
  const apiService = getModuleApiService("IDENTITY");
  const publicApiService = new PublicApiService(apiService);

  const authService = new AuthService(apiService);
  const authRepository = new AuthRepository(authService);
  const tenantResolutionRepository = new TenantResolutionRepository(
    new TenantResolutionService(publicApiService)
  );
  const ssoRepository = new SsoRepository(new SsoService(publicApiService));
  const passwordResetRepository = new PasswordResetRepository(
    new PasswordResetService(publicApiService)
  );
  const accountSetupRepository = new AccountSetupRepository(
    new AccountSetupService(publicApiService)
  );
  const signupRepository = new SignupRepository(new SignupService(publicApiService));
  const passkeyRepository = new PasskeyRepository(new PasskeyService(apiService));

  const baseApi = getBaseApiService();
  baseApi.setRefreshHandler(async () => {
    const result = await authRepository.refreshToken();
    if (result.kind === "err") {
      authRepository.clearTokens();
      return null;
    }
    return result.value.accessToken;
  });

  baseApi.setLogoutHandler(() => {
    useAppStore.getState().logout();
  });

  authBroadcast.onLogout(() => {
    useAppStore.getState().logout();
  });

  return {
    authService,
    authRepository,
    tenantResolutionRepository,
    ssoRepository,
    passwordResetRepository,
    accountSetupRepository,
    signupRepository,
    passkeyRepository,
  };
}

export function getAuthContainer(): AuthContainer {
  if (!_instance) {
    _instance = createContainer();
  }
  return _instance;
}

export const authContainer = new Proxy({} as AuthContainer, {
  get(_target, prop: keyof AuthContainer) {
    return getAuthContainer()[prop];
  },
});
