/**
 * TenantIdentityProvidersTab — Platform-Admin Tenant-Scoped Identity Providers Management
 *
 * Pure presentation component consuming `useTenantIdentityProvidersViewModel`.
 * Strictly adheres to SCRIPE Nexus flat-card design, `@core/ui/*` primitives,
 * and EN/AR locale ownership.
 *
 * @module tenants/presentation/components/tabs
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { KeyRound, Plus, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import { useTenantIdentityProvidersViewModel } from "../../viewmodels/useTenantIdentityProvidersViewModel";
import { TenantIdentityProviderDialog } from "../dialogs/TenantIdentityProviderDialog";
import { TenantIdentityProviderCard } from "./TenantIdentityProviderCard";

/** Props for {@link TenantIdentityProvidersTab}. */
export interface TenantIdentityProvidersTabProps {
  tenantId: string;
  tenantName: string;
}

/**
 * Platform-Admin tab displaying and managing a tenant's scoped identity providers
 * (`/api/v1/tenants/{tenantId}/identity-providers`).
 */
export function TenantIdentityProvidersTab({
  tenantId,
  tenantName,
}: TenantIdentityProvidersTabProps) {
  const { t, direction } = useI18n();
  const vm = useTenantIdentityProvidersViewModel(tenantId);

  if (vm.isLoading && !vm.searchQuery.trim()) {
    return (
      <div className="space-y-4" dir={direction}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-nx-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-nx-lg" />
        <Skeleton className="h-28 w-full rounded-nx-lg" />
      </div>
    );
  }

  if (vm.error) {
    return <ErrorMessage message={vm.error} onRetry={vm.refresh} />;
  }

  const activeCount = vm.providers.filter((p) => p.isActive).length;
  const trustedMfaCount = vm.providers.filter((p) => p.trustIdpMfa).length;

  return (
    <div className="space-y-6" dir={direction}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-nx-line bg-nx-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-2">
                {t("tenant.idpStatsTotal")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-nx-ink">
                {vm.totalCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-accent-wash text-nx-accent">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>

        <Card className="border-nx-line bg-nx-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-2">
                {t("tenant.idpStatsActive")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-success">
                {activeCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>

        <Card className="border-nx-line bg-nx-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-2">
                {t("tenant.idpStatsMfaTrusted")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-info">
                {trustedMfaCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-info/10 text-info">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder={t("tenant.idpSearchPlaceholder")}
            className="h-9 ps-9 text-xs"
          />
        </div>

        <Button type="button" size="sm" onClick={vm.openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("tenant.idpAddButton")}
        </Button>
      </div>

      {vm.providers.length === 0 ? (
        vm.searchQuery.trim().length > 0 ? (
          <EmptyState
            variant="filtered"
            icon={KeyRound}
            size="sm"
            title={t("tenant.idpNoMatchingTitle")}
            description={t("tenant.idpNoMatchingDesc")}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => vm.setSearchQuery("")}
              >
                {t("tenant.idpClearSearch")}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={KeyRound}
            size="sm"
            title={t("tenant.idpEmptyTitle")}
            description={t("tenant.idpEmptyDesc", { tenant: tenantName })}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={vm.openCreateDialog}
                className="gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("tenant.idpAddButton")}
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          {vm.providers.map((provider) => (
            <TenantIdentityProviderCard
              key={provider.id}
              provider={provider}
              testResult={vm.testResults[provider.id]}
              isToggling={vm.togglingId === provider.id}
              isTesting={vm.testingId === provider.id}
              isLoadingDetail={vm.isLoadingDetail}
              onToggleActive={(item, checked) => void vm.toggleActive(item, checked)}
              onTestConnection={(id) => void vm.testConnection(id)}
              onEdit={(id) => void vm.openEditDialog(id)}
              onDelete={vm.setDeleteTarget}
            />
          ))}
        </div>
      )}

      <TenantIdentityProviderDialog
        open={vm.dialogOpen}
        onOpenChange={(open) => {
          if (!open) vm.closeDialog();
        }}
        editingProvider={vm.editingProvider}
        onSave={vm.saveProvider}
        isSaving={vm.isSaving}
      />

      <ConfirmationDialog
        open={Boolean(vm.deleteTarget)}
        onOpenChange={(open) => {
          if (!open) vm.setDeleteTarget(null);
        }}
        variant="destructive"
        title={t("tenant.idpDeleteTitle")}
        description={
          vm.deleteTarget
            ? t("tenant.idpDeleteConfirm", { name: vm.deleteTarget.name })
            : t("tenant.idpDeleteTitle")
        }
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={() => void vm.confirmDelete()}
        isLoading={vm.isDeleting}
      />
    </div>
  );
}
