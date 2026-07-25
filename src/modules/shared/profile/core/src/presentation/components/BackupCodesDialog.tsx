"use client";

/**
 * BackupCodesDialog — Modal for displaying regenerated backup codes
 */
import { useState } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { Copy, Download, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";

interface BackupCodesDialogProps {
  isOpen: boolean;
  codes: string[] | null;
  isRegenerating: boolean;
  regenerateError: string | null;
  onRegenerate: (code: string) => Promise<unknown>;
  onClose: () => void;
}

/**
 * Presentation UI component rendering the backup codes dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BackupCodesDialog({
  isOpen,
  codes,
  isRegenerating,
  regenerateError,
  onRegenerate,
  onClose,
}: BackupCodesDialogProps) {
  const { t } = useI18n();
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRegenerate = async () => {
    await onRegenerate(twoFactorCode);
    setTwoFactorCode("");
  };

  const handleCopy = () => {
    if (codes) {
      navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (codes) {
      const content = `Backup Codes\n${"=".repeat(20)}\n\n${codes.join("\n")}\n\nGenerated: ${new Date().toISOString()}\nKeep these codes safe.`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Mirrors the previous hand-built modal's rule exactly: nothing dismisses
  // this dialog (backdrop, Escape, or the close control) until the codes
  // exist. `isOpen` is fully controlled from the parent, so simply not
  // calling onClose() here keeps the dialog open — Radix never closes a
  // controlled Dialog on its own.
  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (!codes) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            <DialogTitle>{t("profile.security.backupCodes.title")}</DialogTitle>
          </div>
          <DialogDescription>
            {codes
              ? t("profile.security.backupCodes.readyDescription")
              : t("profile.security.backupCodes.enterCodeDescription")}
          </DialogDescription>
        </DialogHeader>

        {!codes ? (
          <>
            <Alert variant="warning">
              <AlertTriangle aria-hidden="true" />
              <AlertDescription>{t("profile.security.backupCodes.warning")}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="backup-codes-2fa-code">{t("profile.security.twoFactorCode")}</Label>
              <Input
                id="backup-codes-2fa-code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder={t("profile.security.twoFactorCodePlaceholder")}
                maxLength={6}
                className="font-mono tracking-widest"
                disabled={isRegenerating}
                autoFocus
              />
            </div>

            {regenerateError && (
              <Alert variant="destructive">
                <AlertTriangle aria-hidden="true" />
                <AlertDescription>{regenerateError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isRegenerating}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleRegenerate}
                loading={isRegenerating}
                disabled={twoFactorCode.length < 6}
              >
                {t("profile.security.backupCodes.regenerate")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {codes.map((code, i) => (
                <div
                  key={i}
                  className="rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-center font-mono text-sm tracking-wider text-nx-ink tabular-nums"
                >
                  {code}
                </div>
              ))}
            </div>

            <Alert variant="warning">
              <AlertTriangle aria-hidden="true" />
              <AlertDescription>{t("profile.security.backupCodes.saveWarning")}</AlertDescription>
            </Alert>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                {copied ? (
                  <CheckCircle2 className="me-2 h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="me-2 h-4 w-4" aria-hidden="true" />
                )}
                {copied ? t("common.copied") : t("common.copy")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                {t("common.download")}
              </Button>
              <Button size="sm" onClick={onClose} className="flex-1">
                {t("common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
