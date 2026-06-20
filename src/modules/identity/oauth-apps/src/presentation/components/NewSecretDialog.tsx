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

export function NewSecretDialog({
  generatedSecret,
  copiedField,
  copyToClipboard,
  onClose,
}: NewSecretDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={!!generatedSecret} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-border bg-card/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
            <KeyRound className="h-5 w-5 text-purple-500" />
            {t("oauthApps.newSecret") || "New Client Secret"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("oauthApps.secretWarning") || "Copy this secret now. It will NOT be shown again."}
          </DialogDescription>
        </DialogHeader>

        {generatedSecret && (
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("oauthApps.clientId") || "Client ID"}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded border bg-muted/60 p-2 font-mono text-xs text-foreground">
                  {generatedSecret.clientId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 w-9 p-0 border-border/85"
                  onClick={() => copyToClipboard(generatedSecret.clientId, "dialog-clientId")}
                >
                  {copiedField === "dialog-clientId" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("oauthApps.clientSecret") || "Client Secret"}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all rounded border border-purple-500/20 bg-purple-500/5 p-2.5 font-mono text-xs text-purple-700 dark:text-purple-400">
                  {generatedSecret.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 w-9 p-0 border-border/85"
                  onClick={() => copyToClipboard(generatedSecret.secret, "dialog-secret")}
                >
                  {copiedField === "dialog-secret" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
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
