"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { AvailableSsoProvider } from "../../domain/entities/SovereignAccountEntities";
import {
  formatProtocolLabel,
  isGlobalSsoScope,
} from "../utils/enterprise-sso.utils";
import { SsoProviderBrandMark } from "./EnterpriseSsoProviderTile";
import { AlertCircle, ExternalLink, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

/**
 * Props for {@link EnterpriseSsoConnectDialog}.
 */
export interface EnterpriseSsoConnectDialogProps {
  /** Selected live DB identity provider to initiate federated linking against. */
  provider: AvailableSsoProvider | null;
  /** Controlled open state of the dialog. */
  open: boolean;
  /** Callback invoked when the dialog open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Whether the caller already holds an active Sudo elevation session. */
  isSudoActive: boolean;
  /** Whether the federated link initiation request is in flight. */
  isInitiating: boolean;
  /** Localized error returned by Sudo or initiate-link, if any. */
  errorMessage: string | null;
  /** Initiates the Sudo-gated federated link handshake and browser redirect. */
  onConfirmHandshake: (provider: AvailableSsoProvider) => Promise<unknown>;
}

/**
 * Sudo-gated federated identity handshake dialog for connecting a live DB-configured
 * Enterprise SSO provider via `POST /api/v1/auth/admin/external-logins/initiate-link`.
 */
export function EnterpriseSsoConnectDialog({
  provider,
  open,
  onOpenChange,
  isSudoActive,
  isInitiating,
  errorMessage,
  onConfirmHandshake,
}: EnterpriseSsoConnectDialogProps) {
  const { t } = useI18n();

  if (!provider) return null;

  const protocolLabel = formatProtocolLabel(provider.protocol);
  const scopeLabel = isGlobalSsoScope(provider.scope)
    ? t("profile.security.ssoScopeGlobal")
    : t("profile.security.ssoScopeOrganization");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="enterprise-sso-connect-dialog"
        className="sm:max-w-md border border-nx-line bg-nx-surface text-nx-ink"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-nx-ink flex items-center gap-2.5">
            <SsoProviderBrandMark provider={provider} />
            <span className="truncate">{provider.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("profile.security.ssoDialogFederatedDesc", {
              provider: provider.name,
              protocol: protocolLabel,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-nx-line bg-nx-raised text-nx-ink-2 text-[10px] font-mono"
            >
              {protocolLabel}
            </Badge>
            <Badge
              variant="outline"
              className="border-nx-line bg-nx-raised text-nx-ink-2 text-[10px]"
            >
              {scopeLabel}
            </Badge>
            <Badge className="bg-info/15 text-info border border-info/30 text-[10px] font-semibold">
              {t("profile.security.ssoLiveSsoBadge")}
            </Badge>
          </div>

          <Alert className="border-nx-line bg-nx-raised text-nx-ink">
            {isSudoActive ? (
              <ShieldCheck className="h-4 w-4 text-success" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-warning" />
            )}
            <AlertDescription className="text-xs text-nx-ink-2 leading-relaxed">
              {isSudoActive
                ? t("profile.security.ssoSudoActiveNotice")
                : t("profile.security.ssoSudoRequiredNotice")}
            </AlertDescription>
          </Alert>

          {errorMessage && (
            <Alert
              variant="destructive"
              data-testid="sso-connect-error-alert"
              className="border-destructive/40 bg-destructive/10 text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isInitiating}
              onClick={() => onOpenChange(false)}
              className="border-nx-line text-nx-ink-2 hover:text-nx-ink text-xs"
            >
              {t("profile.common.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isInitiating}
              data-testid="initiate-sso-handshake-btn"
              onClick={() => void onConfirmHandshake(provider)}
              className="bg-nx-accent-fill text-nx-on-fill text-xs font-semibold gap-1.5"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("profile.security.ssoRedirectingProgress")}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t("profile.security.ssoInitiateHandshakeBtn")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
