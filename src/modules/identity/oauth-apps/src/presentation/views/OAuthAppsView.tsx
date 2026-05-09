/**
 * OAuth Applications List View
 *
 * Management page for third-party OAuth applications (OIDC Server).
 * Uses GenericCrudView for CRUD + custom client-type/scopes columns.
 */
"use client";

import { useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { useOAuthAppsViewModel } from "../viewmodels/useOAuthAppsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { KeyRound, Check, Copy } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function OAuthAppsView() {
  useModuleLocales(() => import("../../../locales"), "oauth-apps");

  const { t } = useI18n();
  const { vm, config, generatedSecret, clearGeneratedSecret } = useOAuthAppsViewModel();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />

      {/* Secret Display Dialog — one-time show after regeneration */}
      <Dialog open={!!generatedSecret} onOpenChange={() => clearGeneratedSecret()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              {t("oauthApps.newSecret") || "New Client Secret"}
            </DialogTitle>
            <DialogDescription>
              {t("oauthApps.secretWarning") || "Copy this secret now. It will NOT be shown again."}
            </DialogDescription>
          </DialogHeader>

          {generatedSecret && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t("oauthApps.clientId") || "Client ID"}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 truncate rounded border bg-muted/50 p-2 font-mono text-sm">
                    {generatedSecret.clientId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
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
                <label className="text-xs font-medium text-muted-foreground">
                  {t("oauthApps.clientSecret") || "Client Secret"}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all rounded border border-amber-200 bg-amber-50 p-2 font-mono text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                    {generatedSecret.secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
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
    </>
  );
}
