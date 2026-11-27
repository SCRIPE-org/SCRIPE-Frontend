/**
 * SsoProviderButtons — Dynamic SSO provider buttons below the credentials form.
 * Reads provider list from the backend (GET /auth/oidc/providers/admin or /user).
 * Uses Nexus/Vault surface tokens — no hardcoded theme-breaking colors.
 */
"use client";

import { RefreshCw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import { SsoProviderButton } from "./SsoProviderButton";

interface SsoProviderButtonsProps {
  providers: SsoProvider[];
  isLoading: boolean;
  error: string | null;
  discoveryError?: string | null;
  onRetryProviders?: () => void;
  onProviderClick: (providerId: string, protocol?: string) => void;
  hideDivider?: boolean;
}

/**
 * SsoProviderButtons renders dynamic SSO login buttons matching the active tenant or platform
 * identity provider rules, staying strictly contained within the login card width.
 */
export function SsoProviderButtons({
  providers,
  isLoading,
  error,
  discoveryError = null,
  onRetryProviders,
  onProviderClick,
  hideDivider = false,
}: SsoProviderButtonsProps) {
  const { t } = useI18n();

  if (!isLoading && providers.length === 0 && !discoveryError && !error) return null;

  const isSingleProvider = providers.length === 1;
  const orgProviders =
    providers.length >= 3
      ? providers.filter((p) => p.scope?.toLowerCase() === "organization")
      : [];
  const globalProviders =
    providers.length >= 3
      ? providers.filter((p) => p.scope?.toLowerCase() !== "organization")
      : providers;

  return (
    <div className="mt-1 w-full min-w-0">
      {!hideDivider && (
        <div className="my-1 flex items-center gap-3" style={{ margin: "4px 0" }}>
          <div
            className="h-px flex-1"
            style={{ background: "var(--sx-divider, hsl(var(--border)))" }}
          />
          <span
            className="shrink-0 text-[11px] font-medium uppercase tracking-[0.15em]"
            style={{
              color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
            }}
          >
            {t("auth.sso.orContinueWith")}
          </span>
          <div
            className="h-px flex-1"
            style={{ background: "var(--sx-divider, hsl(var(--border)))" }}
          />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-3 rounded-xl px-4 py-3"
          style={{
            background: "var(--sx-error-bg, rgba(248,113,113,.10))",
            border: "1px solid var(--sx-error-border, rgba(248,113,113,.30))",
          }}
        >
          <p
            className="text-center text-[13px] font-medium"
            style={{ color: "var(--sx-error-text, hsl(var(--destructive)))" }}
          >
            {error.startsWith("auth.") ? t(error as string) : error}
          </p>
        </div>
      )}

      {!isLoading && discoveryError && providers.length === 0 && (
        <div
          role="alert"
          data-testid="sso-discovery-error"
          className="mt-3 flex items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-xs"
          style={{
            background: "var(--sx-chip-bg, rgba(255,255,255,.03))",
            borderColor: "var(--sx-chip-border, rgba(255,255,255,.08))",
            color: "var(--sx-text-mute, var(--nx-ink-2))",
          }}
        >
          <span className="min-w-0 leading-snug">
            {discoveryError.startsWith("auth.") ? t(discoveryError) : discoveryError}
          </span>
          {onRetryProviders && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetryProviders}
              className="h-7 shrink-0 gap-1.5 rounded-lg px-2.5 text-[11px] font-medium"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              {t("auth.sso.retryProviders")}
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="mt-3 flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-11 w-full animate-pulse rounded-[10px]"
              style={{ background: "var(--sx-chip-bg, hsl(var(--muted)/0.5))" }}
            />
          ))}
        </div>
      )}

      {!isLoading && providers.length > 0 && (
        <div
          data-testid="sso-provider-buttons-grid"
          className="mt-3 grid w-full min-w-0 gap-2"
          style={{
            gridTemplateColumns: isSingleProvider ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
          }}
        >
          {orgProviders.map((provider) => (
            <div
              key={provider.id}
              style={{ gridColumn: "span 2" }}
              className="col-span-2 flex min-w-0"
            >
              <SsoProviderButton
                provider={provider}
                isCompact={false}
                onProviderClick={onProviderClick}
              />
            </div>
          ))}
          {globalProviders.map((provider, index) => {
            const isTrailingOddGlobal =
              providers.length >= 3 &&
              globalProviders.length % 2 !== 0 &&
              index === globalProviders.length - 1;
            const isCompactSlot = !isSingleProvider && !isTrailingOddGlobal;
            return (
              <div
                key={provider.id}
                style={isTrailingOddGlobal ? { gridColumn: "span 2" } : undefined}
                className={isTrailingOddGlobal ? "col-span-2 flex min-w-0" : "flex min-w-0"}
              >
                <SsoProviderButton
                  provider={provider}
                  isCompact={isCompactSlot}
                  onProviderClick={onProviderClick}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
