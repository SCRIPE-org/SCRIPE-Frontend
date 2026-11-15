"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Download, AlertTriangle, ShieldAlert, CheckCircle2, FileJson } from "lucide-react";
import type { AdminProfile, AdminCustomFieldItem } from "../../domain/entities/AdminProfile";

interface AccountLifecycleCardProps {
  profile: AdminProfile;
  customFields?: AdminCustomFieldItem[];
  isSolePrimaryOwner?: boolean;
  primaryOrgName?: string;
  onExportData?: () => Promise<Record<string, unknown>>;
  onDeactivateAccount?: () => Promise<unknown>;
}

export function AccountLifecycleCard({
  profile,
  customFields = [],
  isSolePrimaryOwner = true,
  primaryOrgName = "Al-Ahly Sporting Club",
  onExportData,
  onDeactivateAccount,
}: AccountLifecycleCardProps) {
  const { t } = useI18n();
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done">("idle");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [sudoCode, setSudoCode] = useState("");

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

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
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

  const handleConfirmDeactivate = async () => {
    if (isSolePrimaryOwner || confirmUsername !== profile.username || sudoCode.length < 6) return;
    try {
      await onDeactivateAccount?.();
    } finally {
      setDeactivateOpen(false);
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
          {/* Left: Export Account Data Archive */}
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

          {/* Right: Deactivate / Delete Account with Sole Owner Guardrail */}
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

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent
          data-testid="deactivate-account-modal"
          className="sm:max-w-lg border border-nx-line bg-nx-surface text-nx-ink"
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" style={{ minWidth: 20, minHeight: 20 }} />
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("profile.lifecycle.modalTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-nx-ink-2 pt-1">
              {t("profile.lifecycle.modalSubtitle")}
            </DialogDescription>
          </DialogHeader>

          {isSolePrimaryOwner && (
            <div
              data-testid="sole-owner-guardrail-banner"
              className="rounded-xl border border-warning/40 bg-warning/10 p-3.5 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
                <span>{t("profile.lifecycle.soleOwnerGuardrailTitle")}</span>
              </div>
              <p className="text-xs text-nx-ink-2 leading-relaxed">
                {t("profile.lifecycle.soleOwnerGuardrailBody", { org: primaryOrgName })}
              </p>
            </div>
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="deactivate-confirm-username" className="text-xs font-semibold text-nx-ink">
                {t("profile.lifecycle.confirmUsernameLabel", { username: profile.username })}
              </Label>
              <Input
                id="deactivate-confirm-username"
                data-testid="deactivate-confirm-username-input"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                placeholder={profile.username}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deactivate-sudo-code" className="text-xs font-semibold text-nx-ink">
                {t("profile.lifecycle.sudoCodeLabel")}
              </Label>
              <Input
                id="deactivate-sudo-code"
                data-testid="deactivate-sudo-code-input"
                value={sudoCode}
                onChange={(e) => setSudoCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeactivateOpen(false)}>
              {t("profile.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              data-testid="confirm-deactivate-account-btn"
              disabled={isSolePrimaryOwner || confirmUsername !== profile.username || sudoCode.length < 6}
              onClick={() => void handleConfirmDeactivate()}
              className="bg-destructive text-nx-on-fill font-semibold"
            >
              {isSolePrimaryOwner
                ? t("profile.lifecycle.transferOwnershipRequiredBtn")
                : t("profile.lifecycle.confirmDeactivateBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
