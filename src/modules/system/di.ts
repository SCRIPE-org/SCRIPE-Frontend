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
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { AdminService } from "./admin/src/data/services/AdminService";
import { PermissionService } from "./permissions/src/data/services/PermissionService";
import { RoleService } from "./roles/src/data/services/RoleService";
import { TenantService } from "./tenants/src/data/services/TenantService";
import { TenantSettingsService } from "./tenant-settings/src/data/services/TenantSettingsService";
import { CustomizationService } from "./customization/src/data/services/CustomizationService";
import { CustomizationRepository } from "./customization/src/data/repositories/CustomizationRepository";
import { DashboardService } from "./dashboard/src/data/services/DashboardService";
import { RecycleBinService } from "./recycle-bin/src/data/services/RecycleBinService";
import { MessageTemplateService } from "./messaging/message-templates/src/data/services/MessageTemplateService";
import { EmailService } from "./messaging/email-composer/src/data/services/EmailService";
import { NotificationSenderService } from "./messaging/notification-sender/src/data/services/NotificationSenderService";
import { WebhookService } from "./webhooks/src/data/services/WebhookService";
import { UserGroupService } from "./user-groups/src/data/services/UserGroupService";
import { IdentityProviderService } from "./identity-providers/src/data/services/IdentityProviderService";
import { OAuthAppService } from "./oauth-apps/src/data/services/OAuthAppService";

// Repositories
import { AdminRepository } from "./admin/src/data/repositories/AdminRepository";
import { RoleRepository } from "./roles/src/data/repositories/RoleRepository";
import { PermissionRepository } from "./permissions/src/data/repositories/PermissionRepository";
import { TenantRepository } from "./tenants/src/data/repositories/TenantRepository";
import { MenuRepository } from "./menus/src/data/repositories/MenuRepository";
import { TenantSettingsRepository } from "./tenant-settings/src/data/repositories/TenantSettingsRepository";
import { DashboardRepository } from "./dashboard/src/data/repositories/DashboardRepository";
import { RecycleBinRepository } from "./recycle-bin/src/data/repositories/RecycleBinRepository";
import { MessageTemplateRepository } from "./messaging/message-templates/src/data/repositories/MessageTemplateRepository";
import { EmailRepository } from "./messaging/email-composer/src/data/repositories/EmailRepository";
import { NotificationSenderRepository } from "./messaging/notification-sender/src/data/repositories/NotificationSenderRepository";
import { WebhookRepository } from "./webhooks/src/data/repositories/WebhookRepository";
import { UserGroupRepository } from "./user-groups/src/data/repositories/UserGroupRepository";
import { IdentityProviderRepository } from "./identity-providers/src/data/repositories/IdentityProviderRepository";
import { OAuthAppRepository } from "./oauth-apps/src/data/repositories/OAuthAppRepository";

// Interfaces - Repositories
import type { IAdminRepository } from "./admin/src/domain/interfaces/IAdminRepository";
import type { IRoleRepository } from "./roles/src/domain/interfaces/IRoleRepository";
import type { IPermissionRepository } from "./permissions/src/domain/interfaces/IPermissionRepository";
import type { ITenantRepository } from "./tenants/src/domain/interfaces/ITenantRepository";
import type { IMenuRepository } from "./menus/src/domain/interfaces/IMenuRepository";
import type { ITenantSettingsRepository } from "./tenant-settings/src/domain/interfaces/ITenantSettingsRepository";
import type { IDashboardRepository } from "./dashboard/src/domain/interfaces/IDashboardRepository";
import type { IRecycleBinRepository } from "./recycle-bin/src/domain/interfaces/IRecycleBinRepository";
import type { IRecycleBinService } from "./recycle-bin/src/domain/interfaces/IRecycleBinService";
import type { IMessageTemplateRepository } from "./messaging/message-templates/src/domain/interfaces/IMessageTemplateRepository";
import type { IEmailRepository } from "./messaging/email-composer/src/domain/interfaces/IEmailRepository";
import type { INotificationSenderRepository } from "./messaging/notification-sender/src/domain/interfaces/INotificationSenderRepository";
import type { IWebhookRepository } from "./webhooks/src/domain/interfaces/IWebhookRepository";
import type { IUserGroupRepository } from "./user-groups/src/domain/interfaces/IUserGroupRepository";
import type { IIdentityProviderRepository } from "./identity-providers/src/domain/interfaces/IIdentityProviderRepository";
import type { IOAuthAppRepository } from "./oauth-apps/src/domain/interfaces/IOAuthAppRepository";
import type { ICustomizationRepository } from "./customization/src/domain/interfaces/ICustomizationRepository";
import type { ICustomizationService } from "./customization/src/domain/interfaces/ICustomizationService";

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
  customizationService: ICustomizationService;
  // Repositories
  adminRepository: IAdminRepository;
  roleRepository: IRoleRepository;
  permissionRepository: IPermissionRepository;
  tenantRepository: ITenantRepository;
  menuRepository: IMenuRepository;
  tenantSettingsRepository: ITenantSettingsRepository;
  customizationRepository: ICustomizationRepository;
  dashboardRepository: IDashboardRepository;
  recycleBinService: IRecycleBinService;
  recycleBinRepository: IRecycleBinRepository;
  // Messaging
  messageTemplateRepository: IMessageTemplateRepository;
  emailRepository: IEmailRepository;
  notificationSenderRepository: INotificationSenderRepository;
  // Webhooks
  webhookRepository: IWebhookRepository;
  // User Groups
  userGroupRepository: IUserGroupRepository;
  // Unified Identity System
  identityProviderRepository: IIdentityProviderRepository;
  oauthAppRepository: IOAuthAppRepository;
}

