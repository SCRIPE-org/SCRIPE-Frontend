"use client";

import React from "react";
import { ArrowLeft, Globe, Home, LogOut } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useTenantContextSwitcher } from "@core/hooks/useTenantContextSwitcher";
import { useGateActions } from "./useGateActions";

export interface PlatformContextRequiredGateProps {
  routePattern?: string;
}

/**
 * Full-page gate rendered when a user operating inside a tenant drill-down or
 * membership context attempts to open a platform-only route.
 * Allows returning directly to platform context on the current route without any `/tenants` detour.
 */
export function PlatformContextRequiredGate({
  routePattern,
}: PlatformContextRequiredGateProps): React.ReactElement {
  const { t, direction } = useI18n();
  const { activeTenantName } = useAdminContext();
  const { exitToPlatform, isSwitching, isInTenantWorld } = useTenantContextSwitcher({
    enabled: false,
  });
  const { goToHub, goBack } = useGateActions();

  const tenantDisplay = activeTenantName || t("contextGates.platformRequired.fallbackTenant");

  return (
    <div
      dir={direction}
      data-testid="platform-context-required-gate"
      className="flex min-h-screen items-center justify-center bg-nx-ground px-4 py-10 text-nx-ink"
    >
      <Card className="w-full max-w-lg border border-nx-line bg-nx-surface hover:border-nx-line-hi">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="info">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("contextGates.platformRequired.badge")}</span>
            </Badge>
            {routePattern && (
              <span className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-0.5 text-xs font-medium text-nx-ink-3 tabular-nums">
                {routePattern}
              </span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-info/30 bg-info/10 text-info">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg text-nx-ink">
                {t("contextGates.platformRequired.title")}
              </CardTitle>
              <CardDescription className="leading-relaxed text-nx-ink-2">
                {t("contextGates.platformRequired.description", { tenant: tenantDisplay })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="flex flex-wrap items-center gap-2 border-t border-nx-line pt-4">
          {isInTenantWorld && (
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isSwitching}
              onClick={() => exitToPlatform()}
              data-testid="platform-gate-exit"
            >
              <LogOut className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isSwitching
                  ? t("contextGates.platformRequired.returning")
                  : t("contextGates.platformRequired.returnToPlatform")}
              </span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToHub}
            data-testid="gate-go-hub"
          >
            <Home className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.common.returnToHub")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goBack}
            data-testid="gate-go-back"
          >
            <ArrowLeft className="me-1.5 h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <span>{t("contextGates.common.goBack")}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
