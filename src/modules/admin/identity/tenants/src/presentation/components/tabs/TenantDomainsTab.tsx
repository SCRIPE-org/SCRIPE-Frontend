/**
 * Tenant Domains Tab — Vercel-Grade Custom Domain Management
 *
 * Implements a high-fidelity, enterprise-grade domain management experience
 * modeled after Vercel's production custom domains system.
 *
 * Features:
 *  - Global domain search ("Search any domain...") with live filtering
 *  - Multi-domain entry with automated apex ⇄ www redirect pairing (AddDomainsDialog)
 *  - In-place domain redirect editing with HTTP status code support (EditDomainRedirectDialog)
 *  - Real-time in-place DNS verification triggers with loading animations
 *  - Zero-layout-shift background auto-verification polling for pending domains
 *  - Vercel-style status indicators ("Valid Configuration" / "Invalid Configuration")
 *  - Destination badges (Workspace target vs HTTP 301/302/307/308 redirects)
 *  - Collapsible BIND-standard DNS record tables with one-click copy utilities
 *  - Primary domain assignment and SSL status indicators
 *  - Safe removal with confirmation modals
 *  - Strict adherence to Clean Architecture and @core/ui/* design system
 *  - Full English and Arabic RTL/LTR localization parity
 *
 * @module tenants/presentation/components/tabs
 */
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Skeleton } from "@core/ui/skeleton";
import { toast } from "@core/hooks/use-enhanced-toast";
import { cn } from "@core/common/utils";
import {
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
} from "lucide-react";
import { useTenantDomainsViewModel } from "../../viewmodels/useTenantDomainsViewModel";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";
import { AddDomainsDialog } from "../dialogs/AddDomainsDialog";
import { EditDomainRedirectDialog } from "../dialogs/EditDomainRedirectDialog";
import { VercelDomainCard } from "../cards/VercelDomainCard";
import { AutoDomainCard } from "../cards/AutoDomainCard";

// ─── Component Props ──────────────────────────────────────

export interface TenantDomainsTabProps {
  /** Encrypted or unique identifier of the tenant workspace */
  tenantId: string;
  /** Human-readable display name of the tenant workspace */
  tenantName: string;
}

/**
 * Vercel-grade presentation component rendering tenant custom domain management.
 */
