"use client";

/**
 * ConnectedEnterpriseSsoCard
 *
 * Unified Enterprise Identity Providers (OIDC / SAML 2.0) card inside /account/security.
 * Powered by backend external login identity bindings.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import { useAccountContextSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  EnterpriseSsoConnectDialog,
  type SsoProviderCatalogItem,
} from "./EnterpriseSsoConnectDialog";
import {
  ENTERPRISE_IDP_CATALOG,
  EnterpriseSsoProviderTile,
  findFederatedProviderId,
  matchExternalLogin,
} from "./EnterpriseSsoProviderTile";
import { ShieldCheck, Shield } from "lucide-react";

/**
 * Displays linked and available enterprise SSO providers (OIDC / SAML 2.0)
 * with connect and unlink workflows for the active principal.
 */
export function ConnectedEnterpriseSsoCard() {
  const { t } = useI18n();
  const { principalContext } = useAccountContextSliceViewModel();
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
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

  const handleDisconnect = async (loginId: string) => {
    setUnlinkingId(loginId);
    try {
      unlink(loginId);
    } finally {
      setUnlinkingId(null);
      setConfirmingUnlinkId(null);
    }
  };

  const visibleCatalog = isPlatformAdmin
    ? ENTERPRISE_IDP_CATALOG.filter(
        (item) =>
          Boolean(findFederatedProviderId(providers, item)) ||
          Boolean(matchExternalLogin(externalLogins, item))
      )
    : ENTERPRISE_IDP_CATALOG;

  const connectedCount = visibleCatalog.filter((p) =>
    Boolean(matchExternalLogin(externalLogins, p))
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
              total: visibleCatalog.length,
            })}
          </Badge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : isPlatformAdmin && visibleCatalog.length === 0 ? (
            <div className="p-4 rounded-xl border border-nx-line bg-nx-ground flex items-start gap-3">
              <Shield className="h-4 w-4 text-nx-accent shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-nx-ink">
                  {t("profile.security.ssoPlatformPolicyTitle")}
                </p>
                <p className="text-xs text-nx-ink-3">
                  {t("profile.security.ssoPlatformPolicyNotice")}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {visibleCatalog.map((item) => {
                const matchingLogin = matchExternalLogin(externalLogins, item);
                return (
                  <EnterpriseSsoProviderTile
                    key={item.key}
                    item={item}
                    matchingLogin={matchingLogin}
                    isConfirmingUnlink={Boolean(matchingLogin && confirmingUnlinkId === matchingLogin.id)}
                    isUnlinkingThis={Boolean(matchingLogin && isUnlinking && unlinkingId === matchingLogin.id)}
                    onConnect={setActiveConnectProvider}
                    onRequestUnlink={setConfirmingUnlinkId}
                    onCancelUnlink={() => setConfirmingUnlinkId(null)}
                    onConfirmUnlink={handleDisconnect}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EnterpriseSsoConnectDialog
        isOpen={Boolean(activeConnectProvider)}
        onClose={() => setActiveConnectProvider(null)}
        provider={activeConnectProvider}
        onDirectLink={linkAccount}
        onInitiateFederatedLogin={handleLink}
        isLinking={isLinking}
        activeFederatedProviderId={
          activeConnectProvider ? findFederatedProviderId(providers, activeConnectProvider) : null
        }
      />
    </>
  );
}
