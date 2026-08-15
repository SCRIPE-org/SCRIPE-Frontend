/**
 * Sub-Tenants Tab Component
 *
 * Uses the TenantNodeCard accordion design for child tenants.
 * Compact mode: no View Details/Enter World actions.
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { Plus, Inbox } from "lucide-react";

import { TenantNodeCard } from "../TenantNodeCard";
import { TenantDeleteDialog } from "../TenantDeleteDialog";
import { EditTenantDialog } from "../TenantDialogs";
import { useSubTenantsViewModel } from "../../viewmodels/useSubTenantsViewModel";

interface SubTenantsTabProps {
  parentId: string;
  parentName: string;
  parentCode: string;
}

/**
 * Presentation UI component rendering the sub tenants tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubTenantsTab({ parentId, parentName, parentCode }: SubTenantsTabProps) {
  const { t, direction } = useI18n();
  const vm = useSubTenantsViewModel({ parentId, parentName, parentCode });

  if (vm.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-nx-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-nx-ink">{t("tenant.manageSubTenants")}</h3>
          <p className="text-sm text-nx-ink-2">{t("tenant.subTenantsDescription")}</p>
        </div>
        {vm.canCreate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => vm.handleOpenCreate()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("tenant.addChild")}
          </Button>
        )}
      </div>

      {/* Children cards */}
      {vm.childNodes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("tenant.noTenantsFound")}
          description={t("tenant.noTenantsDescription")}
        />
      ) : (
        <div className="space-y-0">
          {vm.childNodes.map((node) => (
            <TenantNodeCard
              key={node.id}
              node={node}
              level={0}
              onEdit={vm.handleOpenEdit}
              onDelete={vm.handleOpenDelete}
              onCreateChild={vm.handleOpenCreate}
              compact
            />
          ))}
        </div>
      )}

      <EditTenantDialog
        open={vm.editDialogOpen}
        onOpenChange={vm.setEditDialogOpen}
        tenantName={vm.editingNode?.name || ""}
        form={vm.editForm}
        setForm={vm.setEditForm}
        onSubmit={vm.handleEditSubmit}
        isLoading={vm.isSaving}
      />

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
