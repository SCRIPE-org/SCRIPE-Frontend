/**
 * SSO Button Preview
 *
 * Renders high-fidelity previews of how the configured Identity Provider button
 * will look on the login page in both light and dark modes, showing both the
 * Default and Hover states side-by-side.
 *
 * The light and dark frames must render simultaneously regardless of the
 * workspace's own active theme, so each frame pins the frozen `--sx-*` vault
 * tokens to their theme-specific values via a local custom-property override.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { unresolveFileUrl } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { BrandIcon } from "@core/ui/brand-icons";
import { DARK_THEME, LIGHT_THEME } from "@core/ui/tokens/brand";
import { Monitor } from "lucide-react";
import React from "react";
import Image from "next/image";

interface Props {
  name: string;
  slug?: string;
  protocol?: string;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
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

const LIGHT_SX_VARS = {
  "--sx-card-bg": "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 248, 245, 0.96))",
  "--sx-card-border": "rgba(76, 98, 0, 0.18)",
  "--sx-card-shadow":
    "0 30px 80px rgba(13, 13, 14, 0.12), 0 0 0 1px rgba(76, 98, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  "--sx-text": "#0d0d0e",
  "--sx-text-faint": "rgba(13, 13, 14, 0.42)",
  "--sx-divider": "rgba(76, 98, 0, 0.1)",
  "--sx-field-bg": "rgba(76, 98, 0, 0.04)",
  "--sx-field-bg-focus": "rgba(76, 98, 0, 0.06)",
  "--sx-field-border": "rgba(76, 98, 0, 0.12)",
  "--sx-field-border-focus": "#4c6200",
} as React.CSSProperties;

const DARK_SX_VARS = {
  "--sx-card-bg": "linear-gradient(180deg, rgba(21, 23, 25, 0.86), rgba(13, 13, 14, 0.92))",
  "--sx-card-border": "rgba(198, 255, 0, 0.16)",
  "--sx-card-shadow":
    "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
  "--sx-text": "#f7f8f5",
  "--sx-text-faint": "rgba(247, 248, 245, 0.4)",
  "--sx-divider": "rgba(255, 255, 255, 0.08)",
  "--sx-field-bg": "rgba(255, 255, 255, 0.03)",
  "--sx-field-bg-focus": "rgba(198, 255, 0, 0.05)",
  "--sx-field-border": "rgba(255, 255, 255, 0.08)",
  "--sx-field-border-focus": "rgba(198, 255, 0, 0.55)",
} as React.CSSProperties;

interface ThemePreviewFrameProps {
  mode: "light" | "dark";
  title: string;
  dividerText: string;
  normalLabel: string;
  hoverLabel: string;
  label: string;
  icon: React.ReactNode;
  hoverBorderColor: string;
  hoverBoxShadow?: string;
}

function ThemePreviewFrame({
  mode,
  title,
  dividerText,
  normalLabel,
  hoverLabel,
  label,
  icon,
  hoverBorderColor,
  hoverBoxShadow,
}: ThemePreviewFrameProps) {
  const vars = mode === "light" ? LIGHT_SX_VARS : DARK_SX_VARS;
  const pageBackground = mode === "light" ? LIGHT_THEME.gradientPage : DARK_THEME.gradientPage;

  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center rounded-nx-lg border p-6"
      style={{
        ...vars,
        background: pageBackground,
        borderColor: "var(--sx-card-border)",
      }}
    >
      <div
        className="flex w-full max-w-[340px] flex-col gap-4 rounded-nx-lg border p-6"
        style={{
          background: "var(--sx-card-bg)",
          borderColor: "var(--sx-card-border)",
          boxShadow: "var(--sx-card-shadow)",
        }}
      >
        <span
          className="text-center text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--sx-text-faint)" }}
        >
          {title}
        </span>

        <div className="flex items-center gap-3" style={{ margin: "2px 0" }}>
          <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--sx-text-faint)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {dividerText}
          </span>
          <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span
              className="block text-center text-[9px] font-bold uppercase tracking-wider"
              style={{ color: "var(--sx-text-faint)" }}
            >
              {normalLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none flex h-11 w-full min-w-0 cursor-default select-none items-center justify-center gap-2.5 overflow-hidden rounded-[10px] border px-3.5 text-[13px] font-medium shadow-none"
              style={{
                background: "var(--sx-field-bg)",
                borderColor: "var(--sx-field-border)",
                color: "var(--sx-text)",
              }}
            >
              {icon}
              <span className="min-w-0 truncate">{label}</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <span
              className="block text-center text-[9px] font-bold uppercase tracking-wider"
              style={{ color: "var(--sx-text-faint)" }}
            >
              {hoverLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              tabIndex={-1}
              aria-hidden="true"
              data-testid={`sso-preview-hover-${mode}`}
              className="pointer-events-none flex h-11 w-full min-w-0 cursor-default select-none items-center justify-center gap-2.5 overflow-hidden rounded-[10px] border px-3.5 text-[13px] font-medium shadow-none"
              style={{
                background: "var(--sx-field-bg-focus)",
                borderColor: hoverBorderColor,
                boxShadow: hoverBoxShadow,
                color: "var(--sx-text)",
              }}
            >
              {icon}
              <span className="min-w-0 truncate">{label}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Presentation UI component rendering the SSO button preview.
 * Mirrors live SsoProviderButtons.tsx styling in both light and dark modes without dimming.
 */
export function SSOButtonPreview({
  name,
  slug = "",
  protocol = "oidc",
  iconUrl,
  buttonColor,
  buttonLabel,
}: Props) {
  const { t } = useI18n();
  const resolvedIconUrl = useResolvedFileUrl(unresolveFileUrl(iconUrl));
  const accentColor = sanitizeAccentColor(buttonColor);
  const label = buttonLabel || t("identityProviders.signInWith", { name: name || "SSO" });

  const icon =
    iconUrl && resolvedIconUrl ? (
      <Image
        src={resolvedIconUrl}
        alt=""
        width={18}
        height={18}
        unoptimized
        className="h-[18px] w-[18px] shrink-0 rounded object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <BrandIcon
        slug={slug}
        name={name}
        protocol={protocol}
        className="h-[18px] w-[18px] shrink-0"
      />
    );

  const hoverBorderColor = accentColor || "var(--sx-field-border-focus)";
  const hoverBoxShadow = accentColor
    ? `0 0 0 1px ${accentColor}30, 0 4px 12px ${accentColor}18`
    : undefined;

  return (
    <div className="space-y-5" data-testid="sso-button-preview">
      <Label className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <Monitor className="h-4 w-4 text-nx-accent" aria-hidden="true" />
        {t("identityProviders.buttonPreview")}
      </Label>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ThemePreviewFrame
          mode="light"
          title={t("identityProviders.lightModeTheme")}
          dividerText={t("auth.sso.orContinueWith")}
          normalLabel={t("identityProviders.normal")}
          hoverLabel={t("identityProviders.hover")}
          label={label}
          icon={icon}
          hoverBorderColor={hoverBorderColor}
          hoverBoxShadow={hoverBoxShadow}
        />
        <ThemePreviewFrame
          mode="dark"
          title={t("identityProviders.darkModeTheme")}
          dividerText={t("auth.sso.orContinueWith")}
          normalLabel={t("identityProviders.normal")}
          hoverLabel={t("identityProviders.hover")}
          label={label}
          icon={icon}
          hoverBorderColor={hoverBorderColor}
          hoverBoxShadow={hoverBoxShadow}
        />
      </div>
    </div>
  );
}
