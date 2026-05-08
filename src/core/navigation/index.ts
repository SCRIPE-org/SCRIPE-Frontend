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
export type { WorkspaceGroupData } from "./domain/entities/WorkspaceGroup";

export { NavigationData } from "./domain/entities/NavigationData";
export type { NavigationDataInput } from "./domain/entities/NavigationData";

// ── Domain interface ─────────────────────────────────────────────────────────
export type { INavigationRepository } from "./domain/interfaces/INavigationRepository";

// ── Data layer (DI wiring + provider) ───────────────────────────────────────
export { NavigationRepository } from "./data/repositories/NavigationRepository";
export { NavigationDataMapper } from "./data/mappers/NavigationDataMapper";
export { MenuItemMapper } from "./data/mappers/MenuItemMapper";
export { WorkspaceGroupMapper } from "./data/mappers/WorkspaceGroupMapper";
