"use client";

import React from "react";
import { AlertTriangle, LogOut, RefreshCw } from "lucide-react";
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
import { useGateActions } from "./useGateActions";

export interface NavigationErrorRecoveryProps {
  error?: string | null;
  onRetry: () => void;
}

/**
 * Fail-closed recovery surface rendered when navigation/route authorization
 * descriptors fail to load from the backend. Never permits unverified pass-through.
 */
export function NavigationErrorRecovery({
  error,
  onRetry,
}: NavigationErrorRecoveryProps): React.ReactElement {
  const { t, direction } = useI18n();
  const { signOut, isSigningOut } = useGateActions();

  return (
    <div
      dir={direction}
      data-testid="navigation-error-recovery"
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-nx-ground px-4 py-10 text-nx-ink"
    >
      <Card className="w-full max-w-lg border border-nx-line bg-nx-surface hover:border-nx-line-hi">
        <CardHeader className="space-y-3">
          <Badge variant="destructive" className="w-fit">
            <span>{t("contextGates.navigationError.badge")}</span>
          </Badge>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-destructive/30 bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg text-nx-ink">
                {t("contextGates.navigationError.title")}
              </CardTitle>
              <CardDescription className="leading-relaxed text-nx-ink-2">
                {t("contextGates.navigationError.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised px-3.5 py-2.5 text-xs text-nx-ink-2">
              <span className="me-1.5 font-semibold text-nx-ink-3">
                {t("contextGates.navigationError.technicalDetails")}:
              </span>
              <span>{error}</span>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-nx-line pt-4">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onRetry}
            data-testid="navigation-error-retry"
          >
            <RefreshCw className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.common.retry")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSigningOut}
            onClick={() => void signOut()}
            data-testid="navigation-error-signout"
          >
            <LogOut className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.common.signOut")}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
