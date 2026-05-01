/**
 * TenantsView — Expandable Accordion Design
 *
 * Premium tenant management page with:
 * - Stats pills header with search
 * - Expandable accordion cards with color-coded status borders
 * - Recursive nested children hierarchy
 * - On-demand stats fetching when expanded
 * - Full RTL/LTR support
 * - Create navigates to dedicated stepper page
 * - Edit/Delete dialogs remain inline
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Inbox } from "lucide-react";

// Module imports
import { TenantNodeCard } from "../components/TenantNodeCard";
import { TenantListHeader } from "../components/TenantListHeader";
import { TenantDeleteDialog } from "../components/TenantDeleteDialog";
import { EditTenantDialog } from "../components/TenantDialogs";
import { useTenantsViewModel } from "../viewmodels/useTenantsViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// ============================================
// Component
// ============================================

export function TenantsView() {
  useModuleLocales(() => import("../../../locales"), "tenants");

  const { t, direction } = useI18n();
  const vm = useTenantsViewModel();

  // ── Loading ──
  if (vm.isLoading) {
    return (
      <div className="space-y-4" dir={direction}>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Header with stats + search */}
      <TenantListHeader
        tree={vm.tree}
        search={vm.search}
        onSearchChange={vm.setSearch}
        onAdd={() => vm.handleOpenCreate()}
        canCreate={vm.canCreate}
      />

      {/* Tenant cards */}
      {vm.filteredTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted/50 p-4">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {vm.search ? t("tenant.noTenantsFound") : t("tenant.noTenantsFound")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {vm.search ? t("tenant.searchPlaceholder") : t("tenant.noTenantsDescription")}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {vm.filteredTree.map((node) => (
            <TenantNodeCard
              key={node.id}
              node={node}
              level={0}
              onEdit={vm.handleOpenEdit}
              onDelete={vm.handleOpenDelete}
              onCreateChild={vm.handleOpenCreate}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <EditTenantDialog
        open={vm.editDialogOpen}
        onOpenChange={vm.setEditDialogOpen}
        tenantName={vm.editingNode?.name || ""}
        form={vm.editForm}
        setForm={vm.setEditForm}
        onSubmit={vm.handleEditSubmit}
        isLoading={vm.isSaving}
      />

      {/* Delete Dialog */}
      <TenantDeleteDialog
        open={vm.deleteDialogOpen}
        onOpenChange={vm.setDeleteDialogOpen}
        tenant={vm.tenantToDelete}
        onConfirm={vm.handleDeleteConfirm}
        isDeleting={vm.isDeleting}
      />
    </div>
  );
}
