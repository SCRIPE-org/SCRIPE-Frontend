"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent } from "@core/ui/card";
import { KeyRound, Check, Copy, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/ui/alert-dialog";

interface ClientCredentialsCardProps {
  clientId: string;
  clientType: string;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

/**
 * Presentation UI component rendering the client credentials card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ClientCredentialsCard({
  clientId,
  clientType,
  copiedField,
  copyToClipboard,
  isRegenerating,
  onRegenerate,
}: ClientCredentialsCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nx-ink-3">
          <KeyRound className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          {t("oauthApps.credentialsSection")}
        </h3>

        {/* Client ID */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("oauthApps.clientIdLabel")}</Label>
          <div className="flex items-center gap-2">
            <Input value={clientId} readOnly className="h-9 bg-nx-raised font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label={t("oauthApps.copyClientId")}
              onClick={() => copyToClipboard(clientId, "clientId")}
            >
              {copiedField === "clientId" ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Client Secret */}
        {clientType === "confidential" && (
          <div className="space-y-2 border-t border-nx-line pt-2">
            <Label className="text-xs">{t("oauthApps.clientSecret")}</Label>
            <p className="text-[11px] font-normal leading-normal text-nx-ink-3">
              {t("oauthApps.clientSecretHidden")}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  loading={isRegenerating}
                  className="mt-1 w-full gap-1.5 text-xs"
                >
                  {!isRegenerating && <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t("oauthApps.regenerateSecret")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("oauthApps.regenerateConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("oauthApps.regenerateConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onRegenerate}>
                    {t("oauthApps.regenerate")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
