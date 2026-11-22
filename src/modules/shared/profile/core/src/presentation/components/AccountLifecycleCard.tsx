"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Download, AlertTriangle, CheckCircle2, FileJson } from "lucide-react";
import { AccountDeactivateDialog } from "./AccountDeactivateDialog";
import type { AdminProfile, AdminCustomFieldItem } from "../../domain/entities/AdminProfile";

/** Props for {@link AccountLifecycleCard}. */
export interface AccountLifecycleCardProps {
  /** Administrator profile data included in compliance JSON export. */
  profile: AdminProfile;
  /** Enterprise custom fields included in exported archive. */
  customFields?: AdminCustomFieldItem[];
  /** Whether the operator is the sole primary owner of their organization. */
  isSolePrimaryOwner?: boolean;
  /** Primary organization display name shown in sole-owner guardrail banner. */
  primaryOrgName?: string;
  /** Fetches additional backend account export archive payload. */
  onExportData?: () => Promise<Record<string, unknown>>;
  /** Executes account deactivation once confirmed with 6-digit step-up sudo code. */
  onDeactivateAccount?: (sudoCode: string) => Promise<unknown>;
}

/**
 * Compliance card providing GDPR/SOC2 JSON account archive export and
 * guardrailed account deactivation workflow.
 */
export function AccountLifecycleCard({
  profile,
  customFields = [],
  isSolePrimaryOwner = true,
  primaryOrgName = "",
  onExportData,
  onDeactivateAccount,
}: AccountLifecycleCardProps) {
  const { t } = useI18n();
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done">("idle");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [sudoCode, setSudoCode] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const handleExportData = async () => {
    setExportStatus("exporting");
    try {
      const apiArchive = onExportData ? await onExportData().catch(() => null) : null;
      const payload = {
        schemaVersion: "5.0",
        exportedAtUtc: new Date().toISOString(),
        ...(apiArchive ?? {}),
        accountProfile: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          role: profile.adminTypeName,
          bio: profile.bio,
          clubAffiliation: profile.clubAffiliation,
          activeBranchName: profile.activeBranchName,
        },
        enterpriseProfileFields: customFields.map((f) => ({
          key: f.key,
          label: f.labelEn,
          required: f.isRequired,
          value: f.currentValue,
        })),
        exportScopesIncluded: [
          "Profile & Custom Field Values",
          "Assigned Roles & Module Capabilities",
          "Active Workstation Sessions",
          "Personal Security Audit Trail",
          "Notification & Ergonomics Preferences",
        ],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scripe-account-dossier-${profile.username || "admin"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportStatus("done");
    } catch {
      setExportStatus("done");
    }
  };

  const handleDeactivateOpenChange = (nextOpen: boolean) => {
    setDeactivateOpen(nextOpen);
    if (!nextOpen) {
      setConfirmUsername("");
      setSudoCode("");
      setDeactivateError(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    const trimmedCode = sudoCode.trim();
    if (isSolePrimaryOwner || confirmUsername !== profile.username || trimmedCode.length < 6) {
      return;
    }
    setDeactivateError(null);
    setIsDeactivating(true);
    try {
      await onDeactivateAccount?.(trimmedCode);
      handleDeactivateOpenChange(false);
    } catch (err: unknown) {
      setDeactivateError(
        err instanceof Error && err.message ? err.message : t("profile.common.error")
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <Card
        data-testid="account-lifecycle-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("profile.lifecycle.title")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
              {t("profile.lifecycle.subtitle")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-nx-line text-nx-ink-2 text-[10px] font-mono w-fit">
            {t("profile.lifecycle.complianceBadge")}
          </Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
          <div className="rounded-xl border border-nx-line bg-nx-ground p-4 flex flex-col justify-between gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-nx-ink">
                  {t("profile.lifecycle.exportTitle")}
                </span>
                <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px]">
                  JSON
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-3 leading-relaxed">
                {t("profile.lifecycle.exportDesc")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 min-w-0">
              {exportStatus === "done" ? (
                <span
                  data-testid="export-account-data-success"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                  {t("profile.lifecycle.exportReadyNotice")}
                </span>
              ) : (
                <span className="text-[11px] font-mono text-nx-ink-3">
                  {t("profile.lifecycle.exportIncludesHint")}
                </span>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="export-account-data-btn"
                disabled={exportStatus === "exporting"}
                onClick={handleExportData}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                <span>{t("profile.lifecycle.exportBtn")}</span>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col justify-between gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
                  <span>{t("profile.lifecycle.deactivateTitle")}</span>
                </span>
                <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px]">
                  {t("profile.lifecycle.sudoProtectedBadge")}
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-2 leading-relaxed">
                {t("profile.lifecycle.deactivateDesc")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 min-w-0">
              <span className="text-[11px] text-nx-ink-3">
                {t("profile.lifecycle.soleOwnerGuardrailShort")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="open-deactivate-account-btn"
                onClick={() => setDeactivateOpen(true)}
                className="h-8 text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {t("profile.lifecycle.deactivateBtn")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AccountDeactivateDialog
        open={deactivateOpen}
        onOpenChange={handleDeactivateOpenChange}
        username={profile.username}
        isSolePrimaryOwner={isSolePrimaryOwner}
        primaryOrgName={primaryOrgName}
        confirmUsername={confirmUsername}
        sudoCode={sudoCode}
        isSubmitting={isDeactivating}
        error={deactivateError}
        onConfirmUsernameChange={(val) => {
          setConfirmUsername(val);
          if (deactivateError) setDeactivateError(null);
        }}
        onSudoCodeChange={(val) => {
          setSudoCode(val);
          if (deactivateError) setDeactivateError(null);
        }}
        onConfirmDeactivate={handleConfirmDeactivate}
      />
    </>
  );
}
