"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { KeyRound, Check, Copy } from "lucide-react";

interface GeneratedSecret {
  id?: string;
  clientId: string;
  secret: string;
}

interface NewSecretDialogProps {
  generatedSecret: GeneratedSecret | null;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  onClose: () => void;
}

/**
 * Presentation UI component rendering the new secret dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function NewSecretDialog({
  generatedSecret,
  copiedField,
  copyToClipboard,
  onClose,
}: NewSecretDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={!!generatedSecret} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {t("oauthApps.newSecret")}
          </DialogTitle>
          <DialogDescription>{t("oauthApps.secretWarning")}</DialogDescription>
        </DialogHeader>

        {generatedSecret && (
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                {t("oauthApps.clientId")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded-nx-sm border border-nx-line bg-nx-raised p-2 font-mono text-xs text-nx-ink">
                  {generatedSecret.clientId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 shrink-0 p-0"
                  aria-label={t("oauthApps.copyClientId")}
                  onClick={() => copyToClipboard(generatedSecret.clientId, "dialog-clientId")}
                >
                  {copiedField === "dialog-clientId" ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                {t("oauthApps.clientSecret")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all rounded-nx-sm border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash p-2.5 font-mono text-xs text-nx-accent">
                  {generatedSecret.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 shrink-0 p-0"
                  aria-label={t("oauthApps.copySecret")}
                  onClick={() => copyToClipboard(generatedSecret.secret, "dialog-secret")}
                >
                  {copiedField === "dialog-secret" ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
