// FILE-EXCEPTION: file length
/**
 * AdvancedPanel — Custom CSS, safe mode (core Switch), accessibility, RTL.
 * All labels localized via t()
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import {
  Code,
  Shield,
  Languages,
  Accessibility,
  Palette,
  Image as ImageIcon,
  Ruler,
  Type,
  Square,
  Tag,
  Info,
} from "lucide-react";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import type { StudioDraftProps as StudioDraft } from "../../domain/entities/StudioDraft";
import { useI18n } from "@core/providers/i18n-provider";

interface AdvancedPanelProps {
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
}

/**
 * Presentation UI component rendering the advanced panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AdvancedPanel({ draft, updateDraft }: AdvancedPanelProps) {
  const { t } = useI18n();

  // The CSS syntax, selectors and hex literals below are literal example text the
  // admin is meant to overwrite — only the explanatory comment headers are localized.
  const customCssPlaceholder = `/* ═══ ${t("studio.advanced.placeholderExamplesTitle")} ═══ */

/* ${t("studio.advanced.placeholderGradientBtn")} */
.login-button, button[type="submit"] {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(102,126,234,0.4);
  transition: all 0.3s ease;
}
.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102,126,234,0.6);
}

/* ${t("studio.advanced.placeholderGlassCard")} */
.login-form {
  backdrop-filter: blur(16px);
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 24px;
}

/* ${t("studio.advanced.placeholderNeonFocus")} */
.login-input:focus {
  border-color: #00f0ff !important;
  box-shadow: 0 0 10px rgba(0,240,255,0.3),
              0 0 40px rgba(0,240,255,0.1) !important;
}

