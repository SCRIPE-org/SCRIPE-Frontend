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
import { Sun, Moon } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { DesignVariables } from "./DesignVariablesPanel";
import {
  PREVIEW_DEVICES,
  type PreviewDeviceId,
  EMAIL_CANVAS_SKIN,
  type CanvasTheme,
  resolvePreviewLangDir,
  composePreviewDocument,
} from "./templatePreviewHelpers";

/**
 * Documentation for module export
 */
export interface TemplateLivePreviewProps {
  /** The raw HTML body of the template. */
  body: string;
  /** Optional subject line to display above the preview. */
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

/**
 * Presentation UI component rendering the template live preview.
 * Arranges layout boundaries and accessibility targets using the core design library.
 *
 * @param props Template body, subject, language, and design variables.
 * @returns An interactive preview pane with viewport dimension and canvas theme toggles.
 */
export function TemplateLivePreview({
  body,
  subject,
  language,
  designVariables,
}: TemplateLivePreviewProps): React.JSX.Element {
  const { t } = useI18n();
  const [device, setDevice] = useState<PreviewDeviceId>("desktop");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");
  const [debouncedBody, setDebouncedBody] = useState(body);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Debounce body updates to minimize iframe rebuild overhead during active typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBody(body), 300);
    return () => clearTimeout(timer);
  }, [body]);

  const { lang: previewLang, dir: previewDir } = useMemo(
    () => resolvePreviewLangDir(language, `${subject ?? ""} ${debouncedBody}`),
    [language, subject, debouncedBody]
  );

  const skin = EMAIL_CANVAS_SKIN[canvasTheme];

  // Compose complete sandboxed HTML document
  const srcDoc = useMemo(
    () =>
      composePreviewDocument({
        debouncedBody,
        previewDir,
        previewLang,
        skin,
        designVariables,
      }),
    [debouncedBody, previewDir, previewLang, skin, designVariables]
  );

  // Automatically adjust iframe height based on content size
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        iframe.style.height = `${Math.min(doc.body.scrollHeight + 24, 500)}px`;
      }
    } catch {
      // Sandbox restrictions may prevent contentDocument access in certain host environments
    }
  };

  const selectedDevice = PREVIEW_DEVICES.find((d) => d.id === device)!;

  return (
    <div className="space-y-3">
      {/* Device viewport toggles + canvas theme switch */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_50%,transparent)] p-1">
          {PREVIEW_DEVICES.map((d) => (
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

      {/* Subject line preview header */}
      {subject && (
        <div className="rounded-nx-sm border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] px-3 py-2">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-nx-ink-3">
            {t("messaging.templates.subject")}
          </p>
          <p className="truncate text-sm font-medium">{subject}</p>
        </div>
      )}

      {/* Sandboxed responsive preview iframe container */}
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
