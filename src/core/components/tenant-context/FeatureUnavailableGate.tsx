"use client";

import React from "react";
import { ArrowLeft, ArrowUpCircle, Home, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useGateActions } from "./useGateActions";

export interface FeatureUnavailableGateProps {
  featureKey?: string | null;
}

/**
 * Full-page gate rendered when a route's required edition feature is disabled
 * for the active tenant. Upgrade CTA appears only when the caller holds the
 * corresponding edition/subscription permission.
 */
export function FeatureUnavailableGate({
  featureKey,
}: FeatureUnavailableGateProps): React.ReactElement {
  const { t, direction } = useI18n();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { isTenant } = useAdminContext();
  const { goToHub, goBack, navigateTo } = useGateActions();

  const canCompareEditions = hasPermission(SYSTEM_PERMISSIONS.EDITIONS_VIEW);
  const canManageTenantPlan = hasAnyPermission([
    SYSTEM_PERMISSIONS.SUBSCRIPTIONS_ASSIGN,
    SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
    SYSTEM_PERMISSIONS.BILLING_MANAGE,
  ]);

  const upgradeHref = canCompareEditions
    ? "/entitlements/editions/compare"
    : canManageTenantPlan && isTenant
      ? "/my-subscription"
      : null;

  return (
    <div
      dir={direction}
      data-testid="feature-unavailable-gate"
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-nx-ground px-4 py-10 text-nx-ink"
    >
      <Card className="w-full max-w-xl border border-nx-line bg-nx-surface hover:border-nx-line-hi">
        <CardHeader className="space-y-3">
          <Badge variant="warning" className="w-fit">
            <span>{t("contextGates.featureUnavailable.badge")}</span>
          </Badge>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-warning-strong/30 bg-warning/15 text-nx-warning-strong">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg text-nx-ink">
                {t("contextGates.featureUnavailable.title")}
              </CardTitle>
              <CardDescription className="leading-relaxed text-nx-ink-2">
                {t("contextGates.featureUnavailable.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {featureKey && (
          <CardContent>
            <div className="flex items-center justify-between gap-2 rounded-nx-md border border-nx-line bg-nx-raised px-3.5 py-2.5 text-xs">
              <span className="font-medium text-nx-ink-3">
                {t("contextGates.featureUnavailable.featureLabel")}
              </span>
              <code className="rounded-nx-sm bg-nx-surface px-2 py-0.5 font-mono text-nx-ink">
                {featureKey}
              </code>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-wrap items-center gap-2 border-t border-nx-line pt-4">
          {upgradeHref && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => navigateTo(upgradeHref)}
              data-testid="feature-gate-upgrade"
            >
              <ArrowUpCircle className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("contextGates.featureUnavailable.upgradeAction")}</span>
            </Button>
          )}
          <Button
            type="button"
            variant={upgradeHref ? "outline" : "default"}
            size="sm"
            onClick={goToHub}
            data-testid="gate-go-hub"
          >
            <Home className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.common.returnToHub")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
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
