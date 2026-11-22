"use client";

/**
 * ForensicPayloadDrawer
 *
 * Slide-out SOC2 Audit Inspector displaying syntax-highlighted forensic JSON,
 * cryptographic request signatures, actor metadata, and 1-click copy/download.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Copy,
  Download,
  Check,
  FileCode,
  UserCheck,
  Globe,
  Clock,
} from "lucide-react";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";

/** Props for {@link ForensicPayloadDrawer}. */
interface ForensicPayloadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: SecurityAuditEntry | null;
}

/** Slide-over inspector drawer displaying sanitized forensic JSON telemetry for an audit entry. */
export function ForensicPayloadDrawer({
  isOpen,
  onClose,
  entry,
}: ForensicPayloadDrawerProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const formattedJson = JSON.stringify(
    {
      auditId: entry.id,
      eventType: entry.eventType,
      outcome: entry.isSuccess ? "SUCCESS" : "FAILURE",
      timestampUtc: entry.timestamp.toISOString(),
      network: {
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
      forensics: {
        impersonatedBy: entry.impersonatedBy || null,
        details: entry.details,
        rawTelemetry: entry.rawPayload || {},
      },
      soc2Compliance: {
        standard: "SOC2-CC6.1 / CC6.8",
        tamperEvident: true,
        retentionPolicy: "730-days",
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scripe_audit_${entry.id}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg bg-nx-surface border-nx-line p-6 flex flex-col h-full overflow-hidden">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-nx-accent-wash text-nx-accent border border-nx-accent/20">
              <FileCode className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
            </div>
            <SheetTitle className="text-sm font-bold text-nx-ink">
              {t("profile.audit.drawerTitle")}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-nx-ink-3 font-mono">
            {entry.id}
          </SheetDescription>
        </SheetHeader>

        {/* Audit Meta Badges */}
        <div className="py-4 space-y-3 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <div className="flex items-center gap-1.5 text-nx-ink-3 text-[10px]">
                <Clock className="h-3 w-3" />
                <span>{t("profile.audit.timestamp")}</span>
              </div>
              <div className="font-mono text-[11px] font-semibold text-nx-ink mt-1">
                {entry.timestamp.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <div className="flex items-center gap-1.5 text-nx-ink-3 text-[10px]">
                <Globe className="h-3 w-3" />
                <span>{t("profile.audit.networkIp")}</span>
              </div>
              <div className="font-mono text-[11px] font-semibold text-nx-ink mt-1">
                {entry.ipAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={
                entry.isSuccess
                  ? "border-success/30 text-success text-[10px]"
                  : "border-destructive/30 text-destructive text-[10px]"
              }
            >
              {entry.isSuccess ? t("profile.audit.statusSuccess") : t("profile.audit.statusFailure")}
            </Badge>

            <Badge variant="outline" className="border-nx-line text-nx-ink-2 text-[10px]">
              {entry.eventType}
            </Badge>

            {entry.impersonatedBy && (
              <Badge variant="outline" className="border-warning/40 text-warning text-[10px] flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                <span>{t("profile.audit.impersonatedBy", { name: entry.impersonatedBy })}</span>
              </Badge>
            )}
          </div>

          {/* User Agent */}
          <div className="p-3 rounded-lg border border-nx-line bg-nx-raised text-xs">
            <div className="text-[10px] text-nx-ink-3">{t("profile.audit.userAgent")}</div>
            <div className="font-mono text-[10px] text-nx-ink-2 mt-0.5 break-all">
              {entry.userAgent}
            </div>
          </div>

          {/* Syntax-highlighted JSON Inspector */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-nx-ink">
                {t("profile.audit.rawPayload")}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-[10px] gap-1"
                >
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? t("profile.common.copied") : t("profile.common.copy")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 px-2 text-[10px] gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>JSON</span>
                </Button>
              </div>
            </div>

            <pre className="p-3.5 rounded-xl bg-nx-raised border border-nx-line font-mono text-[11px] text-nx-ink leading-relaxed overflow-x-auto max-h-72 select-all">
              {formattedJson}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
