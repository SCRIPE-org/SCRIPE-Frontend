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
import { Plus, Inbox } from "lucide-react";

import { TenantNodeCard } from "../TenantNodeCard";
import { TenantDeleteDialog } from "../TenantDeleteDialog";
import { CreateTenantDialog, EditTenantDialog } from "../TenantDialogs";
import { useSubTenantsViewModel } from "../../viewmodels/useSubTenantsViewModel";

interface SubTenantsTabProps {
  parentId: string;
  parentName: string;
  parentCode: string;
}

export function SubTenantsTab({
  parentId,
  parentName,
  parentCode,
}: SubTenantsTabProps) {
  const { t, direction } = useI18n();
  const vm = useSubTenantsViewModel({ parentId, parentName, parentCode });

  if (vm.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("tenant.manageSubTenants")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("tenant.subTenantsDescription")}
          </p>
        </div>
        {vm.canCreate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => vm.handleOpenCreate()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("tenant.addChild")}
          </Button>
        )}
      </div>

      {/* Children cards */}
      {vm.childNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/50">
          <div className="rounded-full bg-muted/50 p-3 mb-3">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {t("tenant.noTenantsFound")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("tenant.noTenantsDescription")}
          </p>
        </div>
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

      {/* Dialogs */}
      <CreateTenantDialog
        open={vm.createDialogOpen}
        onOpenChange={vm.setCreateDialogOpen}
        parentTenant={vm.parentForCreate}
        form={vm.createForm}
        setForm={vm.setCreateForm}
        onSubmit={vm.handleCreateSubmit}
        isLoading={vm.isCreating}
        onSearchEditions={vm.handleSearchEditions}
        cachedEditions={vm.cachedEditions}
        availablePromotions={vm.availablePromotions}
        isLoadingPromotions={vm.isLoadingPromotions}
        onEditionChange={vm.setPromoEditionId}
        onSubscriptionTypeChange={vm.setPromoSubType}
      />

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
