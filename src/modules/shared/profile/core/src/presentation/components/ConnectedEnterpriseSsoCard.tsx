"use client";

/**
 * ConnectedEnterpriseSsoCard
 *
 * Unified Enterprise Identity Providers (OIDC / SAML 2.0) card inside /account/security.
 * Powered by real backend external login identity bindings (/api/v1/auth/admin/external-logins).
 * Uses SCRIPE's official @core/ui/brand-icons (<BrandIcon>) with brand-tinted containers,
 * showing Connected providers (with real Unlink action) and Available Tenant IdPs (with Connect Account action).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { BrandIcon } from "@core/ui/brand-icons";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import {
  EnterpriseSsoConnectDialog,
  type SsoProviderCatalogItem,
} from "./EnterpriseSsoConnectDialog";
import { Link2, Unlink, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";

const ENTERPRISE_IDP_CATALOG: SsoProviderCatalogItem[] = [
  {
    key: "google",
    slug: "google",
    name: "Google Workspace Enterprise",
    protocol: "OIDC",
    domainHint: "al-ahly.org",
    brandContainerClass: "bg-info/10 border-info/25",
    defaultConnected: false,
    defaultSubjectEmail: "alex.morgan@al-ahly.org",
  },
  {
    key: "microsoft",
    slug: "microsoft",
    name: "Microsoft Entra ID (Azure AD)",
    protocol: "OIDC",
    domainHint: "corp.al-ahly.org",
    brandContainerClass: "bg-primary/10 border-primary/25",
    defaultConnected: false,
    defaultSubjectEmail: "alex.morgan@corp.al-ahly.org",
  },
  {
    key: "okta",
    slug: "okta",
    name: "Okta Workforce Identity",
    protocol: "SAML 2.0",
    domainHint: "sso.al-ahly.org",
    brandContainerClass: "bg-nx-accent-wash border-nx-accent/30",
    defaultConnected: false,
    defaultSubjectEmail: "alex.morgan@sso.al-ahly.org",
  },
  {
    key: "github",
    slug: "github",
    name: "GitHub Enterprise Cloud",
    protocol: "OIDC",
    domainHint: "github.com/scripe-org",
    brandContainerClass: "bg-nx-raised border-nx-line-hi",
    defaultConnected: false,
    defaultSubjectEmail: "alex-morgan@scripe-org",
  },
];

export function ConnectedEnterpriseSsoCard() {
  const { t } = useI18n();
  const {
    externalLogins,
    providers,
    isLoading,
    isUnlinking,
    unlink,
    handleLink,
    linkAccount,
    isLinking,
  } = useExternalLoginsViewModel();

  const [activeConnectProvider, setActiveConnectProvider] =
    useState<SsoProviderCatalogItem | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [confirmingUnlinkId, setConfirmingUnlinkId] = useState<string | null>(null);

  // Match backend ExternalLogin to a catalog item
  const getMatchingLogin = (item: SsoProviderCatalogItem): ExternalLogin | undefined => {
    return externalLogins.find(
      (el) =>
        Boolean(el.providerName && el.providerName.toLowerCase().includes(item.key)) ||
        Boolean(el.providerKey && el.providerKey.toLowerCase().includes(item.key)) ||
        Boolean(
          (el as unknown as { providerDisplayName?: string }).providerDisplayName &&
            (el as unknown as { providerDisplayName?: string }).providerDisplayName
              ?.toLowerCase()
              .includes(item.key)
        )
    );
  };

  // Find active federated provider configuration from tenant IdP list
  const getFederatedProviderId = (item: SsoProviderCatalogItem): string | null => {
    if (!providers || !Array.isArray(providers)) return null;
    const match = providers.find(
      (p: { id?: string; name?: string; providerType?: string }) =>
        Boolean(p.id && p.id.toLowerCase().includes(item.key)) ||
        Boolean(p.name && p.name.toLowerCase().includes(item.key)) ||
        Boolean(p.providerType && p.providerType.toLowerCase().includes(item.key))
    );
    return match ? (match.id ?? null) : null;
  };

  const handleDisconnect = async (loginId: string) => {
    setUnlinkingId(loginId);
    try {
      unlink(loginId);
    } finally {
      setUnlinkingId(null);
    }
  };

  const connectedCount = ENTERPRISE_IDP_CATALOG.filter((p) =>
    Boolean(getMatchingLogin(p))
  ).length;

  return (
    <>
      <Card
        data-testid="connected-enterprise-sso-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("profile.security.ssoSectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
              {t("profile.security.ssoSectionSubtitle")}
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="border-nx-accent/30 text-nx-accent bg-nx-accent-wash text-xs font-semibold w-fit"
          >
            {t("profile.security.ssoConnectedSummary", {
              connected: connectedCount,
              total: ENTERPRISE_IDP_CATALOG.length,
            })}
          </Badge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="p-6 rounded-xl border border-nx-line bg-nx-ground text-center space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-nx-accent mx-auto" />
              <p className="text-xs text-nx-ink-3">{t("profile.common.loading")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ENTERPRISE_IDP_CATALOG.map((item) => {
                const matchingLogin = getMatchingLogin(item);
                const isConnected = Boolean(matchingLogin);
                const federatedId = getFederatedProviderId(item);

                return (
                  <div
                    key={item.key}
                    data-testid={`sso-provider-card-${item.key}`}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 transition-colors ${
                      isConnected
                        ? "border-nx-accent/40 bg-nx-ground"
                        : "border-nx-line bg-nx-ground hover:border-nx-line-hi"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.brandContainerClass}`}
                        >
                          <BrandIcon
                            slug={item.slug}
                            name={item.name}
                            protocol={item.protocol}
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-nx-ink">
                              {item.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-nx-line text-nx-ink-2 font-mono text-[10px] py-0 px-1.5"
                            >
                              {item.protocol}
                            </Badge>
                          </div>

                          {isConnected && matchingLogin ? (
                            <p className="text-xs font-mono text-nx-ink-2 truncate">
                              {matchingLogin.email ||
                                matchingLogin.displayName ||
                                matchingLogin.providerKey}
                            </p>
                          ) : (
                            <p className="text-xs text-nx-ink-3">
                              {t("profile.security.ssoNotConnectedHint", {
                                domain: item.domainHint,
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {isConnected ? (
                        <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                          <span>{t("profile.security.ssoConnectedBadge")}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-nx-line text-nx-ink-3 text-[10px] shrink-0"
                        >
                          {t("profile.security.ssoAvailableBadge")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line">
                      <span className="text-[11px] font-mono text-nx-ink-3">
                        {isConnected
                          ? t("profile.security.ssoVerifiedClaimLabel")
                          : t("profile.security.ssoPreconfiguredByTenant")}
                      </span>

                      {isConnected && matchingLogin ? (
                        confirmingUnlinkId === matchingLogin.id ? (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span className="text-[11px] text-destructive font-medium">
                              {t("profile.security.ssoConfirmDisconnectPrompt")}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              data-testid={`sso-confirm-disconnect-btn-${item.key}`}
                              onClick={async () => {
                                await handleDisconnect(matchingLogin.id);
                                setConfirmingUnlinkId(null);
                              }}
                              disabled={isUnlinking && unlinkingId === matchingLogin.id}
                              className="h-7 px-2 text-[10px] font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              {isUnlinking && unlinkingId === matchingLogin.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                t("profile.security.ssoConfirmDisconnectBtn")
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmingUnlinkId(null)}
                              className="h-7 px-2 text-[10px] text-nx-ink-3 hover:text-nx-ink"
                            >
                              {t("profile.common.cancel")}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid={`sso-disconnect-btn-${item.key}`}
                            onClick={() => setConfirmingUnlinkId(matchingLogin.id)}
                            disabled={isUnlinking && unlinkingId === matchingLogin.id}
                            className="h-8 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                          >
                            {isUnlinking && unlinkingId === matchingLogin.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Unlink className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                            )}
                            <span>{t("profile.security.ssoDisconnectBtn")}</span>
                          </Button>
                        )
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          data-testid={`sso-connect-btn-${item.key}`}
                          onClick={() => setActiveConnectProvider(item)}
                          className="h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
                        >
                          <Link2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                          <span>{t("profile.security.ssoConnectBtn")}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enterprise SSO Connection & Linking Dialog */}
      <EnterpriseSsoConnectDialog
        isOpen={Boolean(activeConnectProvider)}
        onClose={() => setActiveConnectProvider(null)}
        provider={activeConnectProvider}
        onDirectLink={linkAccount}
        onInitiateFederatedLogin={handleLink}
        isLinking={isLinking}
        activeFederatedProviderId={
          activeConnectProvider ? getFederatedProviderId(activeConnectProvider) : null
        }
      />
    </>
  );
}
