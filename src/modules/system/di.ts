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
import { PermissionService } from "./permissions/src/data/services/PermissionService";
import { RoleService } from "./roles/src/data/services/RoleService";
import { TenantService } from "./tenants/src/data/services/TenantService";

// Repositories
import { AdminRepository } from "./admin/src/data/repositories/AdminRepository";
import { RoleRepository } from "./roles/src/data/repositories/RoleRepository";
import { PermissionRepository } from "./permissions/src/data/repositories/PermissionRepository";
import { TenantRepository } from "./tenants/src/data/repositories/TenantRepository";
import { MenuRepository } from "./menus/src/data/repositories/MenuRepository";

// Interfaces - Repositories
import type { IAdminRepository } from "./admin/src/domain/interfaces/IAdminRepository";
import type { IRoleRepository } from "./roles/src/domain/interfaces/IRoleRepository";
import type { IPermissionRepository } from "./permissions/src/domain/interfaces/IPermissionRepository";
import type { ITenantRepository } from "./tenants/src/domain/interfaces/ITenantRepository";
import type { IMenuRepository } from "./menus/src/domain/interfaces/IMenuRepository";

// Interfaces - Services (from domain/interfaces, NOT data/services)
import type { IPermissionService } from "./permissions/src/domain/interfaces/IPermissionService";
import type { IRoleService } from "./roles/src/domain/interfaces/IRoleService";
import type { ITenantService } from "./tenants/src/domain/interfaces/ITenantService";

export interface SystemContainer {
      // Services
      permissionService: IPermissionService;
      roleService: IRoleService;
      tenantService: ITenantService;
      // Repositories
      adminRepository: IAdminRepository;
      roleRepository: IRoleRepository;
      permissionRepository: IPermissionRepository;
      tenantRepository: ITenantRepository;
      menuRepository: IMenuRepository;
}

let _container: SystemContainer | null = null;

/**
 * Get the system container (lazy initialization)
 */
export function getSystemContainer(): SystemContainer {
      if (!_container) {
            const { apiService } = getCoreContainer();

            // Create Services (wrap IApiService)
            const permissionService = new PermissionService(apiService);
            const roleService = new RoleService(apiService);
            const tenantService = new TenantService(apiService);

            // Create Repositories (use Services)
            _container = {
                  // Services
                  permissionService,
                  roleService,
                  tenantService,
                  // Repositories
                  adminRepository: new AdminRepository(apiService), // TODO: Add AdminService
                  roleRepository: new RoleRepository(roleService),
                  permissionRepository: new PermissionRepository(permissionService),
                  tenantRepository: new TenantRepository(tenantService),
                  menuRepository: new MenuRepository(apiService), // TODO: Add MenuService
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
};
