/**
 * VercelDomainCard — Vercel-Grade In-Place Custom Domain Card
 *
 * Implements an isolated, high-fidelity custom domain card modeled after Vercel.
 * Provides in-place live DNS re-verification without re-rendering parent components
 * or adjacent cards, collapsible BIND-formatted DNS tables, and full localization.
 *
 * Memoized with React.memo to guarantee zero layout shifts and zero unwanted cascades.
 *
 * @module tenants/presentation/components/cards
 */
"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
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
  Trash2,
  CheckCircle2,
  Clock,
  Star,
  Copy,
  Check,
  Info,
  HelpCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  MoreVertical,
  CornerDownRight,
  Pencil,
} from "lucide-react";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";

export interface VercelDomainCardProps {
  /** The tenant domain entity to display */
  domain: TenantDomain;
  /** Primary CNAME target (e.g. admin.scripe.org) */
  cnameTarget: string;
  /** Verification TXT prefix (e.g. _scr-verify) */
  verifyPrefix: string;
  /** Optional background verifying indicator from parent */
  isVerifying?: boolean;
  /** True if this domain is currently being deleted */
  isRemoving?: boolean;
  /** Asynchronous verification handler returning updated entity */
  onVerify: (id: string) => Promise<TenantDomain | null>;
  /** Callback notifying parent of updated entity for quiet cache sync */
  onDomainUpdated?: (updated: TenantDomain) => void;
  /** Primary domain designation handler */
  onSetPrimary: (id: string) => void;
  /** Edit redirect modal opener */
  onEdit: (domain: TenantDomain) => void;
  /** Delete confirmation modal opener */
  onRequestDelete: (domain: TenantDomain) => void;
  /** Generic clipboard copy utility */
  onCopy: (text: string, label?: string) => void;
}

