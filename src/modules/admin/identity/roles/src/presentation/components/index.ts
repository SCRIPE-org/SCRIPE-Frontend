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
export {
  PermissionModuleMatrix,
  type PermissionModuleMatrixProps,
} from "./PermissionModuleMatrix";
export { PermissionTreeSkeleton } from "./PermissionTreeSkeleton";
export { PermissionTreeCard } from "./PermissionTreeCard";
export { BulkScopeSelect } from "./BulkScopeSelect";

// RolesView now uses GenericCrudView, so specific components like RoleCard are removed.
