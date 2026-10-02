// FILE-EXCEPTION: file length
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
 *  - Real-time DNS verification triggers with loading animations
 *  - Background auto-verification polling for pending domains with status indicator
 *  - Vercel-style status indicators ("Valid Configuration" / "Invalid Configuration")
 *  - Destination badges (Production environment vs HTTP 301/302/307/308 redirects)
 *  - Collapsible BIND-standard DNS record tables with one-click copy utilities
 *  - Primary domain assignment and SSL status indicators
 *  - Safe removal with confirmation modals
 *  - Strict adherence to Clean Architecture and @core/ui/* design system
 *  - Full English and Arabic RTL/LTR localization parity
 *
 * @module tenants/presentation/components/tabs
 */
"use client";

import { useState, useMemo } from "react";
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
import { cn, formatDateUtc } from "@core/common/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@core/ui/table";
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  Copy,
  Check,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Search,
  RefreshCw,
  MoreVertical,
  CornerDownRight,
  Pencil,
} from "lucide-react";
import { useTenantDomainsViewModel } from "../../viewmodels/useTenantDomainsViewModel";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";
import { AddDomainsDialog } from "../dialogs/AddDomainsDialog";
import { EditDomainRedirectDialog } from "../dialogs/EditDomainRedirectDialog";

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

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label ? `${label} ${t("tenant.domainsCopied")}` : t("tenant.domainsCopied"));
  };

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
      {/* ── Top Summary / KPI Bar ────────────────────────── */}
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
              <p className="mt-1 text-2xl font-bold tracking-tight text-warning">{pendingCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-warning/10 text-warning">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Auto-Verification Polling Alert (Vercel-Grade UX) ── */}
      {vm.isAutoVerifying && (
        <div className="flex items-center justify-between rounded-nx-md border border-info/30 bg-info/5 px-4 py-2.5 text-xs text-info">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>{t("tenant.domainsAutoVerifying")}</span>
          </div>
          <Badge variant="outline" className="border-info/40 bg-info/10 text-[10px] text-info">
            DNS Polling
          </Badge>
        </div>
      )}

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
                onVerify={vm.verifyDomain}
                onSetPrimary={vm.setDomainPrimary}
                onEdit={(dom) => setEditingDomain(dom)}
                onRequestDelete={(dom) => setDeleteTargetDomain(dom)}
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

// ─── Auto-Generated Domain Card ───────────────────────────

interface AutoDomainCardProps {
  domain: TenantDomain;
  onCopy: (text: string, label?: string) => void;
}

function AutoDomainCard({ domain, onCopy }: AutoDomainCardProps) {
  const { t } = useI18n();

  return (
    <Card className="border-nx-line bg-nx-surface p-4 transition-colors hover:border-nx-line-hi">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-success/10 text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-nx-ink truncate">
                {domain.domain}
              </span>
              {domain.isPrimary && (
                <Badge variant="outline" className="border-info/40 bg-info/10 text-info px-1.5 text-[10px]">
                  <Star className="me-1 h-3 w-3 fill-info" aria-hidden="true" />
                  {t("tenant.domainsPrimary")}
                </Badge>
              )}
              <Badge variant="outline" className="border-nx-line text-nx-ink-2 px-1.5 text-[10px]">
                {t("tenant.domainsAuto")}
              </Badge>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success px-1.5 text-[10px]">
                <ShieldCheck className="me-1 h-3 w-3" aria-hidden="true" />
                {t("tenant.domainsSslActive")}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-nx-ink-2">
              {t("tenant.domainsSystemManagedHint")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCopy(`https://${domain.domain}`, domain.domain)}
            className="h-8 gap-1.5 text-xs text-nx-ink-2"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.copy")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-nx-ink-2 hover:text-nx-ink"
            asChild
          >
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              title={domain.domain}
              aria-label={domain.domain}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Vercel Domain Card (Vercel-Grade Fidelity) ────────────

interface VercelDomainCardProps {
  domain: TenantDomain;
  cnameTarget: string;
  verifyPrefix: string;
  isVerifying: boolean;
  isRemoving: boolean;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onEdit: (domain: TenantDomain) => void;
  onRequestDelete: (domain: TenantDomain) => void;
  onCopy: (text: string, label?: string) => void;
}

function VercelDomainCard({
  domain,
  cnameTarget,
  verifyPrefix,
  isVerifying,
  isRemoving,
  onVerify,
  onSetPrimary,
  onEdit,
  onRequestDelete,
  onCopy,
}: VercelDomainCardProps) {
  const { t } = useI18n();
  // By default, expand DNS table if domain is not yet verified so user immediately sees how to configure it
  const [dnsToggled, setDnsToggled] = useState<boolean | null>(null);
  const showDns = dnsToggled !== null ? dnsToggled : !domain.isVerified;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isApex = domain.isApex;
  const routingType = domain.routingRecordType;
  const routingName = domain.routingRecordName;
  const routingValue = cnameTarget;

  const verifyType = "TXT";
  const verifyName = domain.getVerificationRecordName(verifyPrefix);
  const verifyValue = domain.verificationToken || "—";

  const handleCopyField = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(t("tenant.domainsCopied"));
  };

  const handleCopyAllRecords = () => {
    const bindFormat = [
      `; DNS Records for ${domain.domain}`,
      `; Routing Record`,
      `${routingName}\t60\tIN\t${isApex ? "ALIAS" : "CNAME"}\t${routingValue}`,
      `; Ownership Verification Record`,
      `${verifyName}\t60\tIN\tTXT\t"${verifyValue}"`,
    ].join("\n");

    navigator.clipboard.writeText(bindFormat);
    toast.success(t("tenant.domainsAllCopied"));
  };

  return (
    <Card
      className={cn(
        "border-nx-line bg-nx-surface transition-all duration-nx-micro hover:border-nx-line-hi overflow-hidden",
        domain.isPrimary && "border-info/40 bg-info/[0.02]"
      )}
    >
      {/* ── Main Domain Row (matching Vercel layout) ───────── */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Domain Info & Destination */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold text-nx-ink tracking-tight truncate">
                {domain.domain}
              </span>

              {/* External Link */}
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nx-ink-3 hover:text-nx-ink transition-colors"
                title={domain.domain}
                aria-label={domain.domain}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              {/* Status Pill with Solid Dot or Spinner */}
              {isVerifying ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-0.5 text-[11px] font-medium text-info">
                  <Loader2 className="h-3 w-3 animate-spin text-info" aria-hidden="true" />
                  {t("tenant.domainsCheckingDns")}
                </span>
              ) : domain.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {t("tenant.domainsStatusConfigured")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  {t("tenant.domainsStatusInvalid")}
                </span>
              )}

              {/* Primary Badge */}
              {domain.isPrimary && (
                <Badge variant="outline" className="border-info/40 bg-info/10 text-info text-[10px] px-2">
                  <Star className="me-1 h-3 w-3 fill-info" aria-hidden="true" />
                  {t("tenant.domainsPrimary")}
                </Badge>
              )}
            </div>

            {/* Destination Subtitle (Redirect vs Workspace) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-2">
              {domain.isRedirect && domain.redirectTo ? (
                <div className="flex items-center gap-1.5 font-medium text-nx-ink">
                  <CornerDownRight className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                  <Badge variant="outline" className="font-mono text-[10px] border-nx-line px-1 py-0">
                    {domain.redirectStatusCode || 308}
                  </Badge>
                  <span className="font-mono text-nx-accent">
                    {domain.redirectTo}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                  <Badge variant="outline" className="text-[10px] border-nx-line bg-nx-raised font-medium">
                    {t("tenant.domainsWorkspaceTarget")}
                  </Badge>
                </div>
              )}

              <span className="text-nx-ink-3">•</span>

              <span>
                {domain.isVerified && domain.verifiedAt
                  ? `${t("tenant.domainsVerified")} ${formatDateUtc(domain.verifiedAt)}`
                  : t("tenant.domainsPendingVerification")}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Refresh / Verify Button (Vercel-Grade UX) */}
            <Button
              type="button"
              variant={domain.isVerified ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onVerify(domain.id);
              }}
              disabled={isVerifying}
              className={cn(
                "h-8 gap-1.5 text-xs",
                domain.isVerified ? "font-medium" : "font-semibold shadow-sm"
              )}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isVerifying && "animate-spin text-inherit")}
                aria-hidden="true"
              />
              <span>
                {isVerifying
                  ? t("tenant.domainsCheckingDns")
                  : !domain.isVerified
                  ? t("tenant.domainsVerify")
                  : t("common.refresh")}
              </span>
            </Button>

            {/* Edit Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(domain);
              }}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Pencil className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
              <span>{t("tenant.domainsEditRedirect")}</span>
            </Button>

            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-nx-ink-2 hover:text-nx-ink"
                  aria-label={t("tenant.domainsMoreOptions")}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {domain.isVerified && !domain.isPrimary && (
                  <DropdownMenuItem onClick={() => onSetPrimary(domain.id)} className="gap-2 text-xs">
                    <Star className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    <span>{t("tenant.domainsSetPrimary")}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onCopy(`https://${domain.domain}`, domain.domain)}
                  className="gap-2 text-xs"
                >
                  <Copy className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                  <span>{t("common.copy")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDnsToggled(!showDns)}
                  className="gap-2 text-xs"
                >
                  <Info className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                  <span>{showDns ? t("tenant.domainsHideDns") : t("tenant.domainsViewDns")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRequestDelete(domain)}
                  disabled={isRemoving}
                  className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("common.delete")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Collapsible DNS Records Table (BIND standard) ───── */}
      {showDns && (
        <div className="border-t border-nx-line p-4 sm:p-5 space-y-3 bg-nx-raised/40">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink">
                {t("tenant.domainsDnsRecordsTitle")}
              </span>
              <Badge variant="outline" className="text-[10px] text-nx-ink-2 font-mono">
                {isApex ? "Apex Domain" : "Subdomain"}
              </Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyAllRecords}
              className="h-7 gap-1.5 text-xs text-nx-ink-2 self-start sm:self-auto"
            >
              <Copy className="h-3 w-3" aria-hidden="true" />
              {t("tenant.domainsCopyAll")}
            </Button>
          </div>

          {/* DNS Table Container */}
          <div className="overflow-x-auto rounded-nx-md border border-nx-line bg-nx-surface">
            <Table className="w-full text-start text-xs">
              <TableHeader>
                <TableRow className="border-b border-nx-line bg-nx-raised/80 text-nx-ink-2">
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordType")}</TableHead>
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordName")}</TableHead>
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordValue")}</TableHead>
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordTtl")}</TableHead>
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordPurpose")}</TableHead>
                  <TableHead className="py-2.5 px-3 font-semibold text-start">{t("tenant.domainsRecordStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-nx-line font-mono text-[11px]">
                {/* Row 1: Routing Record */}
                <TableRow className="hover:bg-nx-raised/30 transition-colors">
                  <TableCell className="py-2.5 px-3 font-bold text-info">
                    <span className="rounded bg-info/10 px-1.5 py-0.5">{routingType}</span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-nx-ink">{routingName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyField(`routingName-${domain.id}`, routingName)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `routingName-${domain.id}` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-nx-ink max-w-[260px] truncate">{routingValue}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyField(`routingVal-${domain.id}`, routingValue)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `routingVal-${domain.id}` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-nx-ink-2">60s / Auto</TableCell>
                  <TableCell className="py-2.5 px-3 font-sans text-nx-ink-2">{t("tenant.domainsPurposeRouting")}</TableCell>
                  <TableCell className="py-2.5 px-3 font-sans">
                    {isVerifying ? (
                      <span className="inline-flex items-center gap-1 text-info font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-info" />
                        {t("tenant.domainsCheckingDns")}
                      </span>
                    ) : domain.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("tenant.domainsStatusConfigured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning font-medium">
                        <Clock className="h-3 w-3" />
                        {t("tenant.domainsStatusPending")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>

                {/* Row 2: Verification TXT Record */}
                <TableRow className="hover:bg-nx-raised/30 transition-colors">
                  <TableCell className="py-2.5 px-3 font-bold text-nx-accent">
                    <span className="rounded bg-nx-accent/10 px-1.5 py-0.5">{verifyType}</span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-nx-ink">{verifyName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyField(`verifyName-${domain.id}`, verifyName)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `verifyName-${domain.id}` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-nx-ink max-w-[260px] truncate">{verifyValue}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyField(`verifyVal-${domain.id}`, verifyValue)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `verifyVal-${domain.id}` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-nx-ink-2">60s / Auto</TableCell>
                  <TableCell className="py-2.5 px-3 font-sans text-nx-ink-2">{t("tenant.domainsPurposeVerification")}</TableCell>
                  <TableCell className="py-2.5 px-3 font-sans">
                    {isVerifying ? (
                      <span className="inline-flex items-center gap-1 text-info font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-info" />
                        {t("tenant.domainsCheckingDns")}
                      </span>
                    ) : domain.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("tenant.domainsStatusConfigured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning font-medium">
                        <Clock className="h-3 w-3" />
                        {t("tenant.domainsStatusPending")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Provider Configuration Guidance (Vercel-Grade Support) */}
          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-nx-ink font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-info" aria-hidden="true" />
              <span>{t("tenant.domainsDnsProviderTipsTitle")}</span>
            </div>
            <ul className="list-disc ps-4 space-y-1 text-[11px] text-nx-ink-2 leading-relaxed">
              <li>{t("tenant.domainsDnsCloudflareTip")}</li>
              <li>{t("tenant.domainsDnsRegistrarTip")}</li>
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-nx-md border border-nx-line bg-nx-surface p-3 text-[11px] text-nx-ink-2 leading-relaxed">
            <Info className="h-4 w-4 text-info shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t("tenant.domainsDnsPropagationNotice")}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
