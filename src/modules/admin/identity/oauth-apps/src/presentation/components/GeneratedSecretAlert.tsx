"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { KeyRound, Check, Copy } from "lucide-react";

interface GeneratedSecret {
  id?: string;
  clientId: string;
  secret: string;
}

interface GeneratedSecretAlertProps {
  generatedSecret: GeneratedSecret;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  isCreateMode: boolean;
  onClear: (redirectId?: string) => void;
}

/**
 * Presentation UI component rendering the generated secret alert.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function GeneratedSecretAlert({
  generatedSecret,
  copiedField,
  copyToClipboard,
  isCreateMode,
  onClear,
}: GeneratedSecretAlertProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 rounded-nx-lg border border-success/30 bg-success/10 p-4 duration-nx-standard animate-in fade-in">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-success">
          <KeyRound className="h-4 w-4 text-success" aria-hidden="true" />
          {t("oauthApps.newSecretGenerated")}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClear(isCreateMode && generatedSecret ? generatedSecret.id : undefined)}
          className="h-8 text-xs"
        >
          {isCreateMode ? t("common.continue") : t("common.dismiss")}
        </Button>
      </div>
      <p className="text-xs text-success">{t("oauthApps.secretCopyWarning")}</p>
      <div className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-surface p-2">
        <code className="flex-1 break-all font-mono text-sm text-nx-ink">
          {generatedSecret.secret}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={t("oauthApps.copySecret")}
          onClick={() => copyToClipboard(generatedSecret.secret, "secret")}
        >
          {copiedField === "secret" ? (
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
