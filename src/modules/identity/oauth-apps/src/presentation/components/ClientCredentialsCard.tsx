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
 * React presentation component representing the client credentials card UI element.
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
    <Card className="border border-border/80 bg-card/45 backdrop-blur-md">
      <CardContent className="space-y-4 p-5">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <KeyRound className="h-4 w-4 text-purple-500" />
          {t("oauthApps.credentialsSection") || "Client Credentials"}
        </h3>

        {/* Client ID */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("oauthApps.clientIdLabel") || "Client ID"}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={clientId}
              readOnly
              className="h-9 border-border/80 bg-muted/30 font-mono text-xs"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 border-border/80 hover:bg-muted"
              onClick={() => copyToClipboard(clientId, "clientId")}
            >
              {copiedField === "clientId" ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Client Secret */}
        {clientType === "confidential" && (
          <div className="space-y-2 border-t border-border/40 pt-2">
            <Label className="text-xs text-muted-foreground">
              {t("oauthApps.clientSecret") || "Client Secret"}
            </Label>
            <p className="text-[11px] font-normal leading-normal text-muted-foreground/80">
              {t("oauthApps.clientSecretHidden") ||
                "The secret is never displayed for security. Regenerate to get a new one."}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  loading={isRegenerating}
                  className="mt-1 w-full gap-1.5 border-border/80 text-xs hover:bg-muted"
                >
                  {!isRegenerating && <RefreshCw className="h-3.5 w-3.5" />}
                  {t("oauthApps.regenerateSecret") || "Regenerate Secret"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("oauthApps.regenerateConfirmTitle") || "Regenerate Client Secret?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("oauthApps.regenerateConfirmDesc") ||
                      "This will invalidate the current secret. All existing integrations using the old secret will stop working immediately. The new secret will be displayed once."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRegenerate}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {t("oauthApps.regenerate") || "Regenerate"}
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
