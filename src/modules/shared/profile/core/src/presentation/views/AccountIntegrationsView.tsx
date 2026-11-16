"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { FeatureUnavailableGate } from "@core/components/tenant-context";
import { Badge } from "@core/ui/badge";
import {
  useAccountContextSliceViewModel,
  useAccountSecuritySliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  useIntegrationsFederationViewModel,
  type PersonalAccessToken,
} from "../viewmodels/useIntegrationsFederationViewModel";
import { IntegrationsPageSkeleton } from "../components/AccountSkeletons";
import { IntegrationsTelemetryStrip } from "../sections/integrations/IntegrationsTelemetryStrip";
import { PatOneTimeSecretBanner } from "../sections/integrations/PatOneTimeSecretBanner";
import { PatConsoleListSection } from "../sections/integrations/PatConsoleListSection";
import { PatSecretAndConfirmModals } from "../sections/integrations/PatSecretAndConfirmModals";

/**
 * Developer integrations and Personal Access Token (PAT) ledger console (/account/integrations).
 * Displays inline GitHub-style one-time secret banners, telemetry strip, localized scope badges,
 * deep-links to /account/integrations/new and /account/integrations/[id], and Sudo Roll/Revoke modals.
 */
export function AccountIntegrationsView() {
  const { t } = useI18n();
  const router = useRouter();
  const { principalContext, featureFlags } = useAccountContextSliceViewModel();
  const { security } = useAccountSecuritySliceViewModel();
  const {
    personalTokens,
    scopeCatalog,
    availableScopes,
    rateLimitTelemetry,
    patQuota,
    integrationsFeatureEnabled,
    isLoadingIntegrations,
    isRollingToken,
    isRevokingToken,
    pendingSecretReceipt,
    createdTokenSecret,
    clearCreatedTokenSecret,
    rollToken,
    revokeToken,
  } = useIntegrationsFederationViewModel();

  const [pendingRollToken, setPendingRollToken] = useState<PersonalAccessToken | null>(null);
  const [pendingRevokeToken, setPendingRevokeToken] = useState<PersonalAccessToken | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isIntegrationsDisabled =
    featureFlags?.integrationsEnabled === false ||
    integrationsFeatureEnabled === false ||
    (patQuota != null && !patQuota.isEnabled);

  if (
    isLoadingIntegrations &&
    !isIntegrationsDisabled &&
    personalTokens.length === 0 &&
    availableScopes.length === 0
  ) {
    return <IntegrationsPageSkeleton />;
  }

  if (isIntegrationsDisabled) {
    return <FeatureUnavailableGate featureKey="Integrations.ApiKeys.Enabled" />;
  }

  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const cidrEnforcedCount = personalTokens.filter((p) => p.allowedCidrs.length > 0).length;
  const effectiveReceipt =
    pendingSecretReceipt ??
    (createdTokenSecret
      ? {
          tokenId: "",
          tokenName: t("profile.integrations.newTokenDefaultLabel"),
          plainTextSecret: createdTokenSecret,
          fingerprintOrPrefix: createdTokenSecret.slice(0, 14),
          isRotated: false,
        }
      : null);

  const handleConfirmRoll = async () => {
    if (!pendingRollToken) return;
    setActionError(null);
    try {
      await rollToken(pendingRollToken.id, pendingRollToken.name);
      setPendingRollToken(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  const handleConfirmRevoke = async () => {
    if (!pendingRevokeToken) return;
    setActionError(null);
    try {
      await revokeToken(pendingRevokeToken.id);
      setPendingRevokeToken(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.integrations.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.integrations.subtitle")}</p>
        </div>

        <Badge variant="outline" className="text-xs font-mono border-nx-line text-nx-ink-2 w-fit">
          {isPlatformAdmin
            ? t("profile.rail.globalControlPlane")
            : principalContext?.activeTenantName || t("profile.integrations.tenantScopeBadge")}
        </Badge>
      </div>

      <PatOneTimeSecretBanner
        t={t}
        receipt={effectiveReceipt}
        onDismiss={clearCreatedTokenSecret}
      />

      <IntegrationsTelemetryStrip
        t={t}
        rateLimitTelemetry={rateLimitTelemetry}
        patQuota={patQuota}
        activeTokensCount={personalTokens.length}
        cidrEnforcedCount={cidrEnforcedCount}
        trustedCidrsCount={security?.trustedCidrs?.length ?? 0}
        currentClientIp={security?.currentClientIp}
      />

      <PatConsoleListSection
        t={t}
        personalTokens={personalTokens}
        scopeCatalog={scopeCatalog}
        patQuota={patQuota}
        isRollingToken={isRollingToken}
        isRevokingToken={isRevokingToken}
        onOpenCreate={() => router.push("/account/integrations/new")}
        onRequestRoll={(pat) => {
          setActionError(null);
          setPendingRollToken(pat);
        }}
        onRequestRevoke={(pat) => {
          setActionError(null);
          setPendingRevokeToken(pat);
        }}
      />

      <PatSecretAndConfirmModals
        t={t}
        pendingRollToken={pendingRollToken}
        pendingRevokeToken={pendingRevokeToken}
        isRollingToken={isRollingToken}
        isRevokingToken={isRevokingToken}
        actionError={actionError}
        onCloseRoll={() => {
          setPendingRollToken(null);
          setActionError(null);
        }}
        onConfirmRoll={() => void handleConfirmRoll()}
        onCloseRevoke={() => {
          setPendingRevokeToken(null);
          setActionError(null);
        }}
        onConfirmRevoke={() => void handleConfirmRevoke()}
      />
    </div>
  );
}
