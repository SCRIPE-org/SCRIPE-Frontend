import { NotificationService } from './services/notification.service';
import { AuthRepository } from "@modules/auth/core/data/repositories/AuthRepository";
import { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import { IApiService } from './interfaces/api.interface';
import { ApiService } from './services/api.service';

// 3. Container Interface
export interface CoreContainer {
      apiService: IApiService;
      notificationService: NotificationService;
      authRepository: IAuthRepository;
}

// 4. Singleton
let container: CoreContainer | null = null;

export function getCoreContainer(): CoreContainer {
      if (!container) {
            container = {
                  apiService: new ApiService(),
                  notificationService: new NotificationService(),
                  authRepository: new AuthRepository(new ApiService()), // Create new instance or reuse? Ideally share ApiService.
            };
      }
      return container;
}
