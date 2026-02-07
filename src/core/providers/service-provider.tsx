"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

// Core services - using barrel import for hot reload stability
import { ApiService, NotificationService, NavigationService } from "@core/services";

import { AuthService, type IAuthService } from "@modules/auth/core/data/services/AuthService";
import { AuthRepository } from "@modules/auth/core/data/repositories/AuthRepository";
import { UserProfileService, type IUserProfileService } from "@modules/user/src/data/services/UserProfileService";
import { UserProfileRepository } from "@modules/user/src/data/repositories/UserProfileRepository";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { IUserProfileRepository } from "@modules/user/src/domain/interfaces/IUserProfileRepository";
import type { IApiService } from "@core/interfaces/api.interface";

/**
 * Services Interface
 * 
 * SOLID: Interface Segregation - expose interfaces not implementations
 */
interface Services {
  apiService: IApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authService: IAuthService;
  authRepository: IAuthRepository;
  userProfileRepository: IUserProfileRepository;
}

const ServiceContext = createContext<Services | null>(null);

/**
 * Service Provider
 * 
 * Clean Architecture DI Container for React.
 * Creates: Service → Repository chain with proper dependency injection.
 */
import { getCoreContainer } from "@core/di";

// ...

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    // Core Services - Use Singleton from DI Container
    // CRITICAL: This ensures we share the same instance (headers, tokens) as the rest of the app
    const apiService = getCoreContainer().apiService;
    const notificationService = new NotificationService();
    const navigationService = new NavigationService(apiService);

    // Auth Module - SOLID: Service → Repository
    const authService = new AuthService(apiService);
    const authRepository = new AuthRepository(authService);

    // User Module - SOLID: Service → Repository
    const userProfileService = new UserProfileService(apiService);
    const userProfileRepository = new UserProfileRepository(userProfileService);

    return {
      apiService,
      notificationService,
      navigationService,
      authService,
      authRepository,
      userProfileRepository,
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
}