let _container: SystemContainer | null = null;

/**
 * Get the system container (lazy initialization)
 */
export function getSystemContainer(): SystemContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    // Create Services (wrap IApiService)
    const adminService = new AdminService(apiService);
    const permissionService = new PermissionService(apiService);
    const roleService = new RoleService(apiService);
    const tenantService = new TenantService(apiService);
    const tenantSettingsService = new TenantSettingsService(apiService);
    const customizationService = new CustomizationService(apiService);
    const recycleBinService = new RecycleBinService(apiService);
    const messageTemplateService = new MessageTemplateService(apiService);
    const emailService = new EmailService(apiService);
    const notificationSenderService = new NotificationSenderService(apiService);
    const webhookService = new WebhookService(apiService);
    const userGroupService = new UserGroupService(apiService);
    const identityProviderService = new IdentityProviderService(apiService);
    const oauthAppService = new OAuthAppService(apiService);

    // Create Repositories (use Services)
    _container = {
      // Services
      adminService,
      permissionService,
      roleService,
      tenantService,
      tenantSettingsService,
      customizationService,
      // Repositories
      adminRepository: new AdminRepository(adminService),
      roleRepository: new RoleRepository(roleService),
      permissionRepository: new PermissionRepository(permissionService),
      tenantRepository: new TenantRepository(tenantService),
      menuRepository: new MenuRepository(apiService), // TODO: Add MenuService
      tenantSettingsRepository: new TenantSettingsRepository(tenantSettingsService),
      customizationRepository: new CustomizationRepository(customizationService),
      dashboardRepository: new DashboardRepository(new DashboardService(apiService)),
      recycleBinService,
      recycleBinRepository: new RecycleBinRepository(recycleBinService),
      // Messaging
      messageTemplateRepository: new MessageTemplateRepository(messageTemplateService),
      emailRepository: new EmailRepository(emailService),
      notificationSenderRepository: new NotificationSenderRepository(notificationSenderService),
      // Webhooks
      webhookRepository: new WebhookRepository(webhookService),
      // User Groups
      userGroupRepository: new UserGroupRepository(userGroupService),
      // Unified Identity System
      identityProviderRepository: new IdentityProviderRepository(identityProviderService),
      oauthAppRepository: new OAuthAppRepository(oauthAppService),
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
  get customizationService() {
    return getSystemContainer().customizationService;
  },
  get customizationRepository() {
    return getSystemContainer().customizationRepository;
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
  get recycleBinService() {
    return getSystemContainer().recycleBinService;
  },
  get recycleBinRepository() {
    return getSystemContainer().recycleBinRepository;
  },
  // Messaging
  get messageTemplateRepository() {
    return getSystemContainer().messageTemplateRepository;
  },
  get emailRepository() {
    return getSystemContainer().emailRepository;
  },
  get notificationSenderRepository() {
    return getSystemContainer().notificationSenderRepository;
  },
  // Webhooks
  get webhookRepository() {
    return getSystemContainer().webhookRepository;
  },
  // User Groups
  get userGroupRepository() {
    return getSystemContainer().userGroupRepository;
  },
  // Unified Identity System
  get identityProviderRepository() {
    return getSystemContainer().identityProviderRepository;
  },
  get oauthAppRepository() {
    return getSystemContainer().oauthAppRepository;
  },
};
