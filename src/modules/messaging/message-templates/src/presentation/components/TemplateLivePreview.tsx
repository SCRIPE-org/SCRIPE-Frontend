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
 * Interface structure detailing the properties and attributes of Template Live Preview Props.
 */
export interface TemplateLivePreviewProps {
  /** The raw HTML body of the template */
  body: string;
  /** Optional subject line to display above the preview */
  subject?: string;
}

// ─── Component ──────────────────────────────────────────────
/**
 * React presentation component representing the template live preview UI element.
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
      <div className="flex items-center justify-center gap-1 rounded-lg bg-muted/50 p-1">
        {DEVICES.map((d) => (
          <Button
            key={d.id}
            type="button"
            variant={device === d.id ? "default" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1.5 px-2.5 text-xs", device === d.id && "shadow-sm")}
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
        <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Subject
          </p>
          <p className="truncate text-sm font-medium">{subject}</p>
        </div>
      )}

      {/* Preview container */}
      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-lg border bg-white transition-all duration-300 dark:bg-zinc-900"
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
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Start typing to see preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateLivePreview;
