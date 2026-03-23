/**
 * AdvancedPanel — Custom CSS, safe mode (core Switch), accessibility, RTL.
 * All labels localized via t()
 */
"use client";

import { Code, Shield, Languages, Accessibility } from "lucide-react";
import { Switch } from "@core/ui/switch";
import type { StudioDraft } from "../viewmodels/useStudioViewModel";

interface AdvancedPanelProps {
  t: (key: string) => string;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
}

export function AdvancedPanel({ t, draft, updateDraft }: AdvancedPanelProps) {
  return (
    <div className="space-y-5">
      {/* Custom CSS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Code className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.advanced.customCss")}
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {t("studio.advanced.customCssDesc")}
        </p>
        <textarea
          value={draft.customCss}
          onChange={(e) => updateDraft("customCss", e.target.value)}
          placeholder={`/* ═══ Custom CSS Examples ═══ */

/* Gradient glow button */
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

/* Glassmorphism form card */
.login-form {
  backdrop-filter: blur(16px);
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 24px;
}

/* Neon input glow on focus */
.login-input:focus {
  border-color: #00f0ff !important;
  box-shadow: 0 0 10px rgba(0,240,255,0.3),
              0 0 40px rgba(0,240,255,0.1) !important;
}

/* Animated gradient page background */
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

/* Dark mode overrides */
.dark .login-input {
  background: rgba(255,255,255,0.05) !important;
}`}
          rows={10}
          className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 resize-y"
          spellCheck={false}
        />

        {/* CSS Variable Reference */}
        <details className="rounded-lg border border-border/60 bg-muted/20">
          <summary className="cursor-pointer px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            📋 {t("studio.advanced.cssVarRef") || "Available CSS Variables"}
          </summary>
          <div className="px-3 pb-3 space-y-2">
            <CssVarGroup title="🎨 Colors" vars={[
              ["--login-primary", "Primary color"],
              ["--login-secondary", "Secondary color"],
              ["--login-bg", "Page background"],
              ["--login-surface", "Card/surface background"],
              ["--login-text", "Main text color"],
              ["--login-text-muted", "Muted text color"],
              ["--login-border", "Border color"],
              ["--login-error", "Error color"],
              ["--login-success", "Success color"],
            ]} />
            <CssVarGroup title="🖼️ Background" vars={[
              ["--login-bg-image", "Background image"],
              ["--login-bg-gradient", "Background gradient"],
              ["--login-overlay-opacity", "Overlay opacity (0-1)"],
              ["--login-overlay-color", "Overlay color"],
              ["--login-overlay-blur", "Overlay blur (px)"],
            ]} />
            <CssVarGroup title="📐 Layout" vars={[
              ["--login-panel-bg", "Branding panel bg (split layouts)"],
              ["--login-panel-bg-image", "Panel bg image"],
              ["--login-form-width", "Form max width (px)"],
              ["--login-card-padding", "Card padding (px)"],
              ["--login-element-gap", "Element spacing (px)"],
              ["--login-input-height", "Input height (px)"],
            ]} />
            <CssVarGroup title="✏️ Typography" vars={[
              ["--login-font-heading", "Heading font family"],
              ["--login-font-body", "Body font family"],
              ["--login-font-body-ar", "Arabic body font"],
              ["--login-size-headline", "Headline size (px)"],
              ["--login-size-subtitle", "Subtitle size (px)"],
              ["--login-weight-heading", "Heading weight"],
              ["--login-weight-body", "Body weight"],
            ]} />
            <CssVarGroup title="🔲 Shape" vars={[
              ["--login-radius-card", "Card border radius"],
              ["--login-radius-button", "Button border radius"],
              ["--login-shadow-card", "Card box shadow"],
            ]} />
            <div className="space-y-1 pt-1">
              <p className="text-[10px] font-semibold text-foreground">🎯 CSS Class Hooks</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
                {[
                  [".login-page", "Page wrapper"],
                  [".login-form-wrapper", "Form container"],
                  [".login-form", "<form> tag"],
                  [".login-input", "Input fields"],
                  [".login-button", "Submit button"],
                  [".login-card", "Card/surface"],
                  [".login-heading", "Headings (h1/h2)"],
                  [".login-subtitle", "Subtitle text"],
                  [".login-logo", "Logo box"],
                  [".login-footer", "Copyright area"],
                  [".login-sso", "SSO buttons"],
                  [".login-overlay", "Overlay layer"],
                  [".login-divider", "Divider line"],
                  [".login-label", "Form labels"],
                  [".dark", "Dark theme"],
                ].map(([cls, desc]) => (
                  <div key={cls} className="flex items-baseline gap-1">
                    <code className="text-[8px] bg-muted px-0.5 rounded font-mono text-primary shrink-0">{cls}</code>
                    <span className="text-muted-foreground truncate">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground/60 pt-1">
              💡 Use <code className="text-[9px] bg-muted px-1 rounded">!important</code> to override inline styles. Target dark mode with <code className="text-[9px] bg-muted px-1 rounded">.dark .login-form</code> etc.
            </p>
          </div>
        </details>
      </div>

      {/* Safe Mode — Core Switch */}
      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-xs font-medium text-foreground">{t("studio.advanced.safeMode")}</p>
            <p className="text-[10px] text-muted-foreground">{t("studio.advanced.safeModeDesc")}</p>
          </div>
        </div>
        <Switch
          checked={draft.safeMode}
          onCheckedChange={(v) => updateDraft("safeMode", v)}
        />
      </div>

      {/* Accessibility Info */}
      <div className="rounded-xl border border-border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Accessibility className="h-4 w-4 text-blue-500" />
          <p className="text-xs font-medium text-foreground">{t("studio.advanced.accessibility")}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">{t("studio.advanced.accessibilityDesc")}</p>
        {/* Contrast Check */}
        <div className="space-y-1">
          <ContrastCheck label={t("studio.advanced.textOnBg")} fg={draft.textColor} bg={draft.bgColor} />
          <ContrastCheck label={t("studio.advanced.textOnSurface")} fg={draft.textColor} bg={draft.surfaceColor} />
          <ContrastCheck label={t("studio.advanced.primaryOnSurface")} fg={draft.primaryColor} bg={draft.surfaceColor} />
        </div>
      </div>

      {/* RTL Info */}
      <div className="rounded-xl border border-border p-3">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-xs font-medium text-foreground">{t("studio.advanced.rtl")}</p>
            <p className="text-[10px] text-muted-foreground">{t("studio.advanced.rtlDesc")}</p>
          </div>
        </div>
      </div>

      {/* Export / Import */}
      <div className="rounded-xl border border-border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-purple-500" />
          <p className="text-xs font-medium text-foreground">{t("studio.advanced.exportImport")}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">{t("studio.advanced.exportImportDesc")}</p>
        <div className="flex gap-2">
          <button
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
            className="flex-1 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/30 transition-colors"
          >
            {t("studio.advanced.export")}
          </button>
          <label className="flex-1 flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
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
                  } catch { /* ignore invalid JSON */ }
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
function CssVarGroup({ title, vars }: { title: string; vars: [string, string][] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground mb-1">{title}</p>
      <div className="space-y-0.5">
        {vars.map(([varName, desc]) => (
          <div key={varName} className="flex items-center justify-between">
            <code className="text-[9px] font-mono text-primary/80 bg-muted px-1 rounded">{varName}</code>
            <span className="text-[9px] text-muted-foreground/60">{desc}</span>
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
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          <div className="h-3 w-3 rounded-sm border border-border" style={{ backgroundColor: fg }} />
          <div className="h-3 w-3 rounded-sm border border-border" style={{ backgroundColor: bg }} />
        </div>
        <span className={`text-[10px] font-mono font-bold ${passAAA ? "text-green-500" : passAA ? "text-amber-500" : "text-red-500"}`}>
          {ratio.toFixed(1)}:1
        </span>
        <span className={`text-[9px] font-bold ${passAA ? "text-green-500" : "text-red-500"}`}>
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
