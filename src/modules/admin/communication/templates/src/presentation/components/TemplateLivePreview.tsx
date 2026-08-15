"use client";

/**
 * TemplateLivePreview — Real-time preview panel for the message template editor.
 *
 * Renders the current template body in a sandboxed iframe with device-size
 * toggling (desktop, tablet, mobile) for responsive testing. Updates are
 * debounced (300ms) so live typing in the rich text editor doesn't cause
 * excessive re-renders.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { Monitor, Tablet, Smartphone, Sun, Moon } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { DesignVariables } from "./DesignVariablesPanel";

// ─── Device presets ─────────────────────────────────────────
// Labels are keyed against the composer's shared device-name copy (see
// PreviewDialog in this same directory) so the three names aren't
// translated twice within the same module.
const DEVICES = [
  { id: "desktop" as const, icon: Monitor, width: "100%", labelKey: "messaging.email.desktop" },
  { id: "tablet" as const, icon: Tablet, width: "768px", labelKey: "messaging.email.tablet" },
  { id: "mobile" as const, icon: Smartphone, width: "375px", labelKey: "messaging.email.mobile" },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Preview Canvas Skins ───────────────────────────────────
// Mirrors the Dark/Light skins in Core.Application/Emails/ScripeEmailTheme.cs so
// admins previewing here see the same canvas the backend actually ships — a
// dark canvas by default (`EmailCanvas.Dark`), with Light reserved for
// print-intended mail. Kept as literal values (not design tokens) because
// this simulates a fixed, backend-owned email canvas, not the admin app's own.
const EMAIL_CANVAS_SKIN = {
  dark: { surface: "#0D0D0E", text: "#F7F8F5", link: "#C6FF00" },
  light: { surface: "#F7F8F5", text: "#0D0D0E", link: "#4C6200" },
} as const;
type CanvasTheme = keyof typeof EMAIL_CANVAS_SKIN;

// ─── Language / Direction ───────────────────────────────────
const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
const ARABIC_SCRIPT_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * `TemplateFormView` holds `form.language` (see useTemplateFormViewModel.ts),
 * so callers that thread it through can pass it explicitly; absent that,
 * direction is inferred from the actual body text, the same signal a mail
 * client uses.
 */
function resolveLangDir(
  explicitLanguage: string | undefined,
  text: string
): { lang: string; dir: "rtl" | "ltr" } {
  if (explicitLanguage) {
    return { lang: explicitLanguage, dir: RTL_LANGS.has(explicitLanguage) ? "rtl" : "ltr" };
  }
  const dir = ARABIC_SCRIPT_RE.test(text) ? "rtl" : "ltr";
  return { lang: dir === "rtl" ? "ar" : "en", dir };
}

// Same DOMPurify allow-list as templates/PreviewDialog.tsx — one sanitization
// policy for every surface that renders admin-controlled HTML into a srcDoc
// iframe, instead of each preview inventing its own regex denylist.
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "span",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "a",
    "img",
    "blockquote",
    "pre",
    "code",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel", "width", "height"],
  ALLOW_DATA_ATTR: false,
};

// ─── Props ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for template live preview props.
 */
export interface TemplateLivePreviewProps {
  /** The raw HTML body of the template */
  body: string;
  /** Optional subject line to display above the preview */
  subject?: string;
  /**
   * BCP-47 language of the template (e.g. "en", "ar"). Drives the preview
   * iframe's `dir`/`lang`. Falls back to detecting the script of the body
   * when not passed.
   */
  language?: string;
  /**
   * The Design tab's live color/typography values (see DesignVariablesPanel).
   * When present, these style the preview so changes on the Design tab are
   * actually visible here instead of the two tabs being disconnected siblings.
   */
  designVariables?: DesignVariables;
}