function VercelDomainCardComponent({
  domain,
  cnameTarget,
  verifyPrefix,
  isVerifying = false,
  isRemoving = false,
  onVerify,
  onDomainUpdated,
  onSetPrimary,
  onEdit,
  onRequestDelete,
  onCopy,
}: VercelDomainCardProps) {
  const { t } = useI18n();

  // Local in-place state to isolate card re-renders
  const [isLocalChecking, setIsLocalChecking] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<TenantDomain>(domain);
  // Default to showing DNS instructions for pending domains, but preserve user toggle state across status changes
  const [showDns, setShowDns] = useState(!domain.isVerified);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize when parent passes a new entity reference
  useEffect(() => {
    setCurrentDomain(domain);
  }, [domain]);

  const isChecking = isLocalChecking || Boolean(isVerifying);

  const isApex = currentDomain.isApex;
  const routingType = currentDomain.routingRecordType;
  const routingName = currentDomain.routingRecordName;
  const routingValue = cnameTarget;

  const verifyType = "TXT";
  const verifyName = currentDomain.getVerificationRecordName(verifyPrefix);
  const verifyValue = currentDomain.verificationToken || "—";

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChecking) return;

    setIsLocalChecking(true);
    try {
      const updated = await onVerify(currentDomain.id);
      if (updated) {
        setCurrentDomain(updated);
        onDomainUpdated?.(updated);
      }
    } finally {
      setIsLocalChecking(false);
    }
  };

  const handleCopyField = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(t("tenant.domainsCopied"));
  };

  const handleCopyAllRecords = () => {
    const bindFormat = [
      `; DNS Records for ${currentDomain.domain}`,
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
        currentDomain.isPrimary && "border-info/40 bg-info/[0.02]"
      )}
    >
      {/* ── Main Domain Row (matching Vercel layout) ───────── */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Domain Info & Destination */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold text-nx-ink tracking-tight truncate">
                {currentDomain.domain}
              </span>

              {/* External Link */}
              <a
                href={`https://${currentDomain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nx-ink-3 hover:text-nx-ink transition-colors"
                title={currentDomain.domain}
                aria-label={currentDomain.domain}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              {/* Status Pill with Solid Dot or Spinner (In-Place Update) */}
              {isChecking ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-0.5 text-[11px] font-medium text-info animate-in fade-in duration-150">
                  <Loader2 className="h-3 w-3 animate-spin text-info" aria-hidden="true" />
                  {t("tenant.domainsCheckingDns")}
                </span>
              ) : currentDomain.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success animate-in fade-in duration-150">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {t("tenant.domainsStatusConfigured")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning animate-in fade-in duration-150">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  {t("tenant.domainsStatusInvalid")}
                </span>
              )}

              {/* Primary Badge */}
              {currentDomain.isPrimary && (
                <Badge variant="outline" className="border-info/40 bg-info/10 text-info text-[10px] px-2">
                  <Star className="me-1 h-3 w-3 fill-info" aria-hidden="true" />
                  {t("tenant.domainsPrimary")}
                </Badge>
              )}
            </div>

            {/* Destination Subtitle (Redirect vs Workspace) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-2">
              {currentDomain.isRedirect && currentDomain.redirectTo ? (
                <div className="flex items-center gap-1.5 font-medium text-nx-ink">
                  <CornerDownRight className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                  <Badge variant="outline" className="font-mono text-[10px] border-nx-line px-1 py-0">
                    {currentDomain.redirectStatusCode || 308}
                  </Badge>
                  <span className="font-mono text-nx-accent">
                    {currentDomain.redirectTo}
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
                {currentDomain.isVerified && currentDomain.verifiedAt
                  ? `${t("tenant.domainsVerified")} ${formatDateUtc(currentDomain.verifiedAt)}`
                  : t("tenant.domainsPendingVerification")}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Refresh / Verify Button (Vercel-Grade In-Place UX) */}
            <Button
              type="button"
              variant={currentDomain.isVerified ? "outline" : "default"}
              size="sm"
              onClick={handleRefresh}
              disabled={isChecking}
              className={cn(
                "h-8 gap-1.5 text-xs transition-colors",
                currentDomain.isVerified ? "font-medium" : "font-semibold shadow-sm"
              )}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isChecking && "animate-spin text-inherit")}
                aria-hidden="true"
              />
              <span>
                {isChecking
                  ? t("tenant.domainsCheckingDns")
                  : !currentDomain.isVerified
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
                onEdit(currentDomain);
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
                {currentDomain.isVerified && !currentDomain.isPrimary && (
                  <DropdownMenuItem onClick={() => onSetPrimary(currentDomain.id)} className="gap-2 text-xs">
                    <Star className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    <span>{t("tenant.domainsSetPrimary")}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onCopy(`https://${currentDomain.domain}`, currentDomain.domain)}
                  className="gap-2 text-xs"
                >
                  <Copy className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                  <span>{t("common.copy")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDns((prev) => !prev)}
                  className="gap-2 text-xs"
                >
                  <Info className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                  <span>{showDns ? t("tenant.domainsHideDns") : t("tenant.domainsViewDns")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRequestDelete(currentDomain)}
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
                        onClick={() => handleCopyField(`routingName-${currentDomain.id}`, routingName)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `routingName-${currentDomain.id}` ? (
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
                        onClick={() => handleCopyField(`routingVal-${currentDomain.id}`, routingValue)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `routingVal-${currentDomain.id}` ? (
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
                    {isChecking ? (
                      <span className="inline-flex items-center gap-1 text-info font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-info" />
                        {t("tenant.domainsCheckingDns")}
                      </span>
                    ) : currentDomain.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        {t("tenant.domainsStatusConfigured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning font-medium">
                        <Clock className="h-3 w-3 text-warning" />
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
                        onClick={() => handleCopyField(`verifyName-${currentDomain.id}`, verifyName)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `verifyName-${currentDomain.id}` ? (
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
                        onClick={() => handleCopyField(`verifyVal-${currentDomain.id}`, verifyValue)}
                        className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
                        title={t("common.copy")}
                        aria-label={t("common.copy")}
                      >
                        {copiedKey === `verifyVal-${currentDomain.id}` ? (
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
                    {isChecking ? (
                      <span className="inline-flex items-center gap-1 text-info font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-info" />
                        {t("tenant.domainsCheckingDns")}
                      </span>
                    ) : currentDomain.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        {t("tenant.domainsStatusConfigured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning font-medium">
                        <Clock className="h-3 w-3 text-warning" />
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

export const VercelDomainCard = React.memo(VercelDomainCardComponent);
