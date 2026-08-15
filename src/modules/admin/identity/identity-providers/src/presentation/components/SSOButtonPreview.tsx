// FILE-EXCEPTION: file length
/**
 * SSO Button Preview
 *
 * Renders high-fidelity previews of how the configured Identity Provider button
 * will look on the login page in both light and dark modes, showing both the
 * Default and Hover states side-by-side.
 *
 * The light and dark frames must render simultaneously regardless of the
 * workspace's own active theme, so each frame pins the frozen `--sx-*` vault
 * tokens to their theme-specific values via a local custom-property override
 * (the tokens themselves are single-valued per document — see globals.css
 * `:root` vs `:root:not(.dark)`). Every value below is copied verbatim from
 * that token definition; nothing here is an invented colour.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { IDP_BRAND_MARKS, ProtocolIcon } from "@core/ui/brand-icons";
import { Monitor } from "lucide-react";
import React from "react";
import Image from "next/image";

interface Props {
  name: string;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
}

// Local overrides of the frozen `--sx-*` vault tokens, one snapshot per theme.
// Values are copied from globals.css `:root` (dark) / `:root:not(.dark)`
// (light) — this file does not choose or invent any of them.
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

/**
 * Presentation UI component rendering the s s o button preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SSOButtonPreview({ name, iconUrl, buttonColor, buttonLabel }: Props) {
  const { t } = useI18n();

  const label = buttonLabel || t("identityProviders.signInWith", { name: name || "SSO" });

  const renderIcon = () => {
    if (iconUrl) {
      return (
        <Image
          src={iconUrl}
          alt=""
          width={18}
          height={18}
          unoptimized
          className="h-[18px] w-[18px] shrink-0 rounded object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }

    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("google")) {
      const GoogleMark = IDP_BRAND_MARKS.google;
      return <GoogleMark className="h-[18px] w-[18px] shrink-0" />;
    }
    if (
      lowerName.includes("microsoft") ||
      lowerName.includes("entra") ||
      lowerName.includes("azure")
    ) {
      const MicrosoftMark = IDP_BRAND_MARKS.microsoft;
      return <MicrosoftMark className="h-[18px] w-[18px] shrink-0" />;
    }
    if (lowerName.includes("apple")) {
      const AppleMark = IDP_BRAND_MARKS.apple;
      return <AppleMark className="h-[18px] w-[18px] shrink-0" />;
    }

    return <ProtocolIcon protocol="oidc" className="h-[18px] w-[18px] shrink-0" />;
  };

  return (
    <div className="space-y-5">
      <Label className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <Monitor className="h-4 w-4 text-nx-accent" aria-hidden="true" />
        {t("identityProviders.buttonPreview")}
      </Label>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Light Mode Frame Container */}
        <div
          className="flex min-h-[200px] flex-col items-center justify-center rounded-nx-lg border p-6"
          style={{
            ...LIGHT_SX_VARS,
            background:
              "radial-gradient(140% 90% at 25% 25%, #ffffff 0%, #f1ecfb 45%, #e4daf6 80%, #d6c8ef 100%)",
            borderColor: "var(--sx-card-border)",
          }}
        >
          {/* Card Frame simulating the light login glass card */}
          <div
            className="flex w-full max-w-[340px] flex-col gap-4 rounded-nx-lg border p-6"
            style={{
              background: "var(--sx-card-bg)",
              borderColor: "var(--sx-card-border)",
              boxShadow: "var(--sx-card-shadow)",
            }}
          >
            {/* Theme title indicator */}
            <span
              className="text-center text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--sx-text-faint)" }}
            >
              {t("identityProviders.lightModeTheme")}
            </span>

            {/* Handoff Continue With Divider */}
            <div className="flex items-center gap-3" style={{ margin: "2px 0" }}>
              <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
              <span
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--sx-text-faint)", fontFamily: "var(--font-mono, monospace)" }}
              >
                {t("auth.sso.orContinueWith")}
              </span>
              <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
            </div>

            {/* Buttons display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Default State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--sx-text-faint)" }}
                >
                  {t("identityProviders.normal")}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-nx-md border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "var(--sx-field-bg)",
                    borderColor: "var(--sx-divider)",
                    color: "var(--sx-text)",
                  }}
                >
                  {renderIcon()}
                  <span className="truncate">{label}</span>
                </Button>
              </div>

              {/* Hover State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--sx-text-faint)" }}
                >
                  {t("identityProviders.hover")}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-nx-md border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "var(--sx-field-bg-focus)",
                    borderColor: "var(--sx-field-border-focus)",
                    color: "var(--sx-text)",
                  }}
                >
                  {renderIcon()}
                  <span className="truncate">{label}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Mode Frame Container */}
        <div
          className="flex min-h-[200px] flex-col items-center justify-center rounded-nx-lg border p-6"
          style={{
            ...DARK_SX_VARS,
            background:
              "radial-gradient(140% 90% at 25% 25%, #1a1140 0%, #0a0820 40%, #06060e 80%, #04040a 100%)",
            borderColor: "var(--sx-card-border)",
          }}
        >
          {/* Card Frame simulating the dark login glass card */}
          <div
            className="flex w-full max-w-[340px] flex-col gap-4 rounded-nx-lg border p-6"
            style={{
              background: "var(--sx-card-bg)",
              borderColor: "var(--sx-card-border)",
              boxShadow: "var(--sx-card-shadow)",
            }}
          >
            {/* Theme title indicator */}
            <span
              className="text-center text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--sx-text-faint)" }}
            >
              {t("identityProviders.darkModeTheme")}
            </span>

            {/* Handoff Continue With Divider */}
            <div className="flex items-center gap-3" style={{ margin: "2px 0" }}>
              <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
              <span
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{
                  color: "var(--sx-text-faint)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {t("auth.sso.orContinueWith")}
              </span>
              <div className="h-px flex-1" style={{ background: "var(--sx-divider)" }} />
            </div>

            {/* Buttons display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Default State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--sx-text-faint)" }}
                >
                  {t("identityProviders.normal")}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-nx-md border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "var(--sx-field-bg)",
                    borderColor: "var(--sx-field-border)",
                    color: "var(--sx-text)",
                  }}
                >
                  {renderIcon()}
                  <span className="truncate">{label}</span>
                </Button>
              </div>

              {/* Hover State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--sx-text-faint)" }}
                >
                  {t("identityProviders.hover")}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-nx-md border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "var(--sx-field-bg-focus)",
                    borderColor: "var(--sx-field-border-focus)",
                    color: "var(--sx-text)",
                  }}
                >
                  {renderIcon()}
                  <span className="truncate">{label}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
