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

import { useState, useEffect, useCallback } from "react";
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
import { cn } from "@core/common/utils";
import { getModuleApiService } from "@core/services/api-factory";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────

interface TenantDomain {
  id: string;
  domain: string;
  type: "auto" | "custom";
  isPrimary: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

interface TenantDomainsTabProps {
  tenantId: string;
  tenantName: string;
}

// ─── Component ────────────────────────────────────────────

export function TenantDomainsTab({ tenantId, tenantName }: TenantDomainsTabProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const api = getModuleApiService("IDENTITY");

  // ─── Fetch Domains ──────────────────────────────────────

  const fetchDomains = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<TenantDomain[]>(API_ENDPOINTS.TENANTS.DOMAINS(tenantId));
      setDomains(data || []);
      setError(null);
    } catch {
      setError(t("tenant.domainsLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // ─── Actions ────────────────────────────────────────────

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setIsAdding(true);
    try {
      await api.post(API_ENDPOINTS.TENANTS.DOMAINS(tenantId), { domain: newDomain.trim() });
      toast.success(t("tenant.domainsAddedSuccess"));
      setNewDomain("");
      setShowAddForm(false);
      await fetchDomains();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || t("tenant.domainsAddFailed"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      await api.post(API_ENDPOINTS.TENANTS.DOMAIN_VERIFY(tenantId, domainId), {});
      toast.success(t("tenant.domainsVerifiedSuccess"));
      await fetchDomains();
    } catch {
      toast.error(t("tenant.domainsVerifyFailed"));
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      await api.put(API_ENDPOINTS.TENANTS.DOMAIN_PRIMARY(tenantId, domainId), {});
      toast.success(t("tenant.domainsPrimaryUpdated"));
      await fetchDomains();
    } catch {
      toast.error(t("tenant.domainsPrimaryFailed"));
    }
  };

  const handleRemove = async (domainId: string) => {
    try {
      await api.delete(API_ENDPOINTS.TENANTS.DOMAIN_BY_ID(tenantId, domainId));
      toast.success(t("tenant.domainsRemoved"));
      await fetchDomains();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || t("tenant.domainsRemoveFailed"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("tenant.domainsCopied"));
  };

  // ─── Loading / Error ────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={fetchDomains}>
          {t("tenant.domainsRetry")}
        </Button>
      </div>
    );
  }

  const autoDomains = domains.filter((d) => d.type === "auto");
  const customDomains = domains.filter((d) => d.type === "custom");

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2">
            <Globe className="h-5 w-5 text-cyan-500" />
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
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
          <p className="text-sm font-medium">{t("tenant.domainsAddCustom")}</p>
          <div className="flex gap-2">
            <Input
              placeholder={t("tenant.domainsAddPlaceholder")}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
              className="flex-1"
            />
            <Button onClick={handleAddDomain} disabled={isAdding || !newDomain.trim()} size="sm">
              {isAdding ? <RefreshCw className="h-4 w-4 animate-spin" /> : t("tenant.domainsAdd")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("tenant.domainsAddHint")}
          </p>
        </div>
      )}

      {/* Auto-Generated Domains */}
      {autoDomains.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("tenant.domainsAutoGenerated")}
          </p>
          {autoDomains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              isRtl={isRtl}
              t={t}
              onVerify={handleVerify}
              onSetPrimary={handleSetPrimary}
              onRemove={handleRemove}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}

      {/* Custom Domains */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t("tenant.domainsCustom")} {customDomains.length > 0 && `(${customDomains.length})`}
        </p>
        {customDomains.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("tenant.domainsNoCustom")}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t("tenant.domainsNoCustomHint")}
            </p>
          </div>
        ) : (
          customDomains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              isRtl={isRtl}
              t={t}
              onVerify={handleVerify}
              onSetPrimary={handleSetPrimary}
              onRemove={handleRemove}
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
  domain: TenantDomain;
  isRtl: boolean;
  t: (key: string, args?: Record<string, unknown>) => string;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
  onCopy: (text: string) => void;
}

function DomainCard({ domain, isRtl, t, onVerify, onSetPrimary, onRemove, onCopy }: DomainCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        domain.isPrimary && "border-cyan-500/30 bg-cyan-500/5"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left: domain info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
              domain.isVerified ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}
          >
            {domain.isVerified ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Clock className="h-4 w-4 text-amber-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-medium truncate">{domain.domain}</span>
              {domain.isPrimary && (
                <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-[10px] px-1.5">
                  <Star className="h-3 w-3 mr-0.5" /> {t("tenant.domainsPrimary")}
                </Badge>
              )}
              {domain.type === "auto" && (
                <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5">
                  {t("tenant.domainsAuto")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {domain.isVerified
                ? `${t("tenant.domainsVerified")} ${domain.verifiedAt ? new Date(domain.verifiedAt).toLocaleDateString() : ""}`
                : t("tenant.domainsPendingVerification")}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* DNS verification info for unverified custom domains */}
          {!domain.isVerified && domain.type === "custom" && domain.verificationToken && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
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
              className="h-7 text-xs gap-1"
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
              className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="h-7 text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(domain.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* DNS Instructions for unverified custom domains */}
      {!domain.isVerified && domain.type === "custom" && domain.verificationToken && (
        <div className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 text-xs space-y-2">
          <p className="font-medium text-amber-600">{t("tenant.domainsDnsRequired")}</p>

          {/* Step 1: CNAME record */}
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">{t("tenant.domainsDnsStep1")}</p>
            <div className="flex items-center gap-2 bg-muted/50 rounded p-2 font-mono text-[11px]">
              <span className="flex-1 truncate">
                {domain.domain} → CNAME → {t("tenant.domainsCnameTarget")}
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
            <p className="text-muted-foreground font-medium">{t("tenant.domainsDnsStep2")}</p>
            <div className="flex items-center gap-2 bg-muted/50 rounded p-2 font-mono text-[11px]">
              <span className="flex-1 truncate">
                _nexora-verify.{domain.domain} → {domain.verificationToken}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => onCopy(`_nexora-verify.${domain.domain}`)}
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