export function TenantDomainsTab({ tenantId, tenantName }: TenantDomainsTabProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [editingDomain, setEditingDomain] = useState<TenantDomain | null>(null);
  const [deleteTargetDomain, setDeleteTargetDomain] = useState<TenantDomain | null>(null);

  const vm = useTenantDomainsViewModel({ tenantId, tenantName });

  // ── Filtered Domains ────────────────────────────────────
  const filteredAutoDomains = useMemo(() => {
    if (!searchQuery.trim()) return vm.autoDomains;
    const query = searchQuery.trim().toLowerCase();
    return vm.autoDomains.filter((d) => d.domain.toLowerCase().includes(query));
  }, [vm.autoDomains, searchQuery]);

  const filteredCustomDomains = useMemo(() => {
    if (!searchQuery.trim()) return vm.customDomains;
    const query = searchQuery.trim().toLowerCase();
    return vm.customDomains.filter((d) =>
      d.domain.toLowerCase().includes(query) ||
      (d.redirectTo && d.redirectTo.toLowerCase().includes(query))
    );
  }, [vm.customDomains, searchQuery]);

  // ── Stable Event Handlers (Preserves Child Memoization) ──
  const copyToClipboard = useCallback(
    (text: string, label?: string) => {
      navigator.clipboard.writeText(text);
      toast.success(label ? `${label} ${t("tenant.domainsCopied")}` : t("tenant.domainsCopied"));
    },
    [t]
  );

  const handleVerify = useCallback(
    async (id: string) => {
      return vm.verifyDomain(id);
    },
    [vm.verifyDomain]
  );

  const handleDomainUpdated = useCallback(
    (updated: TenantDomain) => {
      vm.updateDomainInPlace(updated);
    },
    [vm.updateDomainInPlace]
  );

  const handleSetPrimary = useCallback(
    (id: string) => {
      vm.setDomainPrimary(id);
    },
    [vm.setDomainPrimary]
  );

  const handleEdit = useCallback((dom: TenantDomain) => {
    setEditingDomain(dom);
  }, []);

  const handleRequestDelete = useCallback((dom: TenantDomain) => {
    setDeleteTargetDomain(dom);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTargetDomain) return;
    const id = deleteTargetDomain.id;
    setDeleteTargetDomain(null);
    await vm.removeDomain(id);
  };

  // ── Loading / Error State ───────────────────────────────
  if (vm.isLoading) {
    return (
      <div className="space-y-4" dir={direction}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-nx-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-nx-lg" />
        <Skeleton className="h-44 w-full rounded-nx-lg" />
        <Skeleton className="h-44 w-full rounded-nx-lg" />
      </div>
    );
  }

  if (vm.error) {
    return <ErrorMessage message={vm.error} onRetry={vm.refresh} />;
  }

  const verifiedCount = vm.customDomains.filter((d) => d.isVerified).length;
  const pendingCount = vm.customDomains.filter((d) => !d.isVerified).length;
  const totalCount = vm.domains.length;

  return (
    <div className="space-y-6" dir={direction}>
      {/* ── Top Summary / KPI Bar (Zero Layout Shift) ───────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-nx-line bg-nx-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-2">
                {t("tenant.domainsStatsTotal")}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-nx-ink">{totalCount}</p>
              <p className="mt-0.5 text-[11px] text-nx-ink-3">
                {vm.autoDomains.length} {t("tenant.domainsAutoShort")} • {vm.customDomains.length} {t("tenant.domainsCustomShort")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-accent/10 text-nx-accent">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>

        <Card className="border-nx-line bg-nx-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-2">
                {t("tenant.domainsStatsVerified")}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-success">
                {verifiedCount}
              </p>
              <p className="mt-0.5 text-[11px] text-nx-ink-3">
                {verifiedCount} / {vm.customDomains.length} {t("tenant.domainsCustomShort")}
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
                {t("tenant.domainsStatsPending")}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-warning">{pendingCount}</span>
                {vm.isAutoVerifying && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-info">
                    <Loader2 className="h-3 w-3 animate-spin text-info" aria-hidden="true" />
                    <span>{t("tenant.domainsAutoVerifying")}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-warning/10 text-warning">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Header Toolbar with Search & Add Action ──────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-nx-ink-3 pointer-events-none",
              isRtl ? "right-3" : "left-3"
            )}
            aria-hidden="true"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("tenant.domainsSearchPlaceholder")}
            className={cn("h-9 text-xs", isRtl ? "pr-9" : "pl-9")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="gap-1.5 text-xs text-nx-ink-2"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            {t("tenant.domainsHowItWorks")}
            {showGuide ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("tenant.domainsAddTitle")}
          </Button>
        </div>
      </div>

      {/* ── Collapsible "How it Works" Guide ─────────────── */}
      {showGuide && (
        <Card className="border-info/20 bg-info/5 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-info">
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>{t("tenant.domainsHowItWorks")}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-nx-md bg-nx-surface p-3 border border-nx-line">
                <p className="font-semibold text-nx-ink">{t("tenant.domainsStep1Title")}</p>
                <p className="mt-1 text-nx-ink-2 leading-relaxed">{t("tenant.domainsStep1Desc")}</p>
              </div>
              <div className="rounded-nx-md bg-nx-surface p-3 border border-nx-line">
                <p className="font-semibold text-nx-ink">{t("tenant.domainsStep2Title")}</p>
                <p className="mt-1 text-nx-ink-2 leading-relaxed">{t("tenant.domainsStep2Desc")}</p>
              </div>
              <div className="rounded-nx-md bg-nx-surface p-3 border border-nx-line">
                <p className="font-semibold text-nx-ink">{t("tenant.domainsStep3Title")}</p>
                <p className="mt-1 text-nx-ink-2 leading-relaxed">{t("tenant.domainsStep3Desc")}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Auto-Generated Platform Domains ──────────────── */}
      {filteredAutoDomains.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
              {t("tenant.domainsAutoGenerated")}
            </span>
            <Badge variant="outline" className="text-[10px] text-nx-ink-2 border-nx-line">
              {t("tenant.domainsSystemManaged")}
            </Badge>
          </div>

          <div className="space-y-2">
            {filteredAutoDomains.map((d) => (
              <AutoDomainCard
                key={d.id}
                domain={d}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Custom Vanity Domains List (Vercel-Grade Cards) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
            {t("tenant.domainsCustom")}{" "}
            {vm.customDomains.length > 0 && `(${vm.customDomains.length})`}
          </span>
        </div>

        {filteredCustomDomains.length === 0 ? (
          searchQuery ? (
            <div className="rounded-nx-md border border-nx-line bg-nx-surface p-8 text-center text-xs text-nx-ink-2">
              {t("common.noResults")}
            </div>
          ) : (
            <EmptyState
              icon={Globe}
              size="sm"
              title={t("tenant.domainsNoCustom")}
              description={t("tenant.domainsNoCustomHint")}
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("tenant.domainsAddTitle")}
                </Button>
              }
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredCustomDomains.map((d) => (
              <VercelDomainCard
                key={d.id}
                domain={d}
                cnameTarget={vm.cnameTarget || "admin.scripe.org"}
                verifyPrefix={vm.verifyPrefix || "_scr-verify"}
                isVerifying={vm.isDomainVerifying(d.id)}
                isRemoving={vm.removingId === d.id}
                onVerify={handleVerify}
                onDomainUpdated={handleDomainUpdated}
                onSetPrimary={handleSetPrimary}
                onEdit={handleEdit}
                onRequestDelete={handleRequestDelete}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add Domains Modal (Vercel-Grade) ──────────────── */}
      <AddDomainsDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        existingDomains={vm.domains}
        onAddDomains={vm.addDomainBatch}
        isSubmitting={vm.isAdding}
      />

      {/* ── Edit Domain Redirect Modal (Vercel-Grade) ─────── */}
      <EditDomainRedirectDialog
        open={Boolean(editingDomain)}
        onOpenChange={(open) => !open && setEditingDomain(null)}
        domain={editingDomain}
        existingDomains={vm.domains}
        onSave={vm.updateDomainRedirect}
        isSubmitting={vm.isUpdatingRedirect}
      />

      {/* ── Delete Confirmation Dialog ───────────────────── */}
      <ConfirmationDialog
        open={Boolean(deleteTargetDomain)}
        onOpenChange={(open) => !open && setDeleteTargetDomain(null)}
        variant="destructive"
        title={t("tenant.domainsDeleteTitle")}
        description={
          deleteTargetDomain
            ? `${deleteTargetDomain.domain} — ${t("tenant.domainsDeleteConfirm")}`
            : t("tenant.domainsDeleteConfirm")
        }
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
