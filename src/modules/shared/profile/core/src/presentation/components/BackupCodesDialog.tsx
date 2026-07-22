// UI-EXCEPTION: compact studio layout
"use client";

/**
 * BackupCodesDialog — Modal for displaying regenerated backup codes
 */
import { useState } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { Copy, Download, CheckCircle2, AlertTriangle } from "lucide-react";

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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={codes ? onClose : undefined}
      />
      <div className="relative mx-4 w-full max-w-md space-y-5 rounded-2xl border bg-card p-6 shadow-2xl duration-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            🔐 {t("profile.security.backupCodes.title")}
          </h3>
          {codes && (
            <button
              onClick={onClose}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {!codes ? (
          <>
            <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{t("profile.security.backupCodes.warning")}</span>
            </div>

            <div className="space-y-2">
              <Label>{t("profile.security.twoFactorCode")}</Label>
              <Input
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder={t("profile.security.twoFactorCodePlaceholder") || "Enter 6-digit code"}
                maxLength={6}
                className="font-mono tracking-widest"
              />
            </div>

            {regenerateError && <p className="text-sm text-destructive">{regenerateError}</p>}

            <div className="flex justify-end gap-3">
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
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {codes.map((code, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/40 bg-muted/50 px-3 py-2 text-center font-mono text-sm tracking-wider"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{t("profile.security.backupCodes.saveWarning")}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                {copied ? (
                  <CheckCircle2 className="me-2 h-4 w-4 text-success" />
                ) : (
                  <Copy className="me-2 h-4 w-4" />
                )}
                {copied ? t("common.copied") : t("common.copy")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                <Download className="me-2 h-4 w-4" />
                {t("common.download")}
              </Button>
              <Button size="sm" onClick={onClose} className="flex-1">
                {t("common.done")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
