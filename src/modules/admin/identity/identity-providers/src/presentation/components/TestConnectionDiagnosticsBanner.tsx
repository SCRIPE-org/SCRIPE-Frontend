"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { TestConnectionResult } from "../../domain/entities/IdentityProvider";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

/**
 * Props for {@link TestConnectionDiagnosticsBanner}.
 */
export interface TestConnectionDiagnosticsBannerProps {
  /** Provider display name associated with the diagnostic run, if shown in list context. */
  providerName?: string;
  /** Diagnostic result returned by `POST /api/v1/identity-providers/{id}/test-connection`. */
  result: TestConnectionResult | null;
  /** Optional network/unexpected error message when the probe request itself failed. */
  errorMessage?: string | null;
  /** Dismiss callback to clear the diagnostic panel. */
  onDismiss: () => void;
}

/**
 * Displays rich backend diagnostics for an Identity Provider Test Connection probe,
 * including status verdict, validation message, discovered issuer, and discovered endpoints.
 */
export function TestConnectionDiagnosticsBanner({
  providerName,
  result,
  errorMessage,
  onDismiss,
}: TestConnectionDiagnosticsBannerProps) {
  const { t } = useI18n();

  if (!result && !errorMessage) return null;

  const isSuccess = Boolean(result?.isSuccess && !errorMessage);
  const verdictTitle = isSuccess
    ? t("identityProviders.testSuccess")
    : t("identityProviders.testFailed");
  const detailMessage = errorMessage || result?.message || verdictTitle;
  const discoveredEndpoints = result?.discoveredEndpoints ?? [];

  return (
    <Alert
      variant={isSuccess ? "default" : "destructive"}
      data-testid="test-connection-diagnostics-panel"
      className={
        isSuccess
          ? "border-success/30 bg-success/10 text-nx-ink"
          : "border-destructive/40 bg-destructive/10 text-nx-ink"
      }
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {isSuccess ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div className="space-y-1.5 min-w-0">
            <AlertTitle className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span>{t("identityProviders.testDiagnosticsTitle")}</span>
              <Badge
                variant="outline"
                className={
                  isSuccess
                    ? "border-success/30 bg-success/10 text-success text-[10px]"
                    : "border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                }
              >
                {verdictTitle}
              </Badge>
              {providerName && (
                <span className="font-mono text-[11px] text-nx-ink-2">
                  {t("identityProviders.testDiagnosticsProvider")} {providerName}
                </span>
              )}
            </AlertTitle>

            <AlertDescription className="space-y-2 text-xs text-nx-ink-2">
              <p className="leading-relaxed text-nx-ink">{detailMessage}</p>

              {result?.discoveredIssuer && (
                <p className="font-mono text-[11px] text-nx-ink-2 break-all">
                  <span className="font-sans font-semibold text-nx-ink-3 me-1">
                    {t("identityProviders.discoveredIssuerLabel")}
                  </span>
                  {result.discoveredIssuer}
                </p>
              )}

              {discoveredEndpoints.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-nx-ink-3 block">
                    {t("identityProviders.discoveredEndpointsLabel")}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {discoveredEndpoints.map((ep) => (
                      <Badge
                        key={ep}
                        variant="outline"
                        className="border-nx-line bg-nx-surface font-mono text-[10px] text-nx-ink-2 break-all"
                      >
                        {ep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          data-testid="dismiss-test-diagnostics-btn"
          aria-label={t("identityProviders.dismissDiagnostics")}
          className="h-7 w-7 shrink-0 text-nx-ink-3 hover:text-nx-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </Alert>
  );
}
