export { CRM_PERMISSIONS, type CrmPermission } from "./src/constants/permission-constants";
export {
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
  DEFAULT_RECORD_PRINCIPALS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  parseCustomGovernanceConfigJson,
  type ParsedGovernanceConfig,
} from "./src/constants/crmGovernanceDefaults";
export {
  CRM_STAGE_COLOR_TOKENS,
  resolveDefaultStageColor,
} from "./src/constants/crmStageColorResolver";
export {
  CRM_FALLBACK_USD_RATES,
  CRM_CURRENCY_OPTIONS,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
} from "./src/constants/crmCurrencyConstants";
export {
  LOSS_REASONS,
  DISQUALIFICATION_REASONS,
  STAKEHOLDER_ROLES,
} from "./src/constants/crmReasonAndRoleCatalog";
export {
  CANONICAL_TERMINAL_LABELS,
  DEFAULT_NEW_WORKFLOW_META,
  DEFAULT_CUSTOM_STAGE_HEX_FALLBACK,
} from "./src/constants/crmCanonicalTerminalLabels";
export {
  STAGE_COLOR_PALETTE,
  type CrmStageColorPaletteEntry,
} from "./src/constants/crmWorkflowColorPalette";
export {
  buildCustomHexHarmonicStyles,
  type CrmCustomHexHarmonicStyles,
} from "./src/utils/crmStageColorUtils";
export {
  useSafeQueryClient,
  useCrmTenantScope,
} from "./src/presentation/utils/useSafeQueryClient";
export {
  useCrmClientPrefsStore,
  getCrmClientScopeKey,
  DEFAULT_CRM_CLIENT_PREFS,
  type CrmClientPrefsState,
} from "./src/presentation/stores/useCrmClientPrefsStore";
export {
  CRM_TAB_ROUTES,
  useCrmShellViewModel,
} from "./src/presentation/viewmodels/useCrmShellViewModel";
export {
  useCrmEntitySearchViewModel,
  type UseCrmEntitySearchViewModelOptions,
} from "./src/presentation/viewmodels/useCrmEntitySearchViewModel";
export { useCrmCurrency } from "./src/presentation/viewmodels/useCrmCurrency";
export {
  CrmShell,
  type CrmShellProps,
} from "./src/presentation/components/CrmShell";
export {
  CrmShellTopToolbar,
  type CrmShellTopToolbarProps,
} from "./src/presentation/components/CrmShellTopToolbar";
export {
  CrmSectionHeader,
  type CrmSectionHeaderProps,
} from "./src/presentation/components/CrmSectionHeader";
export {
  CrmStatusBadge,
  type CrmStatusBadgeProps,
} from "./src/presentation/components/CrmStatusBadge";
export {
  CrmSmartGuideModal,
  type CrmSmartGuideModalProps,
} from "./src/presentation/components/CrmSmartGuideModal";
export {
  CrmSmartTipRibbon,
  type CrmSmartTipRibbonProps,
} from "./src/presentation/components/CrmSmartTipRibbon";
export {
  CrmEntitySearchSelect,
  type CrmEntitySearchSelectProps,
} from "./src/presentation/components/CrmEntitySearchSelect";
export {
  CrmEntityQuickCreateDialog,
  type CrmEntityQuickCreateDialogProps,
  type CrmEntityQuickCreateInitialValues,
} from "./src/presentation/components/CrmEntityQuickCreateDialog";
export {
  PipelineSelector,
  type PipelineSelectorOption,
  type PipelineSelectorProps,
} from "./src/presentation/components/PipelineSelector";
export type {
  CrmWorkflowEntityType,
  CrmWorkflowStageCategory,
  CrmStageColorToken,
  CanonicalActiveStageKey,
  CrmStageKey,
  CrmTabId,
  CrmEntitySearchKind,
  CrmEntitySearchRequest,
  CrmEntitySearchItem,
  CrmQuickCreateEntityInput,
  ICrmEntityLookupProvider,
  CrmStageGateStrictness,
  CrmEntityTypeKey,
  CrmCustomFieldValueType,
  CrmCustomFieldDefinition,
  CrmConfigurableOptionItem,
  CrmPersistedBoardSettings,
  CrmScopedRoleDefinition,
  CrmBuyingCommitteeRoleOption,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
  CrmSettingsResponseData,
  CrmGovernanceCatalogData,
  CrmAssigneeLookupItem,
  ICrmSettingsRepository,
} from "./src/types/crmSharedTypes";
