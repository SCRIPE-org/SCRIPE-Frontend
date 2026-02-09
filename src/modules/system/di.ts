/**
 * System Module DI Container
 *
 * Provides dependency injection for all system submodules.
 * 
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories
 */
import { getCoreContainer } from "@/core/di";

// Services
import { AdminService } from "./admin/src/data/services/AdminService";
import { PermissionService } from "./permissions/src/data/services/PermissionService";
import { RoleService } from "./roles/src/data/services/RoleService";
import { TenantService } from "./tenants/src/data/services/TenantService";
import { TenantSettingsService } from "./tenant-settings/src/data/services/TenantSettingsService";
import { DashboardService } from "./dashboard/src/data/services/DashboardService";

// Repositories
import { AdminRepository } from "./admin/src/data/repositories/AdminRepository";
import { RoleRepository } from "./roles/src/data/repositories/RoleRepository";
import { PermissionRepository } from "./permissions/src/data/repositories/PermissionRepository";
import { TenantRepository } from "./tenants/src/data/repositories/TenantRepository";
import { MenuRepository } from "./menus/src/data/repositories/MenuRepository";
import { TenantSettingsRepository } from "./tenant-settings/src/data/repositories/TenantSettingsRepository";
import { DashboardRepository } from "./dashboard/src/data/repositories/DashboardRepository";

// Interfaces - Repositories
import type { IAdminRepository } from "./admin/src/domain/interfaces/IAdminRepository";
import type { IRoleRepository } from "./roles/src/domain/interfaces/IRoleRepository";
import type { IPermissionRepository } from "./permissions/src/domain/interfaces/IPermissionRepository";
import type { ITenantRepository } from "./tenants/src/domain/interfaces/ITenantRepository";
import type { IMenuRepository } from "./menus/src/domain/interfaces/IMenuRepository";
import type { ITenantSettingsRepository } from "./tenant-settings/src/domain/interfaces/ITenantSettingsRepository";
import type { IDashboardRepository } from "./dashboard/src/domain/interfaces/IDashboardRepository";

// Interfaces - Services (from domain/interfaces, NOT data/services)
import type { IAdminService } from "./admin/src/domain/interfaces/IAdminService";
import type { IPermissionService } from "./permissions/src/domain/interfaces/IPermissionService";
import type { IRoleService } from "./roles/src/domain/interfaces/IRoleService";
import type { ITenantService } from "./tenants/src/domain/interfaces/ITenantService";
import type { ITenantSettingsService } from "./tenant-settings/src/domain/interfaces/ITenantSettingsService";

export interface SystemContainer {
      // Services
      adminService: IAdminService;
      permissionService: IPermissionService;
      roleService: IRoleService;
      tenantService: ITenantService;
      tenantSettingsService: ITenantSettingsService;
      // Repositories
      adminRepository: IAdminRepository;
      roleRepository: IRoleRepository;
      permissionRepository: IPermissionRepository;
      tenantRepository: ITenantRepository;
      menuRepository: IMenuRepository;
      tenantSettingsRepository: ITenantSettingsRepository;
      dashboardRepository: IDashboardRepository;
}

let _container: SystemContainer | null = null;

/**
 * Get the system container (lazy initialization)
 */
export function getSystemContainer(): SystemContainer {
      if (!_container) {
            const { apiService } = getCoreContainer();

            // Create Services (wrap IApiService)
            const adminService = new AdminService(apiService);
            const permissionService = new PermissionService(apiService);
            const roleService = new RoleService(apiService);
            const tenantService = new TenantService(apiService);
            const tenantSettingsService = new TenantSettingsService(apiService);

            // Create Repositories (use Services)
            _container = {
                  // Services
                  adminService,
                  permissionService,
                  roleService,
                  tenantService,
                  tenantSettingsService,
                  // Repositories
                  adminRepository: new AdminRepository(adminService),
                  roleRepository: new RoleRepository(roleService),
                  permissionRepository: new PermissionRepository(permissionService),
                  tenantRepository: new TenantRepository(tenantService),
                  menuRepository: new MenuRepository(apiService), // TODO: Add MenuService
                  tenantSettingsRepository: new TenantSettingsRepository(tenantSettingsService),
                  dashboardRepository: new DashboardRepository(new DashboardService(apiService)),
            };
      }

      return _container;
}

/**
 * System container accessor (for use in components)
 */
export const systemContainer = {
      // Services
      get permissionService() {
            return getSystemContainer().permissionService;
      },
      get roleService() {
            return getSystemContainer().roleService;
      },
      get tenantService() {
            return getSystemContainer().tenantService;
      },
      get tenantSettingsService() {
            return getSystemContainer().tenantSettingsService;
      },
      // Repositories
      get adminRepository() {
            return getSystemContainer().adminRepository;
      },
      get roleRepository() {
            return getSystemContainer().roleRepository;
      },
      get permissionRepository() {
            return getSystemContainer().permissionRepository;
      },
      get tenantRepository() {
            return getSystemContainer().tenantRepository;
      },
      get menuRepository() {
            return getSystemContainer().menuRepository;
      },
      get tenantSettingsRepository() {
            return getSystemContainer().tenantSettingsRepository;
      },
      get dashboardRepository() {
            return getSystemContainer().dashboardRepository;
      },
};
