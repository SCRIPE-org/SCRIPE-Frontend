import { NotificationService } from './services/notification.service';
import { AuthRepository } from "@modules/auth/core/data/repositories/AuthRepository";
import { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import { IApiService } from './interfaces/api.interface';
import { ApiService } from './services/api.service';

/**
 * Core Dependency Injection Container
 * 
 * This is the SINGLE source of truth for all core service instantiation.
 * 
 * Rules:
 * - ALL services are created HERE
 * - ServiceProvider just wraps this for React access
 * - Modules access via getCoreContainer() or useServices() hook
 */
export interface CoreContainer {
      apiService: IApiService;
      notificationService: NotificationService;
      authRepository: IAuthRepository;
}

// Singleton instance
let container: CoreContainer | null = null;

/**
 * Initialize core container (called once at app startup)
 */
function initContainer(): CoreContainer {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

      // 1. Create Services (Singleton)
      const apiService = new ApiService(apiUrl);
      const notificationService = new NotificationService();

      // 2. Create Repositories (Inject Services)
      const authRepository = new AuthRepository(apiService);

      // 3. Wire up Circular Dependencies (The "link back")
      //    This enables ApiService to refresh tokens using AuthRepository logic
      //    without creating a recursive dependency loop during instantiation.
      apiService.setRefreshHandler(async () => {
            const refreshToken = authRepository.getRefreshToken();
            if (!refreshToken) return null;

            const result = await authRepository.refreshToken(refreshToken);
            if (result.kind === 'err') {
                  authRepository.clearTokens();
                  return null;
            }
            return result.value.accessToken;
      });

      return {
            apiService,
            notificationService,
            authRepository
      };
}

/**
 * Get the core container singleton
 */
export function getCoreContainer(): CoreContainer {
      if (!container) {
            container = initContainer();
      }
      return container;
}