/* ${t("studio.advanced.placeholderAnimatedBg")} */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.login-page {
  background: linear-gradient(-45deg,
    #ee7752, #e73c7e, #23a6d5, #23d5ab) !important;
  background-size: 400% 400% !important;
  animation: gradientShift 8s ease infinite;
}

/* ${t("studio.advanced.placeholderDarkOverrides")} */
.dark .login-input {
  background: rgba(255,255,255,0.05) !important;
}`;

  return (
    <div className="space-y-5">
      {/* Custom CSS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Code className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
          <label className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("studio.advanced.customCss")}
          </label>
        </div>
        <p className="text-[10px] text-nx-ink-3">{t("studio.advanced.customCssDesc")}</p>
        <Textarea
          value={draft.customCss}
          onChange={(e) => updateDraft("customCss", e.target.value)}
          placeholder={customCssPlaceholder}
          rows={10}
          className="resize-y bg-nx-ground font-mono text-xs"
          spellCheck={false}
        />

        {/* CSS Variable Reference */}
        <details className="rounded-nx-md border border-nx-line bg-nx-raised">
          <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none">
            <Code className="h-3 w-3 shrink-0" aria-hidden="true" />
            {t("studio.advanced.cssVarRef")}
          </summary>
          <div className="space-y-2 px-3 pb-3">
            <CssVarGroup
              icon={Palette}
              title={t("studio.advanced.cssVarGroupColors")}
              vars={[
                ["--login-primary", t("studio.advanced.cssVars.loginPrimary")],
                ["--login-secondary", t("studio.advanced.cssVars.loginSecondary")],
                ["--login-bg", t("studio.advanced.cssVars.loginBg")],
                ["--login-surface", t("studio.advanced.cssVars.loginSurface")],
                ["--login-text", t("studio.advanced.cssVars.loginText")],
                ["--login-text-muted", t("studio.advanced.cssVars.loginTextMuted")],
                ["--login-border", t("studio.advanced.cssVars.loginBorder")],
                ["--login-error", t("studio.advanced.cssVars.loginError")],
                ["--login-success", t("studio.advanced.cssVars.loginSuccess")],
              ]}
            />
            <CssVarGroup
              icon={ImageIcon}
              title={t("studio.advanced.cssVarGroupBackground")}
              vars={[
                ["--login-bg-image", t("studio.advanced.cssVars.loginBgImage")],
                ["--login-bg-gradient", t("studio.advanced.cssVars.loginBgGradient")],
                ["--login-overlay-opacity", t("studio.advanced.cssVars.loginOverlayOpacity")],
                ["--login-overlay-color", t("studio.advanced.cssVars.loginOverlayColor")],
                ["--login-overlay-blur", t("studio.advanced.cssVars.loginOverlayBlur")],
              ]}
            />
            <CssVarGroup
              icon={Ruler}
              title={t("studio.advanced.cssVarGroupLayout")}
              vars={[
                ["--login-panel-bg", t("studio.advanced.cssVars.loginPanelBg")],
                ["--login-panel-bg-image", t("studio.advanced.cssVars.loginPanelBgImage")],
                ["--login-form-width", t("studio.advanced.cssVars.loginFormWidth")],
                ["--login-card-padding", t("studio.advanced.cssVars.loginCardPadding")],
                ["--login-element-gap", t("studio.advanced.cssVars.loginElementGap")],
                ["--login-input-height", t("studio.advanced.cssVars.loginInputHeight")],
              ]}
            />
            <CssVarGroup
              icon={Type}
              title={t("studio.advanced.cssVarGroupTypography")}
              vars={[
                ["--login-font-heading", t("studio.advanced.cssVars.loginFontHeading")],
                ["--login-font-body", t("studio.advanced.cssVars.loginFontBody")],
                ["--login-font-body-ar", t("studio.advanced.cssVars.loginFontBodyAr")],
                ["--login-size-headline", t("studio.advanced.cssVars.loginSizeHeadline")],
                ["--login-size-subtitle", t("studio.advanced.cssVars.loginSizeSubtitle")],
                ["--login-weight-heading", t("studio.advanced.cssVars.loginWeightHeading")],
                ["--login-weight-body", t("studio.advanced.cssVars.loginWeightBody")],
              ]}
            />
            <CssVarGroup
              icon={Square}
              title={t("studio.advanced.cssVarGroupShape")}
              vars={[
                ["--login-radius-card", t("studio.advanced.cssVars.loginRadiusCard")],
                ["--login-radius-button", t("studio.advanced.cssVars.loginRadiusButton")],
                ["--login-shadow-card", t("studio.advanced.cssVars.loginShadowCard")],
              ]}
            />
            <div className="space-y-1 pt-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-nx-ink">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {t("studio.advanced.cssClassHooksTitle")}
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
                {[
                  [".login-page", t("studio.advanced.cssClasses.loginPage")],
                  [".login-form-wrapper", t("studio.advanced.cssClasses.loginFormWrapper")],
                  [".login-form", t("studio.advanced.cssClasses.loginForm")],
                  [".login-input", t("studio.advanced.cssClasses.loginInput")],
                  [".login-button", t("studio.advanced.cssClasses.loginButton")],
                  [".login-card", t("studio.advanced.cssClasses.loginCard")],
                  [".login-heading", t("studio.advanced.cssClasses.loginHeading")],
                  [".login-subtitle", t("studio.advanced.cssClasses.loginSubtitle")],
                  [".login-logo", t("studio.advanced.cssClasses.loginLogo")],
                  [".login-footer", t("studio.advanced.cssClasses.loginFooter")],
                  [".login-sso", t("studio.advanced.cssClasses.loginSso")],
                  [".login-overlay", t("studio.advanced.cssClasses.loginOverlay")],
                  [".login-divider", t("studio.advanced.cssClasses.loginDivider")],
                  [".login-label", t("studio.advanced.cssClasses.loginLabel")],
                  [".dark", t("studio.advanced.cssClasses.darkTheme")],
                ].map(([cls, desc]) => (
                  <div key={cls} className="flex items-baseline gap-1">
                    <code className="shrink-0 rounded-nx-sm bg-nx-raised-2 px-0.5 font-mono text-[8px] text-nx-accent">
                      {cls}
                    </code>
                    <span className="truncate text-nx-ink-3">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="flex items-start gap-1 pt-1 text-[9px] text-nx-ink-3">
              <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              <span>
                {t("studio.advanced.cssVarTipBefore")}{" "}
                <code className="rounded-nx-sm bg-nx-raised-2 px-1 text-[9px]">!important</code>{" "}
                {t("studio.advanced.cssVarTipMiddle")}{" "}
                <code className="rounded-nx-sm bg-nx-raised-2 px-1 text-[9px]">
                  .dark .login-form
                </code>{" "}
                {t("studio.advanced.cssVarTipAfter")}
              </span>
            </p>
          </div>
        </details>
      </div>

      {/* Safe Mode — Core Switch */}
      <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-warning" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-nx-ink">{t("studio.advanced.safeMode")}</p>
            <p className="text-[10px] text-nx-ink-3">{t("studio.advanced.safeModeDesc")}</p>
          </div>
        </div>
        <Switch checked={draft.safeMode} onCheckedChange={(v) => updateDraft("safeMode", v)} />
      </div>

      {/* Accessibility Info */}
      <div className="space-y-2 rounded-nx-md border border-nx-line p-3">
        <div className="flex items-center gap-2">
          <Accessibility className="h-4 w-4 text-info" aria-hidden="true" />
          <p className="text-xs font-medium text-nx-ink">{t("studio.advanced.accessibility")}</p>
        </div>
        <p className="text-[10px] text-nx-ink-3">{t("studio.advanced.accessibilityDesc")}</p>
        {/* Contrast Check */}
        <div className="space-y-1">
          <ContrastCheck
            label={t("studio.advanced.textOnBg")}
            fg={draft.textColor}
            bg={draft.bgColor}
          />
          <ContrastCheck
            label={t("studio.advanced.textOnSurface")}
            fg={draft.textColor}
            bg={draft.surfaceColor}
          />
          <ContrastCheck
            label={t("studio.advanced.primaryOnSurface")}
            fg={draft.primaryColor}
            bg={draft.surfaceColor}
          />
        </div>
      </div>

      {/* RTL Info */}
      <div className="rounded-nx-md border border-nx-line p-3">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-success" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-nx-ink">{t("studio.advanced.rtl")}</p>
            <p className="text-[10px] text-nx-ink-3">{t("studio.advanced.rtlDesc")}</p>
          </div>
        </div>
      </div>

      {/* Export / Import */}
      <div className="space-y-2 rounded-nx-md border border-nx-line p-3">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          <p className="text-xs font-medium text-nx-ink">{t("studio.advanced.exportImport")}</p>
        </div>
        <p className="text-[10px] text-nx-ink-3">{t("studio.advanced.exportImportDesc")}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const json = JSON.stringify(draft, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `studio-config-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 rounded-nx-control border border-nx-line px-3 py-1.5 text-[11px] font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            {t("studio.advanced.export")}
          </button>
          <label className="flex flex-1 cursor-pointer items-center justify-center rounded-nx-control border border-nx-line px-3 py-1.5 text-[11px] font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none">
            {t("studio.advanced.import")}
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const parsed = JSON.parse(ev.target?.result as string);
                    if (parsed && typeof parsed === "object") {
                      Object.entries(parsed).forEach(([key, value]) => {
                        if (key in draft) {
                          updateDraft(key as keyof typeof draft, value as never);
                        }
                      });
                    }
                  } catch {
                    /* ignore invalid JSON */
                  }
                };
                reader.readAsText(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// ── CSS Variable Group (for reference table) ──
function CssVarGroup({
  icon: Icon,
  title,
  vars,
}: {
  icon: typeof Palette;
  title: string;
  vars: [string, string][];
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-nx-ink-3">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {title}
      </p>
      <div className="space-y-0.5">
        {vars.map(([varName, desc]) => (
          <div key={varName} className="flex items-center justify-between">
            <code className="rounded-nx-sm bg-nx-raised-2 px-1 font-mono text-[9px] text-nx-accent">
              {varName}
            </code>
            <span className="text-[9px] text-nx-ink-3">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contrast Checker ──
function ContrastCheck({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const ratio = getContrastRatio(fg, bg);
  const passAA = ratio >= 4.5;
  const passAAA = ratio >= 7;

  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-nx-ink-3">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          <div
            className="h-3 w-3 rounded-nx-sm border border-nx-line"
            style={{ backgroundColor: fg }}
          />
          <div
            className="h-3 w-3 rounded-nx-sm border border-nx-line"
            style={{ backgroundColor: bg }}
          />
        </div>
        <span
          className={`font-mono text-[10px] font-bold ${passAAA ? "text-success" : passAA ? "text-warning" : "text-destructive"}`}
        >
          {ratio.toFixed(1)}:1
        </span>
        <span className={`text-[9px] font-bold ${passAA ? "text-success" : "text-destructive"}`}>
          {passAAA ? "AAA" : passAA ? "AA" : "FAIL"}
        </span>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [0, 0, 0];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
