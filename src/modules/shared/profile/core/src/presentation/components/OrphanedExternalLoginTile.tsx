"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";
import { formatLinkedTimestamp } from "../utils/enterprise-sso.utils";
import { KeyRound, Loader2, Unlink } from "lucide-react";

/**
 * Props for {@link OrphanedExternalLoginTile}.
 */
export interface OrphanedExternalLoginTileProps {
  /** Persisted external login record whose parent Identity Provider is deactivated or archived. */
  login: ExternalLogin;
  /** Whether an unlink mutation is currently running. */
  isUnlinking: boolean;
  /** Triggers the Sudo-gated unlink mutation for the orphaned external login ID. */
  onDisconnect: (externalLoginId: string) => Promise<unknown> | void;
}

/**
 * Renders a linked external login whose parent Identity Provider has been deactivated
 * or archived in the database, allowing the administrator to review and unlink it.
 */
export function OrphanedExternalLoginTile({
  login,
  isUnlinking,
  onDisconnect,
}: OrphanedExternalLoginTileProps) {
  const { t, language } = useI18n();
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const linkedTimestamp = formatLinkedTimestamp(login.linkedAt, language);

  return (
    <Card
      data-testid={`orphaned-sso-tile-${login.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-warning/30 bg-nx-raised"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg border border-nx-line bg-nx-surface flex items-center justify-center shrink-0">
          <KeyRound className="h-4 w-4 text-warning" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-nx-ink truncate">
              {login.providerName}
            </span>
            <Badge className="bg-warning/15 text-warning border border-warning/30 text-[10px] font-semibold py-0">
              {t("profile.security.ssoProviderDisabledBadge")}
            </Badge>
          </div>
          <p className="text-[11px] font-mono text-nx-ink truncate" dir="ltr">
            <bdi>{login.email || login.displayName || login.providerKey}</bdi>
          </p>
          <p className="text-[10px] text-nx-ink-3">
            {t("profile.security.ssoProviderDisabledDesc")}
            {linkedTimestamp
              ? ` • ${t("profile.security.ssoLinkedAtLabel", { date: linkedTimestamp })}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {confirmUnlink ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-destructive font-medium">
              {t("profile.security.ssoConfirmDisconnectPrompt")}
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isUnlinking}
              data-testid={`confirm-unlink-orphaned-${login.id}`}
              onClick={async () => {
                try {
                  await onDisconnect(login.id);
                  setConfirmUnlink(false);
                } catch {
                  // Errors & Sudo cancellations handled safely by ViewModel mutation callbacks
                }
              }}
              className="h-7 text-[10px] px-2 font-semibold"
            >
              {isUnlinking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                t("profile.security.ssoConfirmDisconnectBtn")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUnlinking}
              onClick={() => setConfirmUnlink(false)}
              className="h-7 text-[10px] px-2 border-nx-line text-nx-ink-2"
            >
              {t("profile.common.cancel")}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid={`disconnect-orphaned-${login.id}`}
            onClick={() => setConfirmUnlink(true)}
            className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 gap-1"
          >
            <Unlink className="h-3 w-3" />
            <span>{t("profile.security.ssoDisconnectBtn")}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