// ─── Component ──────────────────────────────────────────────
/**
 * Presentation UI component rendering the template live preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TemplateLivePreview({
  body,
  subject,
  language,
  designVariables,
}: TemplateLivePreviewProps) {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceId>("desktop");
  // Defaults to dark: that's what EmailCanvas.Dark ships to recipients by
  // default (see ScripeEmailTheme.cs) — the toggle lets admins also check the
  // Light variant reserved for print-intended mail. Design-tab colors (below)
  // win over either skin when the admin has actually set them.
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");
  const [debouncedBody, setDebouncedBody] = useState(body);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Debounce body updates (300ms) ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBody(body), 300);
    return () => clearTimeout(timer);
  }, [body]);

  const { lang: previewLang, dir: previewDir } = useMemo(
    () => resolveLangDir(language, `${subject ?? ""} ${debouncedBody}`),
    [language, subject, debouncedBody]
  );

  const skin = EMAIL_CANVAS_SKIN[canvasTheme];

  // Design-tab values (DesignVariablesPanel) override the canvas default when
  // set — they're the deliberate per-template choice this tab exists to show,
  // the same roles DesignVariablesPanel's own swatch uses for them.
  const bodyBackground = designVariables?.backgroundColor || skin.surface;
  const bodyColor = designVariables?.textColor || skin.text;
  const bodyFontFamily =
    designVariables?.fontFamily ||
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const bodyFontSize = designVariables?.bodyFontSize ? `${designVariables.bodyFontSize}px` : "14px";
  const linkColor = designVariables?.primaryColor || skin.link;

  // ── Build full HTML document ──
  const srcDoc = useMemo(() => {
    const sanitized = DOMPurify.sanitize(debouncedBody, SANITIZE_OPTIONS);

    return `<!DOCTYPE html>
<html dir="${previewDir}" lang="${previewLang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${bodyFontFamily};
    font-size: ${bodyFontSize};
    line-height: 1.6;
    color: ${bodyColor};
    background: ${bodyBackground};
    padding: 16px;
    word-wrap: break-word;
  }
  img { max-width: 100%; height: auto; }
  a { color: ${linkColor}; }
  table { border-collapse: collapse; }
</style>
</head>
<body>${sanitized}</body>
</html>`;
  }, [
    debouncedBody,
    previewDir,
    previewLang,
    bodyBackground,
    bodyColor,
    bodyFontFamily,
    bodyFontSize,
    linkColor,
  ]);

  // ── Auto-resize iframe ──
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        iframe.style.height = `${Math.min(doc.body.scrollHeight + 24, 500)}px`;
      }
    } catch {
      // sandbox restriction
    }
  };

  const selectedDevice = DEVICES.find((d) => d.id === device)!;

  return (
    <div className="space-y-3">
      {/* Device toggles + canvas theme */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_50%,transparent)] p-1">
          {DEVICES.map((d) => (
            <Button
              key={d.id}
              type="button"
              variant={device === d.id ? "default" : "ghost"}
              size="sm"
              className={cn("h-7 gap-1.5 px-2.5 text-xs", device === d.id && "shadow-nx-sm")}
              onClick={() => setDevice(d.id)}
              title={t(d.labelKey)}
              aria-label={t(d.labelKey)}
            >
              <d.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t(d.labelKey)}</span>
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs"
          onClick={() => setCanvasTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          title={canvasTheme === "dark" ? t("theme.dark") : t("theme.light")}
        >
          {canvasTheme === "dark" ? (
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {canvasTheme === "dark" ? t("theme.dark") : t("theme.light")}
          </span>
        </Button>
      </div>

      {/* Subject preview */}
      {subject && (
        <div className="rounded-nx-sm border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] px-3 py-2">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.subject")}
          </p>
          <p className="truncate text-sm font-medium">{subject}</p>
        </div>
      )}

      {/* Preview container */}
      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          style={{ width: selectedDevice.width, maxWidth: "100%" }}
        >
          {debouncedBody ? (
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              sandbox="allow-same-origin"
              className="w-full border-0"
              style={{ minHeight: "120px", height: "300px", maxHeight: "500px" }}
              title={t("messaging.templates.preview")}
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-nx-ink-3">
              {t("messaging.templates.livePreviewEmpty")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateLivePreview;
