/**
 * SSO Button Preview
 *
 * Renders high-fidelity previews of how the configured Identity Provider button
 * will look on the login page in both light and dark modes, showing both the
 * Default and Hover states side-by-side.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Monitor } from "lucide-react";
import React from "react";
import Image from "next/image";

interface Props {
  name: string;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
}

/** Fallback inline SVGs matching sign-in page design */
const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-[18px] w-[18px] shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px] shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H13z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

const AppleIcon = ({ isDark }: { isDark: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`h-[18px] w-[18px] shrink-0 ${isDark ? "text-[#F5F2FF]" : "text-[#1A0F3D]"}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z" />
  </svg>
);

const DefaultProtocolIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export function SSOButtonPreview({ name, iconUrl, buttonColor, buttonLabel }: Props) {
  const { t } = useI18n();

  const label = buttonLabel || t("identityProviders.signInWith", { name: name || "SSO" });

  const renderIcon = (isDark: boolean) => {
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
      return <GoogleIcon />;
    }
    if (
      lowerName.includes("microsoft") ||
      lowerName.includes("entra") ||
      lowerName.includes("azure")
    ) {
      return <MicrosoftIcon />;
    }
    if (lowerName.includes("apple")) {
      return <AppleIcon isDark={isDark} />;
    }

    return <DefaultProtocolIcon />;
  };

  return (
    <div className="space-y-5">
      <Label className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <Monitor className="h-4 w-4 text-purple-500" />
        {t("identityProviders.buttonPreview") || "Login Button Preview"}
      </Label>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Light Mode Frame Container */}
        <div
          className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border p-6 shadow-inner"
          style={{
            background:
              "radial-gradient(140% 90% at 25% 25%, #FFFFFF 0%, #F1ECFB 45%, #E4DAF6 80%)",
            borderColor: "rgba(124,58,237,.15)",
          }}
        >
          {/* Card Frame simulating the light login glass card */}
          <div
            className="flex w-full max-w-[340px] flex-col gap-4 rounded-2xl border p-6 shadow-xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,248,255,.96))",
              borderColor: "rgba(124,58,237,.18)",
              boxShadow: "0 30px 80px rgba(76,29,149,.12), inset 0 1px 0 rgba(255,255,255,.9)",
            }}
          >
            {/* Theme title indicator */}
            <span
              className="text-center text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "rgba(26,15,61,.42)" }}
            >
              {t("identityProviders.lightModeTheme") || "LIGHT MODE"}
            </span>

            {/* Handoff Continue With Divider */}
            <div className="flex items-center gap-3" style={{ margin: "2px 0" }}>
              <div className="h-px flex-1" style={{ background: "rgba(76,29,149,.10)" }} />
              <span
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "rgba(26,15,61,.42)", fontFamily: "var(--font-mono, monospace)" }}
              >
                {t("auth.sso.orContinueWith") || "OR CONTINUE WITH"}
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(76,29,149,.10)" }} />
            </div>

            {/* Buttons display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Default State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(26,15,61,.42)" }}
                >
                  {t("identityProviders.normal") || "Normal"}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "rgba(124,58,237,.05)",
                    borderColor: "rgba(76,29,149,.10)",
                    color: "#1A0F3D",
                  }}
                >
                  {renderIcon(false)}
                  <span className="truncate">{label}</span>
                </Button>
              </div>

              {/* Hover State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(26,15,61,.42)" }}
                >
                  {t("identityProviders.hover") || "Hover"}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "rgba(124,58,237,.08)",
                    borderColor: "#7C3AED",
                    color: "#1A0F3D",
                  }}
                >
                  {renderIcon(false)}
                  <span className="truncate">{label}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Mode Frame Container */}
        <div
          className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border p-6 shadow-inner"
          style={{
            background:
              "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%)",
            borderColor: "rgba(168,85,247,.15)",
          }}
        >
          {/* Card Frame simulating the dark login glass card */}
          <div
            className="flex w-full max-w-[340px] flex-col gap-4 rounded-2xl border p-6 shadow-xl"
            style={{
              background: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
              borderColor: "rgba(168,85,247,.22)",
              boxShadow: "0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.07)",
            }}
          >
            {/* Theme title indicator */}
            <span
              className="text-center text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "rgba(245,242,255,.40)" }}
            >
              {t("identityProviders.darkModeTheme") || "DARK MODE"}
            </span>

            {/* Handoff Continue With Divider */}
            <div className="flex items-center gap-3" style={{ margin: "2px 0" }}>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,.08)" }} />
              <span
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{
                  color: "rgba(245,242,255,.40)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {t("auth.sso.orContinueWith") || "OR CONTINUE WITH"}
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,.08)" }} />
            </div>

            {/* Buttons display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Default State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(245,242,255,.40)" }}
                >
                  {t("identityProviders.normal") || "Normal"}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "rgba(255,255,255,.03)",
                    borderColor: "rgba(255,255,255,.08)",
                    color: "#F5F2FF",
                  }}
                >
                  {renderIcon(true)}
                  <span className="truncate">{label}</span>
                </Button>
              </div>

              {/* Hover State */}
              <div className="space-y-1.5">
                <span
                  className="block text-center text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(245,242,255,.40)" }}
                >
                  {t("identityProviders.hover") || "Hover"}
                </span>
                <Button
                  type="button"
                  disabled
                  className="pointer-events-none flex w-full cursor-default select-none items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none"
                  style={{
                    height: 44,
                    padding: "11px 14px",
                    background: "rgba(124,58,237,.06)",
                    borderColor: "rgba(168,85,247,.55)",
                    color: "#F5F2FF",
                  }}
                >
                  {renderIcon(true)}
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
