/**
 * Role Detail View
 *
 * Displays role details with permissions tree for assignment.
 * SOLID: Pure UI - all logic in useRoleDetailViewModel.
 */
"use client";

import { useRoleDetailViewModel } from "../viewmodels/useRoleDetailViewModel";
import { RoleInfoCard, RoleDetailHeader, PermissionTreeCard } from "../components";

/**
 * Interface defining property specifications, keys types, and structural contract rules for role detail view props.
 */
export interface RoleDetailViewProps {
  /**
   * Role identifier supplied by the route. Optional because the `roles/[id]`
   * page mounts this view with no props today; when it is omitted the
   * viewmodel falls back to reading the dynamic segment itself. Passing it
   * explicitly is what lets the view be mounted outside that segment.
   */
  roleId?: string;
}

/**
 * Presentation UI component rendering the role detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export default function RoleDetailView({ roleId }: RoleDetailViewProps) {
  const vm = useRoleDetailViewModel(roleId);

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and save button */}
      <RoleDetailHeader {...vm.header} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Role Info Sidebar */}
        <RoleInfoCard {...vm.info} />

        {/* Permissions Tree */}
        <PermissionTreeCard {...vm.permissions} />
      </div>
    </div>
  );
}
