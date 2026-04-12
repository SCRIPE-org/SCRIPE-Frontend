/**
 * TenantsView — Expandable Accordion Design
 *
 * Premium tenant management page with:
 * - Stats pills header with search
 * - Expandable accordion cards with color-coded status borders
 * - Recursive nested children hierarchy
 * - On-demand stats fetching when expanded
 * - Full RTL/LTR support
 * - Create/Edit/Delete dialogs with edition selection
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Inbox, CheckCircle2, Copy, ExternalLink, Mail, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";

// Module imports
import { TenantNodeCard } from "../components/TenantNodeCard";
import { TenantListHeader } from "../components/TenantListHeader";
import { TenantDeleteDialog } from "../components/TenantDeleteDialog";
import { CreateTenantDialog, EditTenantDialog } from "../components/TenantDialogs";
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
            <Skeleton className="h-4 w-72 mt-2" />
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
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {vm.search
              ? t("tenant.noTenantsFound")
              : t("tenant.noTenantsFound")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {vm.search
              ? t("tenant.searchPlaceholder")
              : t("tenant.noTenantsDescription")}
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

      {/* Create Dialog */}
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

      {/* Creation Success Result Dialog */}
      <Dialog open={vm.resultDialogOpen} onOpenChange={vm.closeResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto mb-3 rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <DialogTitle>{t("tenant.created")}</DialogTitle>
            <DialogDescription>
              {t("tenant.setupEmailSent") || "An account setup email has been sent to the admin."}
            </DialogDescription>
          </DialogHeader>
          {vm.createResult && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{t("tenant.adminEmail") || "Email"}:</span>
                  <span className="font-medium text-foreground">{vm.createResult.adminEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{t("tenant.adminUsername") || "Username"}:</span>
                  <span className="font-medium text-foreground">{vm.createResult.adminUsername}</span>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("tenant.setupUrlLabel") || "Account Setup Link (valid 24 hours):"}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs truncate bg-muted/50 rounded px-2 py-1.5 border border-border/50">
                    {vm.createResult.accountSetupUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(vm.createResult!.accountSetupUrl);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    asChild
                  >
                    <a href={vm.createResult.accountSetupUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={vm.closeResultDialog}>
                {t("common.done") || "Done"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
