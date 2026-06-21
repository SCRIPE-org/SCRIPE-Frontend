/**
 * Identity Module DI Container
 *
 * Provides dependency injection for pure identity & access submodules:
 * Admin, Roles, Permissions, Tenants, Users, User Groups, Identity Providers, OAuth Apps
 *
 * Previously contained 23 submodules — now slimmed to 9 after domain extraction.
 * Monitoring, Customization, Messaging, Compliance, and Recycle Bin have their own containers.
 *
 * Backend API: Identity
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { AdminService } from "./admin/src/data/services/AdminService";
import { PermissionService } from "./permissions/src/data/services/PermissionService";
import { RoleService } from "./roles/src/data/services/RoleService";
import { TenantService } from "./tenants/src/data/services/TenantService";
import { UserGroupService } from "./user-groups/src/data/services/UserGroupService";
import { IdentityProviderService } from "./identity-providers/src/data/services/IdentityProviderService";
import { OAuthAppService } from "./oauth-apps/src/data/services/OAuthAppService";
import { UsersService } from "./users/src/data/services/UsersService";

// Repositories
import { AdminRepository } from "./admin/src/data/repositories/AdminRepository";
import { RoleRepository } from "./roles/src/data/repositories/RoleRepository";
import { PermissionRepository } from "./permissions/src/data/repositories/PermissionRepository";
import { TenantRepository } from "./tenants/src/data/repositories/TenantRepository";
import { UserGroupRepository } from "./user-groups/src/data/repositories/UserGroupRepository";
import { IdentityProviderRepository } from "./identity-providers/src/data/repositories/IdentityProviderRepository";
import { OAuthAppRepository } from "./oauth-apps/src/data/repositories/OAuthAppRepository";
import { UsersRepository } from "./users/src/data/repositories/UsersRepository";

// Interfaces - Repositories
import type { IAdminRepository } from "./admin/src/domain/interfaces/IAdminRepository";
import type { IRoleRepository } from "./roles/src/domain/interfaces/IRoleRepository";
import type { IPermissionRepository } from "./permissions/src/domain/interfaces/IPermissionRepository";
import type { ITenantRepository } from "./tenants/src/domain/interfaces/ITenantRepository";
import type { IUserGroupRepository } from "./user-groups/src/domain/interfaces/IUserGroupRepository";
import type { IIdentityProviderRepository } from "./identity-providers/src/domain/interfaces/IIdentityProviderRepository";
import type { IOAuthAppRepository } from "./oauth-apps/src/domain/interfaces/IOAuthAppRepository";
import type { IUsersRepository } from "./users/src/domain/interfaces/IUsersRepository";

// Interfaces - Services (from domain/interfaces, NOT data/services)
import type { IAdminService } from "./admin/src/domain/interfaces/IAdminService";
import type { IPermissionService } from "./permissions/src/domain/interfaces/IPermissionService";
import type { IRoleService } from "./roles/src/domain/interfaces/IRoleService";
import type { ITenantService } from "./tenants/src/domain/interfaces/ITenantService";

export interface IdentityContainer {
  // Services (directly exposed for cross-module use)
  adminService: IAdminService;
  permissionService: IPermissionService;
  roleService: IRoleService;
  tenantService: ITenantService;
  // Repositories
  adminRepository: IAdminRepository;
  roleRepository: IRoleRepository;
  permissionRepository: IPermissionRepository;
  tenantRepository: ITenantRepository;
  userGroupRepository: IUserGroupRepository;
  identityProviderRepository: IIdentityProviderRepository;
  oauthAppRepository: IOAuthAppRepository;
  usersRepository: IUsersRepository;
}

let _container: IdentityContainer | null = null;

/**
 * Get the identity container (lazy initialization)
 */
export function getIdentityContainer(): IdentityContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    // Create Services (wrap IApiService)
    const adminService = new AdminService(apiService);
    const permissionService = new PermissionService(apiService);
    const roleService = new RoleService(apiService);
    const tenantService = new TenantService(apiService);

    // Create Repositories (use Services)
    _container = {
      // Services
      adminService,
      permissionService,
      roleService,
      tenantService,
      // Repositories
      adminRepository: new AdminRepository(adminService),
      roleRepository: new RoleRepository(roleService),
      permissionRepository: new PermissionRepository(permissionService),
      tenantRepository: new TenantRepository(tenantService),
      userGroupRepository: new UserGroupRepository(new UserGroupService(apiService)),
      identityProviderRepository: new IdentityProviderRepository(
        new IdentityProviderService(apiService)
      ),
      oauthAppRepository: new OAuthAppRepository(new OAuthAppService(apiService)),
      usersRepository: new UsersRepository(new UsersService(apiService)),
    };
  }

  return _container;
}

/**
 * Identity container accessor (for use in components)
 *
 * MIGRATION NOTE: This was previously exported as `identityContainer`.
 * For backward compatibility during migration, both names are exported.
 */
export const identityContainer = {
  // Services
  get adminService() {
    return getIdentityContainer().adminService;
  },
  get permissionService() {
    return getIdentityContainer().permissionService;
  },
  get roleService() {
    return getIdentityContainer().roleService;
  },
  get tenantService() {
    return getIdentityContainer().tenantService;
  },
  // Repositories
  get adminRepository() {
    return getIdentityContainer().adminRepository;
  },
  get roleRepository() {
    return getIdentityContainer().roleRepository;
  },
  get permissionRepository() {
    return getIdentityContainer().permissionRepository;
  },
  get tenantRepository() {
    return getIdentityContainer().tenantRepository;
  },
  get userGroupRepository() {
    return getIdentityContainer().userGroupRepository;
  },
  get identityProviderRepository() {
    return getIdentityContainer().identityProviderRepository;
  },
  get oauthAppRepository() {
    return getIdentityContainer().oauthAppRepository;
  },
  get usersRepository() {
    return getIdentityContainer().usersRepository;
  },
};
