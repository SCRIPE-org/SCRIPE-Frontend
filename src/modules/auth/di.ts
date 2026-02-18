/**
 * Auth Module DI Container
 *
 * Auth is part of the Identity backend module.
 * Uses NEXT_PUBLIC_IDENTITY_API_URL with fallback to NEXT_PUBLIC_API_URL.
 *
 * This is the SINGLE source of truth for AuthService + AuthRepository.
 * The refresh handler is wired here so ApiService can auto-refresh tokens.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { getBaseApiService } from "@core/services/api-factory";
import { AuthService } from "./core/data/services/AuthService";
import { AuthRepository } from "./core/data/repositories/AuthRepository";
import type { IAuthRepository } from "./core/domain/interfaces/IAuthRepository";
import type { IAuthService } from "./core/data/services/AuthService";

export interface AuthContainer {
  authService: IAuthService;
  authRepository: IAuthRepository;
}

let _instance: AuthContainer | null = null;

function createContainer(): AuthContainer {
  // Use Identity module API (falls back to base URL)
  const apiService = getModuleApiService("IDENTITY");

  // Create auth chain: Service → Repository
  const authService = new AuthService(apiService);
  const authRepository = new AuthRepository(authService);

  // P5.2: Wire the token refresh handler into the BASE ApiService.
  // The refresh endpoint reads the refresh token from the httpOnly cookie
  // automatically via CookieAuthMiddleware — no need to read/send it from JS.
  const baseApi = getBaseApiService();
  baseApi.setRefreshHandler(async () => {
    const result = await authRepository.refreshToken();
    if (result.kind === "err") {
      authRepository.clearTokens();
      return null;
    }
    return result.value.accessToken;
  });

  return { authService, authRepository };
}

/**
 * Get the auth container singleton
 */
export function getAuthContainer(): AuthContainer {
  if (!_instance) {
    _instance = createContainer();
  }
  return _instance;
}

// Backward compatibility: named export
export const authContainer = new Proxy({} as AuthContainer, {
  get(_target, prop: keyof AuthContainer) {
    return getAuthContainer()[prop];
  },
});
