/**
 * Navigation Module — Public API
 *
 * Everything consumers need is re-exported from here.
 * Import path: @core/navigation
 *
 * Domain layer:
 *   - Entities: MenuItem, WorkspaceGroup, NavigationData (+ data shapes)
 *   - Interfaces: INavigationRepository
 *
 * Data layer (for DI wiring only):
 *   - NavigationRepository (concrete implementation)
 *   - NavigationDataMapper (for provider cache read/write)
 */

// ── Domain entities ──────────────────────────────────────────────────────────
export { MenuItem } from "./domain/entities/MenuItem";
export type { MenuItemData, MenuItemActions } from "./domain/entities/MenuItem";

export { WorkspaceGroup } from "./domain/entities/WorkspaceGroup";
export type {
  WorkspaceEffectiveHomeSource,
  WorkspaceGroupData,
} from "./domain/entities/WorkspaceGroup";

export { NavigationData } from "./domain/entities/NavigationData";
export type { NavigationDataInput } from "./domain/entities/NavigationData";
export {
  LandingTargetCatalog,
  LandingTargetCatalogItem,
  LandingTargetWorkspace,
} from "./domain/entities/LandingTargetCatalog";
export type {
  LandingTargetCatalogData,
  LandingTargetCatalogItemData,
  LandingTargetContextScope,
  LandingTargetScopeMode,
  LandingTargetWorkspaceData,
} from "./domain/entities/LandingTargetCatalog";
export { AdminWorkspaceEntryPreference } from "./domain/entities/WorkspaceEntryPreference";
export type { AdminWorkspaceEntryPreferenceData } from "./domain/entities/WorkspaceEntryPreference";
export {
  buildStructuredLandingTargetOptions,
  buildWorkspaceScopedMenuOptions,
  canEnforceLandingTarget,
  formatLandingTargetLabel,
} from "./domain/utils/landing-target-options";
export type {
  BuildLandingTargetOptionsInput,
  LandingTargetOptionLabels,
  StructuredLandingOption,
} from "./domain/utils/landing-target-options";

// ── Domain interface ─────────────────────────────────────────────────────────
export type {
  AuthorizedRouteDescriptor,
  AuthorizedRoutesResult,
  BootstrapNavigationResult,
  INavigationRepository,
  LandingResolution,
  RouteAccessState,
} from "./domain/interfaces/INavigationRepository";

// ── Data layer (DI wiring + provider) ───────────────────────────────────────
export { NavigationRepository } from "./data/repositories/NavigationRepository";
export { NavigationService } from "./data/services/NavigationService";
export type { INavigationService } from "./data/services/NavigationService";
export { NavigationDataMapper } from "./data/mappers/NavigationDataMapper";
export { MenuItemMapper } from "./data/mappers/MenuItemMapper";
export { WorkspaceGroupMapper } from "./data/mappers/WorkspaceGroupMapper";
export { LandingTargetCatalogMapper } from "./data/mappers/LandingTargetCatalogMapper";
export { WorkspaceEntryPreferenceMapper } from "./data/mappers/WorkspaceEntryPreferenceMapper";

// ── Presentation hooks & components ─────────────────────────────────────────
export { useLandingTargetCatalog } from "./presentation/hooks/useLandingTargetCatalog";
export type { UseLandingTargetCatalogArgs } from "./presentation/hooks/useLandingTargetCatalog";
export { LandingTargetPicker } from "./presentation/components/LandingTargetPicker";
export type { LandingTargetPickerProps } from "./presentation/components/LandingTargetPicker";

// ── Pure search indexing ────────────────────────────────────────────────────
export {
  buildSearchIndex,
  filterQuickJumpItems,
  type BuildSearchIndexInput,
  type SearchableItem,
} from "./search";
