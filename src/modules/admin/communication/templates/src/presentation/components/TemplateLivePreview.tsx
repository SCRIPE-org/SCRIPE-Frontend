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
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";

// ─── Device presets ─────────────────────────────────────────
const DEVICES = [
  { id: "desktop" as const, icon: Monitor, width: "100%", label: "Desktop" },
  { id: "tablet" as const, icon: Tablet, width: "768px", label: "Tablet" },
  { id: "mobile" as const, icon: Smartphone, width: "375px", label: "Mobile" },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Props ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for template live preview props.
 */
export interface TemplateLivePreviewProps {
  /** The raw HTML body of the template */
  body: string;
  /** Optional subject line to display above the preview */
  subject?: string;
}

// ─── Component ──────────────────────────────────────────────
/**
 * Presentation UI component rendering the template live preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TemplateLivePreview({ body, subject }: TemplateLivePreviewProps) {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [debouncedBody, setDebouncedBody] = useState(body);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Debounce body updates (300ms) ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBody(body), 300);
    return () => clearTimeout(timer);
  }, [body]);

  // ── Build full HTML document ──
  const srcDoc = useMemo(() => {
    const sanitized = debouncedBody
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1a1a1a;
    background: #ffffff;
    padding: 16px;
    word-wrap: break-word;
  }
  img { max-width: 100%; height: auto; }
  a { color: #3b82f6; }
  table { border-collapse: collapse; }
</style>
</head>
<body>${sanitized}</body>
</html>`;
  }, [debouncedBody]);

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
      {/* Device toggles */}
      <div className="flex items-center justify-center gap-1 rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_50%,transparent)] p-1">
        {DEVICES.map((d) => (
          <Button
            key={d.id}
            type="button"
            variant={device === d.id ? "default" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1.5 px-2.5 text-xs", device === d.id && "shadow-nx-sm")}
            onClick={() => setDevice(d.id)}
            title={d.label}
          >
            <d.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{d.label}</span>
          </Button>
        ))}
      </div>

      {/* Subject preview */}
      {subject && (
        <div className="rounded-nx-sm border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] px-3 py-2">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-nx-ink-3">
            Subject
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
              title="Template Preview"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-nx-ink-3">
              Start typing to see preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateLivePreview;
