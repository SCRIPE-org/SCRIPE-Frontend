"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { FeatureUnavailableGate } from "@core/components/tenant-context";
import { Card, CardDescription, CardHeader } from "@core/ui/card";
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
import { PatDetailPageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import { PatOneTimeSecretBanner } from "../sections/integrations/PatOneTimeSecretBanner";
import { PatDetailReadonlyPanel } from "../sections/integrations/PatDetailReadonlyPanel";
import { PatQuickStartSnippetsCard } from "../sections/integrations/PatQuickStartSnippetsCard";
import { PatMetadataConfigCard } from "../sections/integrations/PatMetadataConfigCard";
import { PatCidrAllowlistCard, parseCidrEntries } from "../sections/integrations/PatCidrAllowlistCard";
import { PatPermissionStudioCard } from "../sections/integrations/PatPermissionStudioCard";
import { PatSecretAndConfirmModals } from "../sections/integrations/PatSecretAndConfirmModals";
import { Edit3, Loader2, RefreshCw, Trash2 } from "lucide-react";

/** Props for PatDetailPageView. */
export interface PatDetailPageViewProps {
  tokenId: string;
}

/**
 * Dedicated Personal Access Token detail, policy editor, and integration quick-start console
 * (/account/integrations/[id]).
 */
export function PatDetailPageView({ tokenId }: PatDetailPageViewProps) {
  const { t, language } = useI18n();
  const router = useRouter();
  const decodedId = decodeURIComponent(tokenId);
  const { principalContext, featureFlags } = useAccountContextSliceViewModel();
  const { security } = useAccountSecuritySliceViewModel();
  const {
    personalTokens,
    scopeCatalog,
    patQuota,
    integrationsFeatureEnabled,
    isLoadingIntegrations,
    isIntegrationsError,
    integrationsError,
    refetchIntegrations,
    isUpdatingToken,
    isRollingToken,
    isRevokingToken,
    pendingSecretReceipt,
    clearCreatedTokenSecret,
    updateToken,
    rollToken,
    revokeToken,
  } = useIntegrationsFederationViewModel();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDays, setEditDays] = useState(90);
  const [editCidrs, setEditCidrs] = useState("");
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [pendingRollOpen, setPendingRollOpen] = useState(false);
  const [pendingRevokeOpen, setPendingRevokeOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRedirectingAfterRevoke, setIsRedirectingAfterRevoke] = useState(false);

  const isIntegrationsDisabled =
    featureFlags?.integrationsEnabled === false ||
    integrationsFeatureEnabled === false ||
    (patQuota != null && !patQuota.isEnabled);

  const token = personalTokens.find((item) => item.id === decodedId);

  if (
    (isLoadingIntegrations &&
      personalTokens.length === 0 &&
      !isIntegrationsDisabled &&
      !isIntegrationsError) ||
    (isRedirectingAfterRevoke && !token)
  ) {
    return <PatDetailPageSkeleton />;
  }

  if (isIntegrationsDisabled) {
    return <FeatureUnavailableGate featureKey="Integrations.ApiKeys.Enabled" />;
  }

  if (isIntegrationsError && personalTokens.length === 0) {
    return (
      <AccountSliceErrorState
        title={t("profile.integrations.title")}
        description={t("profile.integrations.subtitle")}
        message={integrationsError}
        onRetry={() => void refetchIntegrations?.()}
      />
    );
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-nx-ink">{t("profile.integrations.tokenNotFoundTitle")}</h1>
        <p className="text-xs text-nx-ink-3">{t("profile.integrations.tokenNotFoundDesc")}</p>
        <Button type="button" variant="outline" size="sm" asChild className="text-xs">
          <Link href="/account/integrations">{t("profile.integrations.backToIntegrationsBtn")}</Link>
        </Button>
      </div>
    );
  }

  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const ownerScopeLabel = isPlatformAdmin
    ? principalContext?.controlPlaneLabel || t("profile.rail.globalControlPlane")
    : principalContext?.activeTenantName || t("profile.integrations.tenantScopeBadge");

  const beginEdit = () => {
    const remainingDays = token.expiresAt
      ? Math.min(365, Math.max(1, Math.round((token.expiresAt.getTime() - Date.now()) / 86_400_000)))
      : 90;
    setEditName(token.name);
    setEditDesc(token.description ?? "");
    setEditDays(remainingDays);
    setEditCidrs(token.allowedCidrs.join(", "));
    setEditScopes(token.scopes);
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setEditError(null);
    if (!editName.trim()) return setEditError(t("profile.integrations.tokenNameRequiredError"));
    if (editScopes.length === 0) return setEditError(t("profile.integrations.tokenScopesRequiredError"));
    const { entries, invalidEntry } = parseCidrEntries(editCidrs);
    if (invalidEntry) return setEditError(t("profile.integrations.invalidCidrError", { cidr: invalidEntry }));

    try {
      await updateToken(token.id, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        scopes: editScopes,
        allowedCidrs: entries,
        expiresInDays: editDays,
        rowVersion: token.rowVersion,
      });
      setIsEditing(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  const handleConfirmRoll = async () => {
    setActionError(null);
    try {
      await rollToken(token.id, token.name);
      setPendingRollOpen(false);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("profile.common.error"));
    }
  };

  const handleConfirmRevoke = async () => {
    setActionError(null);
    setIsRedirectingAfterRevoke(true);
    try {
      await revokeToken(token.id);
      setPendingRevokeOpen(false);
      startRoutingProgress();
      router.replace("/account/integrations");
    } catch (e: unknown) {
      setIsRedirectingAfterRevoke(false);
      setActionError(e instanceof Error ? e.message : t("profile.common.error"));
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
            <BreadcrumbPage>{token.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-nx-ink">{token.name}</h1>
            <Badge variant="outline" className="font-mono text-xs border-nx-line">
              <bdi dir="ltr">{token.prefix}...</bdi>
            </Badge>
          </div>
          {token.description && <p className="text-xs text-nx-ink-2">{token.description}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!isEditing && (
            <Button type="button" variant="outline" size="sm" data-testid="edit-pat-policy-btn" onClick={beginEdit} className="h-8 text-xs gap-1.5">
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("profile.integrations.editPolicyBtn")}</span>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" data-testid={`roll-pat-btn-${token.id}`} onClick={() => { setActionError(null); setPendingRollOpen(true); }} disabled={isRollingToken} className="h-8 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("profile.integrations.rollTokenBtn")}</span>
          </Button>
          <Button type="button" variant="outline" size="sm" data-testid={`revoke-pat-btn-${token.id}`} onClick={() => { setActionError(null); setPendingRevokeOpen(true); }} disabled={isRevokingToken} className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("profile.integrations.revokeBtn")}</span>
          </Button>
        </div>
      </div>

      <PatOneTimeSecretBanner
        t={t}
        receipt={pendingSecretReceipt?.tokenId === token.id || !pendingSecretReceipt?.tokenId ? pendingSecretReceipt : null}
        onDismiss={clearCreatedTokenSecret}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-nx-line bg-nx-surface">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.integrations.expiresAt")}</CardDescription>
            <p className="text-sm font-mono font-semibold text-nx-ink">{token.expiresAt ? token.expiresAt.toISOString().slice(0, 10) : "—"}</p>
          </CardHeader>
        </Card>
        <Card className="border border-nx-line bg-nx-surface">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.integrations.lastUsed")}</CardDescription>
            <p className="text-sm font-mono font-semibold text-nx-ink">{token.lastUsedAt ? token.lastUsedAt.toISOString().slice(0, 10) : t("profile.integrations.neverUsed")}</p>
          </CardHeader>
        </Card>
        <Card className="border border-nx-line bg-nx-surface">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.integrations.rateLimitCeilingLabel")}</CardDescription>
            <p className="text-sm font-mono font-semibold text-nx-ink">{token.rateLimitPerMinute != null ? `${token.rateLimitPerMinute} rpm` : "—"}</p>
          </CardHeader>
        </Card>
      </div>

      {isEditing ? (
        <div className="space-y-5">
          <PatMetadataConfigCard t={t} language={language} tokenName={editName} description={editDesc} expiresInDays={editDays} isPlatformAdmin={isPlatformAdmin} ownerScopeLabel={ownerScopeLabel} onTokenNameChange={setEditName} onDescriptionChange={setEditDesc} onExpiresInDaysChange={setEditDays} />
          <PatCidrAllowlistCard t={t} cidrAllowlistRaw={editCidrs} currentClientIp={security?.currentClientIp} onCidrAllowlistChange={setEditCidrs} />
          <PatPermissionStudioCard t={t} language={language} scopeCatalog={scopeCatalog} selectedScopes={editScopes} onChangeSelectedScopes={setEditScopes} />
          {editError && <p className="text-xs text-destructive font-medium">{editError}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isUpdatingToken} className="text-xs">{t("profile.common.cancel")}</Button>
            <Button type="button" size="sm" data-testid="save-pat-policy-btn" onClick={() => void handleSaveEdit()} disabled={isUpdatingToken} className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5">
              {isUpdatingToken && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>{t("profile.common.saveChanges")}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <PatDetailReadonlyPanel t={t} language={language} token={token} fallbackCatalog={scopeCatalog} />
          <PatQuickStartSnippetsCard t={t} tokenPrefix={token.prefix} />
        </div>
      )}

      <PatSecretAndConfirmModals
        t={t}
        pendingRollToken={pendingRollOpen ? token : null}
        pendingRevokeToken={pendingRevokeOpen ? token : null}
        isRollingToken={isRollingToken}
        isRevokingToken={isRevokingToken}
        actionError={actionError}
        onCloseRoll={() => {
          setPendingRollOpen(false);
          setActionError(null);
        }}
        onConfirmRoll={() => void handleConfirmRoll()}
        onCloseRevoke={() => {
          setPendingRevokeOpen(false);
          setActionError(null);
        }}
        onConfirmRevoke={() => void handleConfirmRevoke()}
      />
    </div>
  );
}
