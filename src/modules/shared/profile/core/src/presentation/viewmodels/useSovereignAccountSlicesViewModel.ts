/**
 * useSovereignAccountSlicesViewModel
 *
 * Barrel re-exporting all Sovereign Account Console query keys and ViewModel hooks
 * while delegating implementations to focused slice modules.
 */
/** Re-exported TanStack Query key factory for Sovereign Account Console slices. */
export { sovereignAccountKeys } from "../utils/sovereignAccountKeys";
export {
  useSovereignDossierSlice,
  useSovereignAccountContextSlice,
  useAccountContextSliceViewModel,
  useAccountDossierSliceViewModel,
} from "./useSovereignContextAndDossierViewModel";
export {
  useSudoViewModel,
  useSovereignSecuritySlice,
  useAccountSecuritySliceViewModel,
  useSovereignSessionsSlice,
} from "./useSovereignSudoAndSecurityViewModel";
export {
  useSovereignGovernanceSlice,
  useAccountGovernanceSliceViewModel,
  useSovereignActivitySlice,
  useAccountActivitySliceViewModel,
  useColleaguesSearchViewModel,
} from "./useSovereignGovAndActivityViewModel";
export {
  useSovereignPreferencesSlice,
  useAccountPreferencesSliceViewModel,
  useSovereignNotificationsSlice,
  useAccountNotificationsSliceViewModel,
  useSovereignPlanSlice,
  useAccountPlanSliceViewModel,
  useSovereignIntegrationsSlice,
  useAccountIntegrationsSliceViewModel,
} from "./useSovereignWorkstationSlicesViewModel";
