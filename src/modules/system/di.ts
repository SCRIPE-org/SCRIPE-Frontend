/**
 * System Module DI Container
 *
 * Provides dependency injection for all system submodules.
 */
import { getCoreContainer } from "@/core/di";
import { AdminRepository } from "./admin/src/data/repositories/AdminRepository";
import { RoleRepository } from "./roles/src/data/repositories/RoleRepository";
import { PermissionRepository } from "./permissions/src/data/repositories/PermissionRepository";
import { TenantRepository } from "./tenants/src/data/repositories/TenantRepository";
import { MenuRepository } from "./menus/src/data/repositories/MenuRepository";
import type { IAdminRepository } from "./admin/src/domain/interfaces/IAdminRepository";
import type { IRoleRepository } from "./roles/src/domain/interfaces/IRoleRepository";
import type { IPermissionRepository } from "./permissions/src/domain/interfaces/IPermissionRepository";
import type { ITenantRepository } from "./tenants/src/domain/interfaces/ITenantRepository";
import type { IMenuRepository } from "./menus/src/domain/interfaces/IMenuRepository";

export interface SystemContainer {
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

            _container = {
                  adminRepository: new AdminRepository(apiService),
                  roleRepository: new RoleRepository(apiService),
                  permissionRepository: new PermissionRepository(apiService),
                  tenantRepository: new TenantRepository(apiService),
                  menuRepository: new MenuRepository(apiService),
            };
      }

      return _container;
}

/**
 * System container accessor (for use in components)
 */
export const systemContainer = {
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
