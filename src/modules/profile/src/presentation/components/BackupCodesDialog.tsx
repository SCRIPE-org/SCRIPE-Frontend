"use client";

/**
 * BackupCodesDialog — Modal for displaying regenerated backup codes
 */
import { useState } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { Loader2, Copy, Download, CheckCircle2, AlertTriangle } from "lucide-react";

interface BackupCodesDialogProps {
      isOpen: boolean;
      codes: string[] | null;
      isRegenerating: boolean;
      regenerateError: string | null;
      onRegenerate: (code: string) => Promise<unknown>;
      onClose: () => void;
}

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
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={codes ? onClose : undefined} />
                  <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-md mx-4 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                    🔐 {t("profile.security.backupCodes.title")}
                              </h3>
                              {codes && (
                                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                                          ✕
                                    </button>
                              )}
                        </div>

                        {!codes ? (
                              <>
                                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                          <span>{t("profile.security.backupCodes.warning")}</span>
                                    </div>

                                    <div className="space-y-2">
                                          <Label>{t("profile.security.twoFactorCode")}</Label>
                                          <Input
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                className="font-mono tracking-widest"
                                          />
                                    </div>

                                    {regenerateError && (
                                          <p className="text-sm text-destructive">{regenerateError}</p>
                                    )}

                                    <div className="flex justify-end gap-3">
                                          <Button variant="outline" onClick={onClose} disabled={isRegenerating}>
                                                {t("common.cancel")}
                                          </Button>
                                          <Button onClick={handleRegenerate} disabled={twoFactorCode.length < 6 || isRegenerating}>
                                                {isRegenerating && <Loader2 className="h-4 w-4 animate-spin me-2" />}
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
                                                      className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-center font-mono text-sm tracking-wider"
                                                >
                                                      {code}
                                                </div>
                                          ))}
                                    </div>

                                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                          <span>{t("profile.security.backupCodes.saveWarning")}</span>
                                    </div>

                                    <div className="flex gap-2">
                                          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                                                {copied ? <CheckCircle2 className="h-4 w-4 me-2 text-emerald-500" /> : <Copy className="h-4 w-4 me-2" />}
                                                {copied ? t("common.copied") : t("common.copy")}
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                                                <Download className="h-4 w-4 me-2" />
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
