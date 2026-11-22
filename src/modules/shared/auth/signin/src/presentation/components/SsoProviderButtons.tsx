/**
 * SsoProviderButtons — Dynamic SSO provider buttons below the credentials form.
 * Reads provider list from the backend (GET /auth/oidc/providers/admin or /user).
 * Uses Nexus/Vault surface tokens — no hardcoded theme-breaking colors.
 *
 * Smart Adaptive Layout:
 * - 1 provider: full-width (`minmax(0, 1fr)`).
 * - 2 providers: always side-by-side 2-column grid (`repeat(2, minmax(0, 1fr))`) aligning
 *   with the 2x2 methods grid above (`Magic link`/`Passkey`).
 * - 3+ providers: Organization-scoped providers (`scope === "organization"`) render as
 *   full-width hero buttons (`col-span-2`) at the top with `[Org]` badge, followed by
 *   Global providers side-by-side in a 2-column grid underneath (trailing odd global spans `col-span-2`).
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { BrandIcon } from "@core/ui/brand-icons";

interface SsoProviderButtonsProps {
  providers: SsoProvider[];
  isLoading: boolean;
  error: string | null;
  discoveryError?: string | null;
  onRetryProviders?: () => void;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

const SAFE_HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeAccentColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (!SAFE_HEX_COLOR.test(trimmed)) return null;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
}

const LEADING_SIGN_IN_PREFIX =
  /^(?:sign\s+in\s+with|continue\s+with|log\s*in\s+with|sign\s+in\s+via)\s+/i;

function stripSignInPrefix(label: string): { cleanLabel: string; hadPrefix: boolean } {
  const trimmed = label.trim();
  const stripped = trimmed.replace(LEADING_SIGN_IN_PREFIX, "").trim();
  if (stripped && stripped !== trimmed) {
    return { cleanLabel: stripped, hadPrefix: true };
  }
  return { cleanLabel: trimmed, hadPrefix: false };
}

function resolveConciseProviderName(provider: SsoProvider): string {
  const lowerName = provider.name.toLowerCase();
  const lowerSlug = provider.slug.toLowerCase();

  if (lowerName.includes("google") || lowerSlug.includes("google")) return "Google";
  if (
    lowerName.includes("microsoft") ||
    lowerName.includes("entra") ||
    lowerName.includes("azure") ||
    lowerSlug.includes("microsoft") ||
    lowerSlug.includes("entra") ||
    lowerSlug.includes("azure")
  ) {
    return "Microsoft";
  }
  if (lowerName.includes("apple") || lowerSlug.includes("apple")) return "Apple";
  if (lowerName.includes("github") || lowerSlug.includes("github")) return "GitHub";
  if (lowerName.includes("facebook") || lowerSlug.includes("facebook")) return "Facebook";
  return provider.name;
}

function resolveProviderButtonText(
  provider: SsoProvider,
  isCompact: boolean,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (provider.buttonLabel) {
    const { cleanLabel, hadPrefix } = stripSignInPrefix(provider.buttonLabel);
    if (isCompact) {
      return cleanLabel;
    }
    return hadPrefix
      ? t("auth.sso.signInWithProvider", { provider: cleanLabel })
      : cleanLabel;
  }

  const concise = resolveConciseProviderName(provider);
  if (isCompact) {
    return concise;
  }
  return t("auth.sso.signInWithProvider", { provider: concise });
}

const SsoButton = ({
  provider,
  isCompact,
  onProviderClick,
}: {
  provider: SsoProvider;
  isCompact: boolean;
  onProviderClick: (providerId: string, protocol?: string) => void;
}) => {
  const { t } = useI18n();
  const [hover, setHover] = useState(false);
  const resolvedIconUrl = useResolvedFileUrl(provider.iconUrl);
  const accentColor = sanitizeAccentColor(provider.buttonColor);
  const isOrganizationScoped = provider.scope?.toLowerCase() === "organization";
  const label = resolveProviderButtonText(provider, isCompact, t);

  return (
    <Button
      type="button"
      variant="outline"
      className="group relative flex h-11 w-full min-w-0 items-center justify-center gap-2.5 overflow-hidden rounded-[10px] border px-3.5 text-[13px] font-medium shadow-none transition-[border-color,background-color,box-shadow] duration-150"
      style={{
        background: hover
          ? "var(--sx-field-bg-focus, rgba(198,255,0,0.05))"
          : "var(--sx-chip-bg, rgba(255,255,255,.03))",
        borderColor: hover
          ? accentColor || "var(--sx-field-border-focus, rgba(198,255,0,0.55))"
          : "var(--sx-chip-border, rgba(255,255,255,.08))",
        boxShadow:
          hover && accentColor
            ? `0 0 0 1px ${accentColor}30, 0 4px 12px ${accentColor}18`
            : undefined,
        color: "var(--sx-text, hsl(var(--foreground)))",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onProviderClick(provider.id, provider.protocol)}
    >
      <span className="flex shrink-0 items-center justify-center">
        {provider.iconUrl && resolvedIconUrl ? (
          <Image
            src={resolvedIconUrl}
            alt=""
            width={18}
            height={18}
            className="object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <BrandIcon slug={provider.slug} name={provider.name} protocol={provider.protocol} />
        )}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {isOrganizationScoped && (
        <Badge
          variant="outline"
          className="shrink-0 border-nx-accent/40 bg-nx-accent-wash px-1.5 py-0 text-[10px] font-semibold text-nx-accent"
        >
          {t("auth.sso.organizationScope")}
        </Badge>
      )}
    </Button>
  );
};

/**
 * SsoProviderButtons renders dynamic SSO login buttons matching the active tenant or platform
 * identity provider rules, staying strictly contained within the login card width.
 *
 * @param props Props containing the provider list, loading states, error handlers, and click handler.
 */
export function SsoProviderButtons({
  providers,
  isLoading,
  error,
  discoveryError = null,
  onRetryProviders,
  onProviderClick,
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
      {/* ── Divider — "OR CONTINUE WITH" ─────────────── */}
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

      {/* ── SSO initiation error ────────────────────────── */}
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

      {/* ── Discovery error / rate-limit retry notice ───── */}
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

      {/* ── Loading skeletons ───────────────────────────── */}
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

      {/* ── Provider buttons — smart adaptive grid ─────── */}
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
              <SsoButton provider={provider} isCompact={false} onProviderClick={onProviderClick} />
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
                <SsoButton
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
