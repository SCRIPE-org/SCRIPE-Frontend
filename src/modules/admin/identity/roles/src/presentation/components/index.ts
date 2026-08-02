/**
 * Role Components Index
 *
 * Barrel export for role-related components.
 */
// RoleDetailView components
export { RoleInfoCard, type RoleInfoCardProps } from "./RoleInfoCard";
export { RoleDetailHeader, type RoleDetailHeaderProps } from "./RoleDetailHeader";
/**
 * Exported member in the identity/roles module.
 */
export { PermissionModuleMatrix, type PermissionModuleMatrixProps } from "./PermissionModuleMatrix";
export { PermissionTreeSkeleton } from "./PermissionTreeSkeleton";
export { PermissionTreeCard } from "./PermissionTreeCard";
export { PermissionConfigDialog } from "./PermissionConfigDialog";
export type { PermissionConfigDialogProps } from "./PermissionConfigDialog";
/**
 * The bulk scope ACTION. It replaced BulkScopeSelect, which rendered the same
 * choice as a bordered combobox parked next to the search field — two identical
 * looking fields, neither of which said what it applied to. Scope has exactly
 * one *field* now (PermissionConfigDialog, per permission) and one *action*
 * (this, across every assigned permission).
 */
export { BulkScopeMenu, type BulkScopeMenuProps } from "./BulkScopeMenu";
export { scopeLabel, EXPLICIT_SCOPES } from "./scope-label";

// RolesView now uses GenericCrudView, so specific components like RoleCard are removed.
