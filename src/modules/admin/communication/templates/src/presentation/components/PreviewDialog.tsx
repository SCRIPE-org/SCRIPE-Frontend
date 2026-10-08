"use client";

import React, { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Monitor, Tablet, Smartphone, Sun, Moon } from "lucide-react";
import type { PreviewTemplateResponse } from "../../domain/entities/MessageTemplateRequests";

// ─── Device Presets ─────────────────────────────────────────
// Labels are keyed against the composer's shared device-name copy so the
// three names aren't translated twice within the same module.
const DEVICES = [
  { id: "desktop", labelKey: "messaging.email.desktop", icon: Monitor, width: 600 },
  { id: "tablet", labelKey: "messaging.email.tablet", icon: Tablet, width: 480 },
  { id: "mobile", labelKey: "messaging.email.mobile", icon: Smartphone, width: 320 },
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
 * `PreviewTemplateResponse` carries only `subject`/`body` (see
 * MessageTemplateRequests.ts) — the template's own `language` isn't part of
 * this response, so callers that have it can pass it explicitly; absent that,
 * direction is inferred from the actual resolved text, the same signal a mail
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

// ─── Props ──────────────────────────────────────────────────
interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: PreviewTemplateResponse | null;
  isLoading: boolean;
  /** BCP-47 language of the previewed template (e.g. "en", "ar"). Falls back
   *  to detecting the script of the rendered body when not passed. */
  language?: string;
}

/**
 * Presentation UI component rendering the preview dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PreviewDialog({
  open,
  onOpenChange,
  result,
  isLoading,
  language,
}: PreviewDialogProps) {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceId>("desktop");
  // Defaults to dark: that's what EmailCanvas.Dark ships to recipients by
  // default (see ScripeEmailTheme.cs) — the toggle lets admins also check the
  // Light variant reserved for print-intended mail.
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");

  const sanitizedBody = useMemo(
    () =>
      result?.body
        ? DOMPurify.sanitize(result.body, {
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
            ALLOWED_ATTR: [
              "href",
              "src",
              "alt",
              "class",
              "style",
              "target",
              "rel",
              "width",
              "height",
            ],
            ALLOW_DATA_ATTR: false,
          })
        : "",
    [result]
  );

  const { lang: previewLang, dir: previewDir } = useMemo(
    () => resolveLangDir(language, `${result?.subject ?? ""} ${result?.body ?? ""}`),
    [language, result]
  );

  const skin = EMAIL_CANVAS_SKIN[canvasTheme];

  const previewSrcDoc = useMemo(
    () =>
      `<!DOCTYPE html><html dir="${previewDir}" lang="${previewLang}"><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:${skin.text};padding:16px;background:${skin.surface}}img{max-width:100%;height:auto}a{color:${skin.link}}</style></head><body>${sanitizedBody}</body></html>`,
    [previewDir, previewLang, skin, sanitizedBody]
  );

  const currentDevice = DEVICES.find((d) => d.id === device)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("messaging.templates.preview")}</DialogTitle>
        </DialogHeader>

        {isLoading && <LoadingSpinner />}

        {result && !isLoading && (
          <div className="space-y-4">
            {/* Subject */}
            {result.subject && (
              <div>
                <p className="mb-1 text-sm font-medium text-nx-ink-2">
                  {t("messaging.templates.subject")}
                </p>
                <p className="text-base font-semibold text-nx-ink">{result.subject}</p>
              </div>
            )}

            {/* Device Switcher + Canvas Toggle — chrome around the preview,
                not the simulated email surface itself. */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex w-fit items-center justify-center gap-1 rounded-nx-md border border-nx-line bg-nx-raised p-1">
                {DEVICES.map((d) => {
                  const Icon = d.icon;
                  const label = t(d.labelKey);
                  return (
                    <Button
                      key={d.id}
                      type="button"
                      variant={device === d.id ? "default" : "ghost"}
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setDevice(d.id)}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </Button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setCanvasTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              >
                {canvasTheme === "dark" ? (
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {canvasTheme === "dark" ? t("theme.dark") : t("theme.light")}
              </Button>
            </div>

            {/* Body Preview — the device frame is chrome (nx tokens); the
                canvas inside follows the toggle above. The backend ships a
                fixed dark canvas by default (EmailCanvas.Dark in
                ScripeEmailTheme.cs) with no light-mode media query, so this
                defaults to dark instead of a hardcoded white that hasn't
                matched production in a while. */}
            <div className="flex justify-center">
              <div
                className={cn(
                  "overflow-hidden rounded-nx-lg border border-nx-line shadow-nx-sm",
                  device === "mobile" && "border-2"
                )}
                style={{
                  width: `${currentDevice.width}px`,
                  maxWidth: "100%",
                  background: skin.surface,
                }}
              >
                {/* Simulated device bar (chrome) */}
                <div className="flex items-center gap-1.5 border-b border-nx-line bg-nx-raised px-3 py-2">
                  <div className="flex gap-1" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="font-mono text-[10px] text-nx-ink-3">
                      {currentDevice.width}px
                    </span>
                  </div>
                </div>

                {/* Content — the simulated email canvas, following the
                    dark/light toggle above. */}
                <iframe
                  srcDoc={previewSrcDoc}
                  sandbox="allow-same-origin"
                  className="w-full border-0"
                  style={{ minHeight: "200px", height: "400px" }}
                  title={t("messaging.templates.preview")}
                  onLoad={(e) => {
                    const iframe = e.currentTarget;
                    try {
                      const body = iframe.contentDocument?.body;
                      if (body) {
                        iframe.style.height = `${Math.min(body.scrollHeight + 32, 600)}px`;
                      }
                    } catch {
                      /* sandbox restriction */
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {!result && !isLoading && <EmptyState bare size="sm" title={t("common.noData")} />}
      </DialogContent>
    </Dialog>
  );
}
