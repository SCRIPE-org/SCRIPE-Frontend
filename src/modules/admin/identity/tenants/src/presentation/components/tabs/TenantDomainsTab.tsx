// FILE-EXCEPTION: file length
/**
 * Tenant Domains Tab — Domain Management
 *
 * Displays all domains (auto-generated + custom) for a tenant.
 * Supports: add custom domain, verify DNS, set primary, remove.
 *
 * Premium card design with status badges and DNS instructions.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  Copy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@core/ui/skeleton";
import { cn, formatDateUtc } from "@core/common/utils";
import { useTenantDomainsViewModel } from "../../viewmodels/useTenantDomainsViewModel";
import type { TenantDomainJson } from "../../../domain/interfaces/ITenantService";

// ─── Types ────────────────────────────────────────────────

interface TenantDomainsTabProps {
  tenantId: string;
  tenantName: string;
}

// ─── Component ────────────────────────────────────────────

/**
 * Presentation UI component rendering the tenant domains tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantDomainsTab({ tenantId, tenantName }: TenantDomainsTabProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const [newDomain, setNewDomain] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const vm = useTenantDomainsViewModel({ tenantId, tenantName });

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    try {
      await vm.addDomain(newDomain);
      setNewDomain("");
      setShowAddForm(false);
    } catch {
      // Toast already handled by viewmodel
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // toast handled inline — simple utility, not worth routing through VM
    import("sonner").then(({ toast }) => toast.success(t("tenant.domainsCopied")));
  };

  // ─── Loading / Error ────────────────────────────────────

  if (vm.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{vm.error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={vm.refresh}>
          {t("tenant.domainsRetry")}
        </Button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-info/10 p-2">
            <Globe className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("tenant.domainsTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("tenant.domainsDescription", { name: tenantName })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("tenant.domainsAddCustom")}
        </Button>
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div className="space-y-3 rounded-xl border border-info/20 bg-info/5 p-4">
          <p className="text-sm font-medium">{t("tenant.domainsAddCustom")}</p>
          <div className="flex gap-2">
            <Input
              placeholder={t("tenant.domainsAddPlaceholder")}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
              className="flex-1"
            />
            <Button onClick={handleAddDomain} disabled={vm.isAdding || !newDomain.trim()} size="sm">
              {vm.isAdding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                t("tenant.domainsAdd")
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("tenant.domainsAddHint")}</p>
        </div>
      )}

      {/* Auto-Generated Domains */}
      {vm.autoDomains.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t("tenant.domainsAutoGenerated")}
          </p>
          {vm.autoDomains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              isRtl={isRtl}
              cnameTarget={vm.cnameTarget}
              verifyPrefix={vm.verifyPrefix}
              onVerify={vm.verifyDomain}
              onSetPrimary={vm.setDomainPrimary}
              onRemove={vm.removeDomain}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}

      {/* Custom Domains */}
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("tenant.domainsCustom")}{" "}
          {vm.customDomains.length > 0 && `(${vm.customDomains.length})`}
        </p>
        {vm.customDomains.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center">
            <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("tenant.domainsNoCustom")}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {t("tenant.domainsNoCustomHint")}
            </p>
          </div>
        ) : (
          vm.customDomains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              isRtl={isRtl}
              cnameTarget={vm.cnameTarget}
              verifyPrefix={vm.verifyPrefix}
              onVerify={vm.verifyDomain}
              onSetPrimary={vm.setDomainPrimary}
              onRemove={vm.removeDomain}
              onCopy={copyToClipboard}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Domain Card ──────────────────────────────────────────

interface DomainCardProps {
  domain: TenantDomainJson;
  isRtl: boolean;
  cnameTarget: string;
  verifyPrefix: string;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
  onCopy: (text: string) => void;
}

function DomainCard({
  domain,
  isRtl,
  cnameTarget,
  verifyPrefix,
  onVerify,
  onSetPrimary,
  onRemove,
  onCopy,
}: DomainCardProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:border-border/80 hover:shadow-md",
        domain.isPrimary && "border-info/30 bg-info/5"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left: domain info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              domain.isVerified ? "bg-success/10" : "bg-warning/10"
            )}
          >
            {domain.isVerified ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <Clock className="h-4 w-4 text-warning" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-mono text-sm font-medium">{domain.domain}</span>
              {domain.isPrimary && (
                <Badge
                  variant="outline"
                  className="border-info/30 px-1.5 text-[10px] text-info"
                >
                  <Star className="mr-0.5 h-3 w-3" /> {t("tenant.domainsPrimary")}
                </Badge>
              )}
              {domain.type === "auto" && (
                <Badge variant="outline" className="px-1.5 text-[10px] text-muted-foreground">
                  {t("tenant.domainsAuto")}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {domain.isVerified
                ? `${t("tenant.domainsVerified")} ${domain.verifiedAt ? formatDateUtc(domain.verifiedAt) : ""}`
                : t("tenant.domainsPendingVerification")}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* DNS verification info for unverified custom domains */}
          {!domain.isVerified && domain.type === "custom" && domain.verificationToken && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onCopy(`${domain.verificationToken}`)}
              title={t("tenant.domainsCopyToken")}
            >
              <Copy className="h-3 w-3" />
              {t("tenant.domainsToken")}
            </Button>
          )}

          {/* Verify button */}
          {!domain.isVerified && domain.type === "custom" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onVerify(domain.id)}
            >
              <ShieldCheck className="h-3 w-3" />
              {t("tenant.domainsVerify")}
            </Button>
          )}

          {/* Set Primary */}
          {domain.isVerified && !domain.isPrimary && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onSetPrimary(domain.id)}
            >
              <Star className="h-3 w-3" />
              {t("tenant.domainsSetPrimary")}
            </Button>
          )}

          {/* Remove (custom only) */}
          {domain.type === "custom" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(domain.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* DNS Instructions for unverified custom domains */}
      {!domain.isVerified && domain.type === "custom" && domain.verificationToken && (
        <div className="mt-3 space-y-2 rounded-lg border border-warning/10 bg-warning/5 p-3 text-xs">
          <p className="font-medium text-warning">{t("tenant.domainsDnsRequired")}</p>

          {/* Step 1: CNAME record */}
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">{t("tenant.domainsDnsStep1")}</p>
            <div className="flex items-center gap-2 rounded bg-muted/50 p-2 font-mono text-[11px]">
              <span className="flex-1 truncate">
                {domain.domain} → CNAME → {cnameTarget}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => onCopy(domain.domain)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Step 2: TXT record for verification */}
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">{t("tenant.domainsDnsStep2")}</p>
            <div className="flex items-center gap-2 rounded bg-muted/50 p-2 font-mono text-[11px]">
              <span className="flex-1 truncate">
                {verifyPrefix}.{domain.domain} → {domain.verificationToken}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => onCopy(`${verifyPrefix}.${domain.domain}`)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
