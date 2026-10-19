"use client";

import React from "react";
import { useTenantOverviewViewModel } from "../viewmodels/useTenantOverviewViewModel";
import { MinimalWelcome } from "../components/MinimalWelcome";
import {
  TenantCommandHeader,
  TenantDashboardGrid,
} from "../components/tenant-command-center";

/**
 * TenantOverviewView
 *
 * Dedicated Tenant Organization Control Center & Customizable Workspace.
 * Upgraded to a professional, responsive grid-based dashboard customization experience.
 *
 * Adheres strictly to:
 * - Clean Architecture (View -> ViewModel -> Repository -> Service -> IApiService)
 * - Mandatory `@core/ui/*` design system components
 * - RBAC / PBAC authorization boundaries and Tenant Isolation
 */
export function TenantOverviewView() {
  const vm = useTenantOverviewViewModel();

  if (!vm.hasDashboardPermission) {
    return <MinimalWelcome />;
  }

  const { data } = vm;

  return (
    <div className="mx-auto max-w-[1560px] space-y-4 pb-8">
      {/* 1. Command Header Bar with Customization Toolbar */}
      <TenantCommandHeader
        tenantName={data.tenantName}
        isImpersonating={vm.isImpersonating}
        onRefresh={vm.refetchAll}
        isRefreshing={vm.isRefreshing}
        canCustomize={vm.canCustomize}
        isEditing={vm.isEditing}
        hasUnsavedChanges={vm.hasUnsavedChanges}
        isSaving={vm.isSavingLayout}
        onEnterEditMode={vm.enterEditMode}
        onCancelEditMode={vm.cancelEditMode}
        onSaveLayout={vm.saveLayout}
        onRestoreDefault={vm.restoreDefaultLayout}
        onOpenLibrary={() => vm.setIsLibraryOpen(true)}
      />

      {/* 2. Responsive Configurable 12-Column Dashboard Grid */}
      <TenantDashboardGrid
        layout={vm.activeLayout}
        data={data}
        loginActivity={vm.overviewVm.loginActivity.data}
        isPresentationMode={vm.isPresentationMode}
        isEditing={vm.isEditing}
        onLayoutChange={vm.updateDraftLayout}
        isLibraryOpen={vm.isLibraryOpen}
        setIsLibraryOpen={vm.setIsLibraryOpen}
      />
    </div>
  );
}
