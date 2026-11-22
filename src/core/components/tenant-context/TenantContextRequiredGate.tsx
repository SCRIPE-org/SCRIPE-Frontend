"use client";

import React from "react";
import { ArrowLeft, Building2, Home, LogOut, ShieldAlert } from "lucide-react";
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
import { useTenantContextSwitcher } from "@core/hooks/useTenantContextSwitcher";
import { TenantContextSwitcherList } from "./TenantContextSwitcherList";
import { useGateActions } from "./useGateActions";

export interface TenantContextRequiredGateProps {
  routePattern?: string;
  title?: string;
  message?: string;
}

/**
 * Full-page fail-closed shell gate rendered when a tenant-scoped route is
 * opened without an active tenant context.
 *
 * - Eligible users (>= 1 switchable tenant or loading permitted targets) receive
 *   a searchable inline switcher that updates context in place on the current URL.
 * - Users without switch permissions or with zero accessible organizations
 *   receive safe recovery actions (Hub / Back / Sign Out) with zero `/tenants` link.
 */
export function TenantContextRequiredGate({
  routePattern,
  title,
  message,
}: TenantContextRequiredGateProps): React.ReactElement {
  const { t, direction } = useI18n();
  const switcher = useTenantContextSwitcher({ enabled: true });
  const { goToHub, goBack, signOut, isSigningOut } = useGateActions();

  const isEmptyAccessible =
    switcher.canSwitchContext &&
    !switcher.isLoading &&
    !switcher.loadError &&
    !switcher.hasCandidates;

  const canRenderInlineSwitcher =
    switcher.canSwitchContext &&
    (switcher.isLoading || switcher.hasCandidates || Boolean(switcher.loadError));

  const resolvedTitle =
    title ??
    (switcher.canSwitchContext && !isEmptyAccessible
      ? t("contextGates.tenantRequired.title")
      : t("contextGates.tenantRequired.noPermissionTitle"));

  const resolvedDescription =
    message ??
    (isEmptyAccessible
      ? t("contextGates.switcher.emptyDescription")
      : switcher.canSwitchContext
        ? t("contextGates.tenantRequired.description")
        : t("contextGates.tenantRequired.noPermissionDescription"));

  return (
    <div
      dir={direction}
      data-testid="tenant-context-required-gate"
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-nx-ground px-4 py-10 text-nx-ink"
    >
      <Card className="w-full max-w-xl border border-nx-line bg-nx-surface hover:border-nx-line-hi">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="warning">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("contextGates.tenantRequired.badge")}</span>
            </Badge>
            {routePattern && (
              <span className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-0.5 text-xs font-medium text-nx-ink-3 tabular-nums">
                {routePattern}
              </span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-warning-strong/30 bg-warning/15 text-nx-warning-strong">
              {switcher.canSwitchContext ? (
                <Building2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg text-nx-ink">{resolvedTitle}</CardTitle>
              <CardDescription className="leading-relaxed text-nx-ink-2">
                {resolvedDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {canRenderInlineSwitcher ? (
            <TenantContextSwitcherList switcherState={switcher} />
          ) : (
            <div
              data-testid="tenant-required-safe-recovery"
              className="rounded-nx-md border border-nx-line bg-nx-raised p-4 text-sm text-nx-ink-2"
            >
              {switcher.canSwitchContext && !switcher.isLoading
                ? t("contextGates.switcher.emptyDescription")
                : t("contextGates.tenantRequired.noPermissionDescription")}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-nx-line pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="default"
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
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSigningOut}
            onClick={() => void signOut()}
            data-testid="gate-sign-out"
          >
            <LogOut className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.common.signOut")}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
