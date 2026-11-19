"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { toast } from "@core/ui/sileo-toast";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import { SectionInfoPopover } from "./SectionInfoPopover";
import { EnterpriseSsoProviderTile } from "./EnterpriseSsoProviderTile";
import { OrphanedExternalLoginTile } from "./OrphanedExternalLoginTile";
import { EnterpriseSsoConnectDialog } from "./EnterpriseSsoConnectDialog";
import type { AvailableSsoProvider } from "../../domain/entities/SovereignAccountEntities";
import { resolveSsoCallbackError } from "../utils/enterprise-sso.utils";
import { AlertCircle, CheckCircle2, KeyRound, Link2, Settings2 } from "lucide-react";

/**
 * Connected Enterprise SSO Identity Providers card for `/account/security`.
 * Renders exclusively live database-backed `availableSsoProviders` plus any orphaned
 * legacy bindings, initiating Sudo-gated federated redirects via `initiate-link`.
 */
export function ConnectedEnterpriseSsoCard() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const canConfigureProviders = usePermission(SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_VIEW);

  const {
    availableSsoProviders,
    orphanedExternalLogins,
    isLoading,
    isSudoActive,
    isUnlinking,
    unlinkAsync,
    initiateFederatedLink,
    isInitiatingLink,
    linkErrorMessage,
    resetLinkError,
    invalidateSsoQueries,
  } = useExternalLoginsViewModel();

  const [connectTarget, setConnectTarget] = useState<AvailableSsoProvider | null>(null);
  const [callbackBanner, setCallbackBanner] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const handledCallbackRef = useRef<string | null>(null);

  const ssoLinkedParam = searchParams?.get("ssoLinked");
  const linkedParam = searchParams?.get("linked");
  const errorParam = searchParams?.get("error");

  useEffect(() => {
    const isSuccess = ssoLinkedParam === "success" || linkedParam === "1";
    const hasError = Boolean(errorParam);
    if (!isSuccess && !hasError) return;

    const signature = `${ssoLinkedParam ?? ""}:${linkedParam ?? ""}:${errorParam ?? ""}`;
    if (handledCallbackRef.current === signature) return;
    handledCallbackRef.current = signature;

    if (isSuccess) {
      const msg = t("profile.security.ssoAccountLinkedNotice");
      queueMicrotask(() => setCallbackBanner({ kind: "success", message: msg }));
      toast.success(msg);
    } else if (errorParam) {
      const msg = resolveSsoCallbackError(errorParam, t);
      queueMicrotask(() => setCallbackBanner({ kind: "error", message: msg }));
      toast.error(msg);
    }

    invalidateSsoQueries();

    if (pathname) {
      const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
      nextParams.delete("ssoLinked");
      nextParams.delete("linked");
      nextParams.delete("error");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [
    ssoLinkedParam,
    linkedParam,
    errorParam,
    pathname,
    router,
    searchParams,
    invalidateSsoQueries,
    t,
  ]);

  const linkedCount = availableSsoProviders.filter((p) => p.isLinked).length;

  return (
    <Card
      data-testid="connected-enterprise-sso-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.security.ssoSectionTitle")}
            </CardTitle>
            <SectionInfoPopover i18nPrefix="profile.infoPopover.enterpriseSso" />
          </div>
          <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
            {t("profile.security.ssoSectionSubtitle")}
          </CardDescription>
        </div>

        <Badge
          variant="outline"
          data-testid="sso-connected-summary-badge"
          className="border-nx-line text-nx-ink-2 text-xs font-mono py-0.5 px-2 self-start sm:self-auto"
        >
          {t("profile.security.ssoConnectedSummary", {
            connected: linkedCount,
            total: availableSsoProviders.length,
          })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {callbackBanner && (
          <Alert
            variant={callbackBanner.kind === "error" ? "destructive" : "default"}
            data-testid="sso-callback-status-alert"
            className={
              callbackBanner.kind === "error"
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-success/30 bg-success/10 text-success"
            }
          >
            {callbackBanner.kind === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <AlertDescription className="text-xs">{callbackBanner.message}</AlertDescription>
          </Alert>
        )}

        {isLoading && availableSsoProviders.length === 0 && orphanedExternalLogins.length === 0 ? (
          <div className="space-y-2.5" data-testid="sso-providers-loading">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : availableSsoProviders.length === 0 && orphanedExternalLogins.length === 0 ? (
          <Card
            data-testid="sso-empty-state"
            className="p-6 border border-nx-line bg-nx-raised text-center space-y-2.5"
          >
            <KeyRound className="h-6 w-6 text-nx-accent mx-auto" />
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.security.ssoEmptyTitle")}
            </p>
            <p className="text-[11px] text-nx-ink-3 max-w-md mx-auto">
              {t("profile.security.ssoEmptyDesc")}
            </p>
            {canConfigureProviders && (
              <div className="pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  data-testid="configure-sso-providers-link"
                  className="border-nx-line text-nx-ink hover:border-nx-line-hi text-xs gap-1.5"
                >
                  <Link href="/settings/identity-providers">
                    <Settings2 className="h-3.5 w-3.5 text-nx-accent" />
                    <span>{t("profile.security.ssoConfigureProvidersLink")}</span>
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-2.5">
            {availableSsoProviders.map((provider) => (
              <EnterpriseSsoProviderTile
                key={provider.encryptedId}
                provider={provider}
                isUnlinking={isUnlinking}
                onConnect={(selected) => {
                  resetLinkError();
                  setConnectTarget(selected);
                }}
                onDisconnect={unlinkAsync}
              />
            ))}

            {orphanedExternalLogins.map((login) => (
              <OrphanedExternalLoginTile
                key={login.id}
                login={login}
                isUnlinking={isUnlinking}
                onDisconnect={unlinkAsync}
              />
            ))}
          </div>
        )}
      </CardContent>

      <EnterpriseSsoConnectDialog
        provider={connectTarget}
        open={Boolean(connectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            resetLinkError();
            setConnectTarget(null);
          }
        }}
        isSudoActive={isSudoActive}
        isInitiating={isInitiatingLink}
        errorMessage={linkErrorMessage}
        onConfirmHandshake={(provider) => initiateFederatedLink(provider)}
      />
    </Card>
  );
}
