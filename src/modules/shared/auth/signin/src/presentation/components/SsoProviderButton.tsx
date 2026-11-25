"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { BrandIcon } from "@core/ui/brand-icons";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";

const SAFE_HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const LEADING_SIGN_IN_PREFIX =
  /^(?:sign\s+in\s+with|continue\s+with|log\s*in\s+with|sign\s+in\s+via)\s+/i;

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
    if (isCompact) return cleanLabel;
    return hadPrefix ? t("auth.sso.signInWithProvider", { provider: cleanLabel }) : cleanLabel;
  }

  const concise = resolveConciseProviderName(provider);
  if (isCompact) return concise;
  return t("auth.sso.signInWithProvider", { provider: concise });
}

interface SsoProviderButtonProps {
  provider: SsoProvider;
  isCompact: boolean;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

/**
 * Single themed OIDC/SAML SSO button card rendered inside `SsoProviderButtons`.
 */
export function SsoProviderButton({
  provider,
  isCompact,
  onProviderClick,
}: SsoProviderButtonProps) {
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
}
