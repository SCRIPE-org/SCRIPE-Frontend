"use client";

/**
 * EnterpriseSsoConnectDialog
 *
 * Enterprise SSO Connection & Identity Linking Dialog.
 * Enables B2B administrators to link their corporate OIDC / SAML 2.0 credentials,
 * initiate live IdP authorization handshakes, or bind verified enterprise identities.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { BrandIcon } from "@core/ui/brand-icons";
import {
  ShieldCheck,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Building2,
  KeyRound,
  Info,
} from "lucide-react";
import type { LinkExternalLoginRequest } from "../../domain/interfaces/IProfileRepository";

export interface SsoProviderCatalogItem {
  key: string;
  slug: string;
  name: string;
  protocol: "OIDC" | "SAML 2.0";
  domainHint: string;
  brandContainerClass: string;
  defaultConnected: boolean;
  defaultSubjectEmail: string;
}

interface EnterpriseSsoConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  provider: SsoProviderCatalogItem | null;
  onDirectLink: (data: LinkExternalLoginRequest) => Promise<unknown>;
  onInitiateFederatedLogin?: (providerId: string, protocol: string) => void;
  isLinking: boolean;
  activeFederatedProviderId?: string | null;
}

export function EnterpriseSsoConnectDialog({
  isOpen,
  onClose,
  provider,
  onDirectLink,
  onInitiateFederatedLogin,
  isLinking,
  activeFederatedProviderId,
}: EnterpriseSsoConnectDialogProps) {
  const { t } = useI18n();
  const [corporateEmail, setCorporateEmail] = useState("");
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!provider) return null;

  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/v1/auth/callback/oidc`
      : "https://scripe.org/api/v1/auth/callback/oidc";

  const handleCopyCallback = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopiedCallback(true);
      setTimeout(() => setCopiedCallback(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleFederatedRedirect = () => {
    if (activeFederatedProviderId && onInitiateFederatedLogin) {
      onInitiateFederatedLogin(activeFederatedProviderId, provider.protocol);
      onClose();
    }
  };

  const handleBindCorporateAccount = async () => {
    const email = corporateEmail.trim() || provider.defaultSubjectEmail;
    setErrorMessage(null);
    try {
      await onDirectLink({
        provider: provider.name,
        providerName: provider.name,
        providerKey: email,
        identityProviderId: activeFederatedProviderId || undefined,
      });
      setCorporateEmail("");
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("profile.security.ssoAccountLinkError");
      setErrorMessage(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] bg-nx-surface border-nx-line p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${provider.brandContainerClass}`}
            >
              <BrandIcon
                slug={provider.slug}
                name={provider.name}
                protocol={provider.protocol}
                className="h-5 w-5"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {provider.name}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="border-nx-line text-nx-ink-2 font-mono text-[10px] py-0 px-1.5"
                >
                  {provider.protocol}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3 mt-0.5">
                {t("profile.security.ssoDialogSubtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Federated IdP Direct Handshake (If configured on tenant) */}
          {activeFederatedProviderId && (
            <div className="p-3.5 rounded-xl border border-nx-accent/30 bg-nx-accent-wash space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-nx-accent" />
                  {t("profile.security.ssoFederationReadyTitle")}
                </span>
                <Badge className="bg-nx-accent-fill text-nx-on-fill text-[9px] font-semibold py-0 px-1.5">
                  {t("profile.security.ssoLiveSsoBadge")}
                </Badge>
              </div>
              <p className="text-[11px] text-nx-ink-2 leading-relaxed">
                {t("profile.security.ssoFederationReadyDesc", { provider: provider.name })}
              </p>
              <Button
                type="button"
                size="sm"
                onClick={handleFederatedRedirect}
                className="w-full text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5 mt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t("profile.security.ssoInitiateHandshakeBtn")}</span>
              </Button>
            </div>
          )}

          {/* Corporate Email Binding Form */}
          <div className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-3">
            <div className="space-y-1">
              <Label htmlFor="corporate-email" className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.security.ssoCorporateEmailLabel")}</span>
              </Label>
              <p className="text-[11px] text-nx-ink-3">
                {t("profile.security.ssoCorporateEmailHint", { domain: provider.domainHint })}
              </p>
              <Input
                id="corporate-email"
                data-testid="sso-dialog-email-input"
                type="email"
                value={corporateEmail}
                onChange={(e) => setCorporateEmail(e.target.value)}
                placeholder={provider.defaultSubjectEmail}
                className="text-xs h-9 bg-nx-surface border-nx-line text-nx-ink font-mono mt-1"
                disabled={isLinking}
              />
            </div>

            {errorMessage && (
              <div
                data-testid="sso-dialog-error-banner"
                className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              data-testid="sso-dialog-bind-btn"
              onClick={handleBindCorporateAccount}
              disabled={isLinking}
              className="w-full text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill mt-2"
            >
              {isLinking ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("profile.security.ssoLinkingProgress")}</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  <span>{t("profile.security.ssoLinkVerifiedIdentityBtn")}</span>
                </>
              )}
            </Button>
          </div>

          {/* Enterprise Callback URI & Tenant Configuration Reference */}
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-nx-ink flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-nx-accent" />
                {t("profile.security.ssoCallbackUriLabel")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-testid="sso-dialog-copy-callback-btn"
                onClick={handleCopyCallback}
                className="h-6 px-2 text-[10px] text-nx-ink-2 hover:text-nx-ink gap-1"
              >
                {copiedCallback ? (
                  <>
                    <Check className="h-3 w-3 text-success" />
                    <span className="text-success">{t("profile.common.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>{t("profile.common.copy")}</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-2 rounded bg-nx-raised border border-nx-line font-mono text-[11px] text-nx-ink-2 break-all select-all">
              {callbackUrl}
            </div>
            <p className="text-[10px] text-nx-ink-3 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" />
              <span>{t("profile.security.ssoCallbackNotice")}</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
            disabled={isLinking}
          >
            {t("profile.common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
