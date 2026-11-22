/**
 * Navigation Domain Entities — Public Barrel
 */

export { MenuItem } from "./MenuItem";
export type { MenuItemData, MenuItemActions } from "./MenuItem";

export { WorkspaceGroup } from "./WorkspaceGroup";
export type { WorkspaceGroupData } from "./WorkspaceGroup";

export { NavigationData } from "./NavigationData";
export type { NavigationDataInput } from "./NavigationData";

export {
  LandingTargetCatalog,
  LandingTargetCatalogItem,
  LandingTargetWorkspace,
} from "./LandingTargetCatalog";
export type {
  LandingTargetCatalogData,
  LandingTargetCatalogItemData,
  LandingTargetContextScope,
  LandingTargetScopeMode,
  LandingTargetWorkspaceData,
} from "./LandingTargetCatalog";

export { AdminWorkspaceEntryPreference } from "./WorkspaceEntryPreference";
export type { AdminWorkspaceEntryPreferenceData } from "./WorkspaceEntryPreference";
