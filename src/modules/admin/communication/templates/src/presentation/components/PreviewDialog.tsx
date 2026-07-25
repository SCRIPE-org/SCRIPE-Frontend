"use client";

import React, { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Monitor, Tablet, Smartphone } from "lucide-react";
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

// ─── Props ──────────────────────────────────────────────────
interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: PreviewTemplateResponse | null;
  isLoading: boolean;
}

/**
 * Presentation UI component rendering the preview dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PreviewDialog({ open, onOpenChange, result, isLoading }: PreviewDialogProps) {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceId>("desktop");

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

            {/* Device Switcher — chrome around the preview, not the simulated
                email surface itself. */}
            <div className="mx-auto flex w-fit items-center justify-center gap-1 rounded-nx-md border border-nx-line bg-nx-raised p-1">
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

            {/* Body Preview — the device frame is chrome (nx tokens); the
                canvas inside simulates an email client's own white
                background, which stays bg-white regardless of theme. */}
            <div className="flex justify-center">
              <div
                className={cn(
                  "overflow-hidden rounded-nx-lg border border-nx-line bg-white shadow-nx-sm",
                  device === "mobile" && "border-2"
                )}
                style={{ width: `${currentDevice.width}px`, maxWidth: "100%" }}
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

                {/* Content — the simulated email canvas, intentionally white
                    (an email client renders on white regardless of theme). */}
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#000;padding:16px;background:#fff}img{max-width:100%;height:auto}a{color:#3b82f6}</style></head><body>${sanitizedBody}</body></html>`}
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
