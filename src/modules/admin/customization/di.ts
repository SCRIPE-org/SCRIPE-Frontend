/**
 * Customization Module DI Container
 *
 * Provides dependency injection for customization submodules:
 * Branding, Customizer Studio, Tenant Settings, Menus, Themes
 *
 * Aligns with the Customization microservice backend.
 * Backend API: CUSTOMIZATION
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { CustomizationService } from "./branding/src/data/services/CustomizationService";
import { TenantSettingsService } from "./tenant-settings/src/data/services/TenantSettingsService";
import { MenuService } from "./menus/src/data/services/MenuService";
import { ThemeMarketplaceService } from "./branding/src/data/services/ThemeMarketplaceService";
import { ThemeBundleService } from "./branding/src/data/services/ThemeBundleService";

// Repositories
import { CustomizationRepository } from "./branding/src/data/repositories/CustomizationRepository";
import { TenantSettingsRepository } from "./tenant-settings/src/data/repositories/TenantSettingsRepository";
import { MenuRepository } from "./menus/src/data/repositories/MenuRepository";
import { ThemeMarketplaceRepository } from "./branding/src/data/repositories/ThemeMarketplaceRepository";
import { ThemeBundleRepository } from "./branding/src/data/repositories/ThemeBundleRepository";

// Interfaces
import type { ICustomizationRepository } from "./branding/src/domain/interfaces/ICustomizationRepository";
import type { ICustomizationService } from "./branding/src/domain/interfaces/ICustomizationService";
import type { ITenantSettingsRepository } from "./tenant-settings/src/domain/interfaces/ITenantSettingsRepository";
import type { ITenantSettingsService } from "./tenant-settings/src/domain/interfaces/ITenantSettingsService";
import type { IMenuRepository } from "./menus/src/domain/interfaces/IMenuRepository";
import type { IThemeMarketplaceRepository } from "./branding/src/domain/interfaces/IThemeMarketplaceRepository";
import type { IThemeBundleRepository } from "./branding/src/domain/interfaces/IThemeBundleRepository";

export interface CustomizationContainer {
  // Services (directly exposed for settings/studio layers)
  customizationService: ICustomizationService;
  tenantSettingsService: ITenantSettingsService;
  // Repositories
  customizationRepository: ICustomizationRepository;
  tenantSettingsRepository: ITenantSettingsRepository;
  menuRepository: IMenuRepository;
  themeMarketplaceRepository: IThemeMarketplaceRepository;
  themeBundleRepository: IThemeBundleRepository;
}

let _container: CustomizationContainer | null = null;

/**
 * Get the customization container (lazy initialization)
 * Uses CUSTOMIZATION API service — separate microservice
 */
export function getCustomizationContainer(): CustomizationContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      customizationService: dummyProxy,
      tenantSettingsService: dummyProxy,
      customizationRepository: dummyProxy,
      tenantSettingsRepository: dummyProxy,
      menuRepository: dummyProxy,
      themeMarketplaceRepository: dummyProxy,
      themeBundleRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("CUSTOMIZATION");

    const customizationService = new CustomizationService(apiService);
    const tenantSettingsService = new TenantSettingsService(apiService);

    _container = {
      customizationService,
      tenantSettingsService,
      customizationRepository: new CustomizationRepository(customizationService),
      tenantSettingsRepository: new TenantSettingsRepository(tenantSettingsService),
      menuRepository: new MenuRepository(new MenuService(apiService)),
      themeMarketplaceRepository: new ThemeMarketplaceRepository(
        new ThemeMarketplaceService(apiService)
      ),
      themeBundleRepository: new ThemeBundleRepository(new ThemeBundleService(apiService)),
    };
  }

  return _container;
}

/**
 * Customization container accessor (for use in components)
 */
export const customizationContainer = {
  get customizationService() {
    return getCustomizationContainer().customizationService;
  },
  get customizationRepository() {
    return getCustomizationContainer().customizationRepository;
  },
  get tenantSettingsService() {
    return getCustomizationContainer().tenantSettingsService;
  },
  get tenantSettingsRepository() {
    return getCustomizationContainer().tenantSettingsRepository;
  },
  get menuRepository() {
    return getCustomizationContainer().menuRepository;
  },
  get themeMarketplaceRepository() {
    return getCustomizationContainer().themeMarketplaceRepository;
  },
  get themeBundleRepository() {
    return getCustomizationContainer().themeBundleRepository;
  },
};
