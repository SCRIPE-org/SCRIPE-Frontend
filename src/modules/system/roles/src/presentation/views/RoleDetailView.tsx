/**
 * Role Detail View
 *
 * Displays role details with permissions tree for assignment.
 * SOLID: Pure UI - all logic in useRoleDetailViewModel.
 */
"use client";

import { useRoleDetailViewModel } from "../viewmodels/useRoleDetailViewModel";
import {
      RoleInfoCard,
      RoleDetailHeader,
      PermissionTreeCard,
} from "../components";

export default function RoleDetailView() {
      const vm = useRoleDetailViewModel();

      return (
            <div className="container mx-auto py-6 space-y-6">
                  {/* Header with breadcrumbs and save button */}
                  <RoleDetailHeader {...vm.header} />

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Role Info Sidebar */}
                        <RoleInfoCard {...vm.info} />

                        {/* Permissions Tree */}
                        <PermissionTreeCard {...vm.permissions} />
                  </div>
            </div>
      );
}

