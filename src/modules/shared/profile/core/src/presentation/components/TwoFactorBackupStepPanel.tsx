"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Check, CheckCircle2, Copy, Download, ShieldAlert } from "lucide-react";

/** Step 3 panel presenting single-use backup codes with copy and download actions. */
export function TwoFactorBackupStep({
  backupCodes,
  copiedBackupCodes,
  onCopyCodes,
  onDownloadCodes,
  onDone,
}: {
  backupCodes: string[];
  copiedBackupCodes: boolean;
  onCopyCodes: () => void;
  onDownloadCodes: () => void;
  onDone: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
          </div>
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("profile.security.twoFactor.setup.backupTitle")}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-nx-ink-3">
          {t("profile.security.twoFactor.setup.backupDescription")}
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
          <p>{t("profile.security.twoFactor.setup.backupWarning")}</p>
        </div>

        <div dir="ltr" className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-nx-raised border border-nx-line">
          {backupCodes.map((code, idx) => (
            <div
              key={idx}
              className="font-mono text-xs font-semibold text-center py-1.5 px-2 rounded bg-nx-surface border border-nx-line text-nx-ink"
            >
              <bdi>{code}</bdi>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyCodes}
            className="flex-1 text-xs gap-1.5"
          >
            {copiedBackupCodes ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>
              {copiedBackupCodes
                ? t("profile.common.copied")
                : t("profile.security.twoFactor.setup.copyCodes")}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownloadCodes}
            className="flex-1 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("profile.security.twoFactor.setup.download")}</span>
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button size="sm" onClick={onDone} className="w-full text-xs font-semibold">
          {t("profile.common.done")}
        </Button>
      </DialogFooter>
    </>
  );
}
