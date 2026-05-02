"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

// Core services
import { NotificationService, NavigationService } from "@core/services";
import { getCoreContainer } from "@core/di";
import { getAuthContainer } from "@modules/auth/di";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { IAuthService } from "@modules/auth/core/domain/interfaces/IAuthService";
import type {
  IAccountSetupRepository,
  IPasswordResetRepository,
  ISsoRepository,
  ITenantResolutionRepository,
} from "@modules/auth/core/domain/interfaces";

/**
 * Services Interface
 *
 * SOLID: Interface Segregation - expose interfaces not implementations
 *
 * Core services (apiService, notificationService) come from core/di.ts
 * Auth services (authService, authRepository) come from auth/di.ts
 */
interface Services {
  apiService: IApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authService: IAuthService;
  authRepository: IAuthRepository;
  tenantResolutionRepository: ITenantResolutionRepository;
  ssoRepository: ISsoRepository;
  passwordResetRepository: IPasswordResetRepository;
  accountSetupRepository: IAccountSetupRepository;
}

const ServiceContext = createContext<Services | null>(null);

/**
 * Service Provider
 *
 * React context wrapper that composes services from the DI containers.
 * No service creation here — just delegates to the proper DI containers.
 */
export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    // Core DI Container
    const { apiService, notificationService } = getCoreContainer();
    const navigationService = new NavigationService(apiService);

    // Auth DI Container (triggers refresh handler wiring on first access)
    const {
      authService,
      authRepository,
      tenantResolutionRepository,
      ssoRepository,
      passwordResetRepository,
      accountSetupRepository,
    } = getAuthContainer();

    return {
      apiService,
      notificationService,
      navigationService,
      authService,
      authRepository,
      tenantResolutionRepository,
      ssoRepository,
      passwordResetRepository,
      accountSetupRepository,
    };
  }, []);

  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
}
