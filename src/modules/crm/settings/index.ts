export { CrmSettingsEntity } from "./src/domain/entities/CrmSettingsEntity";
export type { ICrmSettingsService } from "./src/domain/interfaces/ICrmSettingsService";
export type { ICrmSettingsRepository } from "./src/domain/interfaces/ICrmSettingsRepository";
export {
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_RECORD_PRINCIPALS,
  DEFAULT_CRM_SETTINGS_DRAFT,
  DEFAULT_SETTINGS_ENTITY_DATA,
  type CrmSettingsDraftState,
} from "./src/domain/constants/crmSettingsDefaults";
export { CrmSettingsService } from "./src/data/services/CrmSettingsService";
export { CrmSettingsRepository } from "./src/data/repositories/CrmSettingsRepository";
export {
  CrmSettingsMapper,
} from "./src/data/mappers/CrmSettingsMapper";
export {
  mapSettingsResponseToDraftState,
  parseCustomGovernanceConfigJson,
  serializeCustomGovernanceConfigJson,
  type ParsedGovernanceConfig,
} from "./src/domain/utils/crmGovernanceConfigCodec";
export { CRM_SETTINGS_ENDPOINTS } from "./src/data/services/crm-settings.endpoints";
export {
  useCrmSettingsViewModel,
  type CrmSettingsTabKey,
  type CrmSettingsCardModel,
  type CrmCustomFieldWorkflowSummary,
} from "./src/presentation/viewmodels/useCrmSettingsViewModel";
export { CrmSettingsView } from "./src/presentation/views/CrmSettingsView";
export { CrmSettingsSkeleton } from "./src/presentation/components/CrmSettingsSkeleton";
export {
  CrmSettingsSidebarNav,
  type CrmSettingsSidebarNavProps,
} from "./src/presentation/components/settings/CrmSettingsSidebarNav";
export {
  CrmCurrencySettingsCard,
  type CrmCurrencySettingsCardProps,
} from "./src/presentation/components/settings/CrmCurrencySettingsCard";
export {
  CrmGovernanceSettingsCard,
  type CrmGovernanceSettingsCardProps,
} from "./src/presentation/components/settings/CrmGovernanceSettingsCard";
export {
  CrmCustomFieldsStudioCard,
  type CrmCustomFieldsStudioCardProps,
} from "./src/presentation/components/settings/CrmCustomFieldsStudioCard";
export {
  CrmRolesAndPrincipalsSettingsCard,
  type CrmRolesAndPrincipalsSettingsCardProps,
} from "./src/presentation/components/settings/CrmRolesAndPrincipalsSettingsCard";
export {
  CrmIntegrationsToggleGrid,
  type CrmIntegrationsToggleGridProps,
} from "./src/presentation/components/settings/CrmIntegrationsToggleGrid";
