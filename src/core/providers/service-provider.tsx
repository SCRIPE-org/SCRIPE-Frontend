"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

// Core DI
import { getCoreContainer } from "@core/di";
import { NotificationService } from "@core/services";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { INavigationRepository } from "@core/navigation";

// Auth DI
import { getAuthContainer } from "@modules/auth/di";
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
 * SOLID: Interface Segregation — expose interfaces, not implementations.
 *
 * Core services come from core/di.ts.
 * Auth services come from auth/di.ts.
 * No service instances are created here — this is pure wiring.
 */
interface Services {
  /** Authenticated HTTP client — requires Bearer token */
  apiService: IApiService;
  /** Unauthenticated HTTP client — no auth headers, no CSRF */
  publicApiService: IPublicApiService;
  notificationService: NotificationService;
  /**
   * Navigation data repository — JIT workspace fetching + access checks.
   * Implements INavigationRepository.
   */
  navigationRepository: INavigationRepository;
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
    // Core DI Container — singleton, instantiated once
    const {
      apiService,
      publicApiService,
      notificationService,
      navigationRepository,
    } = getCoreContainer();

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
      publicApiService,
      notificationService,
      navigationRepository,
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
