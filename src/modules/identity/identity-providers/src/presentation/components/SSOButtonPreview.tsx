/**
 * SSO Button Preview
 *
 * Renders previews of how the configured Identity Provider button
 * will look on the login page in both light and dark modes side-by-side.
 * Includes three stylistic options:
 * 1. Brand Filled (uses buttonColor)
 * 2. Brand Outlined (uses transparent background with border)
 * 3. Glassmorphic (uses translucent Scripe-style glass backdrop)
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Fingerprint, Monitor } from "lucide-react";

interface Props {
  name: string;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
}

export function SSOButtonPreview({ name, iconUrl, buttonColor, buttonLabel }: Props) {
  const { t } = useI18n();

  const color = buttonColor || "#4F46E5";
  const label = buttonLabel || t("identityProviders.signInWith", { name: name || "SSO" });

  const renderButton = (variant: "filled" | "outlined" | "glass", isDark: boolean) => {
    const icon = iconUrl ? (
      <img
        src={iconUrl}
        alt=""
        className="h-4.5 w-4.5 rounded object-contain shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <Fingerprint className="h-4 w-4 shrink-0" />
    );

    if (variant === "filled") {
      return (
        <Button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-default select-none border-0 pointer-events-none"
          style={{ backgroundColor: color }}
        >
          {icon}
          <span className="truncate">{label}</span>
        </Button>
      );
    }

    if (variant === "outlined") {
      const textColor = isDark ? "text-slate-200" : "text-slate-800";
      return (
        <Button
          type="button"
          className={`inline-flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-semibold border bg-transparent transition-all cursor-default select-none pointer-events-none ${textColor}`}
          style={{ borderColor: `${color}60` }}
        >
          {icon}
          <span className="truncate">{label}</span>
        </Button>
      );
    }

    // Glassmorphic Scripe-style
    if (variant === "glass") {
      const bg = isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10";
      const text = isDark ? "text-slate-100" : "text-slate-900";
      return (
        <Button
          type="button"
          className={`inline-flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-semibold border backdrop-blur-md transition-all cursor-default select-none pointer-events-none ${bg} ${text} hover:border-purple-500/30`}
        >
          {icon}
          <span className="truncate">{label}</span>
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
        <Monitor className="h-4 w-4 text-purple-500" />
        {t("identityProviders.buttonPreview") || "Login Button Preview"}
      </Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light Mode Frame */}
        <div className="rounded-xl border border-border bg-slate-50 p-5 shadow-inner">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-4 text-center">
            {t("identityProviders.lightModeTheme")}
          </span>
          <div className="space-y-3 max-w-[280px] mx-auto">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                {t("identityProviders.brandSolid")}
              </span>
              {renderButton("filled", false)}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                {t("identityProviders.brandOutlined")}
              </span>
              {renderButton("outlined", false)}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                {t("identityProviders.glassmorphic")}
              </span>
              {renderButton("glass", false)}
            </div>
          </div>
        </div>

        {/* Dark Mode Frame */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-4 text-center">
            {t("identityProviders.darkModeTheme")}
          </span>
          <div className="space-y-3 max-w-[280px] mx-auto">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">
                {t("identityProviders.brandSolid")}
              </span>
              {renderButton("filled", true)}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">
                {t("identityProviders.brandOutlined")}
              </span>
              {renderButton("outlined", true)}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">
                {t("identityProviders.glassmorphic")}
              </span>
              {renderButton("glass", true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
