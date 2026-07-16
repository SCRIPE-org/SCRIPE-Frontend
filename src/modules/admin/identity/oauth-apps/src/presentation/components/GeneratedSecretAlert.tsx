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
    <div className="space-y-3 rounded-xl border border-green-200 bg-green-50/80 p-4 duration-300 animate-in fade-in dark:border-green-900/50 dark:bg-green-950/20">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-400">
          <KeyRound className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
          {t("oauthApps.newSecretGenerated") || "New Secret Generated"}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClear(isCreateMode && generatedSecret ? generatedSecret.id : undefined)}
          className="h-8 bg-white/50 text-xs hover:bg-white dark:bg-black/20 dark:hover:bg-black/40"
        >
          {isCreateMode
            ? t("common.continue") || "Continue to Application"
            : t("common.dismiss") || "Dismiss"}
        </Button>
      </div>
      <p className="text-xs text-green-700 dark:text-green-400/80">
        {t("oauthApps.secretCopyWarning") || "Copy this secret now — it will not be shown again!"}
      </p>
      <div className="flex items-center gap-2 rounded-lg border bg-white/80 p-2 backdrop-blur-sm dark:bg-black/30">
        <code className="flex-1 break-all font-mono text-sm">{generatedSecret.secret}</code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-muted"
          onClick={() => copyToClipboard(generatedSecret.secret, "secret")}
        >
          {copiedField === "secret" ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
