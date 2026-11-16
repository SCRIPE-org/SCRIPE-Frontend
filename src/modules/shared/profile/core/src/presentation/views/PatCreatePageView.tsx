"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { FeatureUnavailableGate } from "@core/components/tenant-context";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@core/ui/breadcrumb";
import {
  useAccountContextSliceViewModel,
  useAccountSecuritySliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import { PatCreatePageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import { PatMetadataConfigCard } from "../sections/integrations/PatMetadataConfigCard";
import { PatCidrAllowlistCard, parseCidrEntries } from "../sections/integrations/PatCidrAllowlistCard";
import { PatPermissionStudioCard } from "../sections/integrations/PatPermissionStudioCard";
import { PatSummaryRailCard } from "../sections/integrations/PatSummaryRailCard";
import { PatReviewGenerateModal } from "../sections/integrations/PatReviewGenerateModal";

/**
 * Full-canvas Fine-Grained Personal Access Token Studio (/account/integrations/new).
 * Combines bilingual EN/AR permission discovery, dynamic least-privilege presets,
 * live blast-radius calculation, CIDR network pinning, and a pre-generation review modal.
 */
export function PatCreatePageView() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { principalContext, featureFlags } = useAccountContextSliceViewModel();
  const { security } = useAccountSecuritySliceViewModel();
  const {
    scopeCatalog,
    patQuota,
    integrationsFeatureEnabled,
    isLoadingIntegrations,
    isIntegrationsError,
    integrationsError,
    refetchIntegrations,
    isCreatingToken,
    generateToken,
  } = useIntegrationsFederationViewModel();

  const [tokenName, setTokenName] = useState("");
  const [description, setDescription] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number>(90);
  const [cidrAllowlistRaw, setCidrAllowlistRaw] = useState("");
  const [selectedScopesDraft, setSelectedScopesDraft] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const isIntegrationsDisabled =
    featureFlags?.integrationsEnabled === false ||
    integrationsFeatureEnabled === false ||
    (patQuota != null && !patQuota.isEnabled);

  if (
    isLoadingIntegrations &&
    !isIntegrationsError &&
    scopeCatalog.length === 0 &&
    !isIntegrationsDisabled
  ) {
    return <PatCreatePageSkeleton />;
  }

  if (isIntegrationsDisabled) {
    return <FeatureUnavailableGate featureKey="Integrations.ApiKeys.Enabled" />;
  }

  if (isIntegrationsError && scopeCatalog.length === 0) {
    return (
      <AccountSliceErrorState
        title={t("profile.integrations.createTokenModalTitle")}
        description={t("profile.integrations.createTokenModalDesc")}
        message={integrationsError}
        onRetry={() => void refetchIntegrations?.()}
      />
    );
  }

  const isQuotaReached = Boolean(
    patQuota && !patQuota.isUnlimited && (patQuota.remaining ?? Math.max(0, patQuota.maxLimit - patQuota.activeCount)) <= 0
  );

  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const ownerScopeLabel = isPlatformAdmin
    ? principalContext?.controlPlaneLabel || t("profile.rail.globalControlPlane")
    : principalContext?.activeTenantName || t("profile.integrations.tenantScopeBadge");

  const selectedScopes =
    selectedScopesDraft ?? (scopeCatalog[0]?.code ? [scopeCatalog[0].code] : []);
  const selectedSet = new Set(selectedScopes);
  const selectedOptions = scopeCatalog.filter((opt) => selectedSet.has(opt.code));
  const { entries: parsedCidrs, invalidEntry } = parseCidrEntries(cidrAllowlistRaw);

  const handleOpenReview = () => {
    setFormError(null);
    setNameError(null);
    if (!tokenName.trim()) {
      setNameError(t("profile.integrations.tokenNameRequiredError"));
      setFormError(t("profile.integrations.tokenNameRequiredError"));
      return;
    }
    if (selectedScopes.length === 0) {
      setFormError(t("profile.integrations.tokenScopesRequiredError"));
      return;
    }
    if (invalidEntry) {
      setFormError(t("profile.integrations.invalidCidrError", { cidr: invalidEntry }));
      return;
    }
    setReviewOpen(true);
  };

  const handleConfirmGenerate = async () => {
    setFormError(null);
    try {
      await generateToken({
        name: tokenName.trim(),
        description: description.trim() || null,
        scopes: selectedScopes,
        expiresInDays,
        allowedCidrs: parsedCidrs.length > 0 ? parsedCidrs : undefined,
      });
      setReviewOpen(false);
      startRoutingProgress();
      router.push("/account/integrations");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/account/integrations">{t("profile.integrations.title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("profile.integrations.createPageBreadcrumb")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.integrations.createTokenModalTitle")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.integrations.createTokenModalDesc")}
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono border-nx-line text-nx-ink-2 w-fit">
          {ownerScopeLabel}
        </Badge>
      </div>

      {isQuotaReached ? (
        <div className="rounded-xl border border-warning-strong/35 bg-warning/10 p-5 space-y-3">
          <p className="text-sm font-semibold text-nx-ink">
            {t("profile.integrations.quotaReachedBadge")}
          </p>
          <p className="text-xs text-nx-ink-2">
            {t("profile.integrations.quotaReachedHint", { max: patQuota?.maxLimit ?? 0 })}
          </p>
          <Button type="button" variant="outline" size="sm" asChild className="text-xs">
            <Link href="/account/integrations">{t("profile.integrations.backToIntegrationsBtn")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-5 min-w-0">
            <PatMetadataConfigCard
              t={t}
              language={language}
              tokenName={tokenName}
              description={description}
              expiresInDays={expiresInDays}
              isPlatformAdmin={isPlatformAdmin}
              ownerScopeLabel={ownerScopeLabel}
              nameError={nameError}
              onTokenNameChange={(val) => {
                setTokenName(val);
                if (nameError) setNameError(null);
              }}
              onDescriptionChange={setDescription}
              onExpiresInDaysChange={setExpiresInDays}
            />

            <PatCidrAllowlistCard
              t={t}
              cidrAllowlistRaw={cidrAllowlistRaw}
              currentClientIp={security?.currentClientIp}
              onCidrAllowlistChange={setCidrAllowlistRaw}
            />

            <PatPermissionStudioCard
              t={t}
              language={language}
              scopeCatalog={scopeCatalog}
              selectedScopes={selectedScopes}
              onChangeSelectedScopes={setSelectedScopesDraft}
            />

            {formError && <p className="text-xs text-destructive font-medium">{formError}</p>}
          </div>

          <div className="lg:col-span-4 min-w-0">
            <PatSummaryRailCard
              t={t}
              language={language}
              selectedOptions={selectedOptions}
              expiresInDays={expiresInDays}
              cidrCount={parsedCidrs.length}
              isCreatingToken={isCreatingToken}
              onRemoveScope={(code) =>
                setSelectedScopesDraft(selectedScopes.filter((item) => item !== code))
              }
              onClearAll={() => setSelectedScopesDraft([])}
              onOpenReview={handleOpenReview}
            />
          </div>
        </div>
      )}

      <PatReviewGenerateModal
        t={t}
        language={language}
        open={reviewOpen}
        tokenName={tokenName.trim()}
        description={description}
        ownerScopeLabel={ownerScopeLabel}
        expiresInDays={expiresInDays}
        cidrs={parsedCidrs}
        selectedOptions={selectedOptions}
        isCreatingToken={isCreatingToken}
        submitError={formError}
        onOpenChange={setReviewOpen}
        onConfirmGenerate={() => void handleConfirmGenerate()}
      />
    </div>
  );
}
