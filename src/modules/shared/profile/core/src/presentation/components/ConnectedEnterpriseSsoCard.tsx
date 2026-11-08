"use client";

/**
 * ConnectedEnterpriseSsoCard
 *
 * Unified Enterprise Identity Providers (OIDC / SAML 2.0) card inside /account/security.
 * Uses SCRIPE's official @core/ui/brand-icons (<BrandIcon>) with brand-tinted icon containers,
 * showing Connected providers (with Disconnect button) and Available Tenant IdPs (with Connect Account button).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { BrandIcon } from "@core/ui/brand-icons";
import { useAccountIntegrationsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { Link2, Unlink, CheckCircle2, ShieldCheck } from "lucide-react";

interface SsoProviderCatalogItem {
  key: string;
  slug: string;
  name: string;
  protocol: "OIDC" | "SAML 2.0";
  domainHint: string;
  brandContainerClass: string;
  defaultConnected: boolean;
  defaultSubjectEmail: string;
}

const ENTERPRISE_IDP_CATALOG: SsoProviderCatalogItem[] = [
  {
    key: "google",
    slug: "google",
    name: "Google Workspace Enterprise",
    protocol: "OIDC",
    domainHint: "al-ahly.org",
    brandContainerClass: "bg-info/10 border-info/25",
    defaultConnected: true,
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
  const { integrations, deleteIntegrationItem } =
    useAccountIntegrationsSliceViewModel();

  const [linkedMap, setLinkedMap] = useState<Record<string, boolean>>({
    google: true,
    microsoft: false,
    okta: false,
    github: false,
  });

  const apiProviders = integrations?.identityProviders ?? [];

  const isProviderConnected = (item: SsoProviderCatalogItem): boolean => {
    if (item.key in linkedMap) {
      return linkedMap[item.key];
    }
    const found = apiProviders.find((f) =>
      f.providerName.toLowerCase().includes(item.key)
    );
    return found ? found.isConnected : item.defaultConnected;
  };

  const handleConnect = (item: SsoProviderCatalogItem) => {
    setLinkedMap((prev) => ({ ...prev, [item.key]: true }));
  };

  const handleDisconnect = async (item: SsoProviderCatalogItem) => {
    setLinkedMap((prev) => ({ ...prev, [item.key]: false }));
    const found = apiProviders.find((f) =>
      f.providerName.toLowerCase().includes(item.key)
    );
    if (found) {
      try {
        await deleteIntegrationItem({ kind: "sso", id: found.id });
      } catch {
        // Optimistic state kept
      }
    }
  };

  const connectedCount = ENTERPRISE_IDP_CATALOG.filter((p) =>
    isProviderConnected(p)
  ).length;

  return (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ENTERPRISE_IDP_CATALOG.map((item) => {
            const connected = isProviderConnected(item);
            return (
              <div
                key={item.key}
                data-testid={`sso-provider-card-${item.key}`}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 transition-colors ${
                  connected
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

                      {connected ? (
                        <p className="text-xs font-mono text-nx-ink-2 truncate">
                          {item.defaultSubjectEmail}
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

                  {connected ? (
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
                    {connected
                      ? t("profile.security.ssoVerifiedClaimLabel")
                      : t("profile.security.ssoPreconfiguredByTenant")}
                  </span>

                  {connected ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`sso-disconnect-btn-${item.key}`}
                      onClick={() => void handleDisconnect(item)}
                      className="h-8 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <Unlink className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                      <span>{t("profile.security.ssoDisconnectBtn")}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      data-testid={`sso-connect-btn-${item.key}`}
                      onClick={() => void handleConnect(item)}
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
      </CardContent>
    </Card>
  );
}
