"use client";

import React, { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { Loader2, Monitor, Tablet, Smartphone } from "lucide-react";
import type { PreviewTemplateResponse } from "../../domain/entities/MessageTemplateRequests";

// ─── Device Presets ─────────────────────────────────────────
const DEVICES = [
      { id: "desktop", label: "Desktop", icon: Monitor, width: 600 },
      { id: "tablet", label: "Tablet", icon: Tablet, width: 480 },
      { id: "mobile", label: "Mobile", icon: Smartphone, width: 320 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Props ──────────────────────────────────────────────────
interface PreviewDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      result: PreviewTemplateResponse | null;
      isLoading: boolean;
}

export function PreviewDialog({ open, onOpenChange, result, isLoading }: PreviewDialogProps) {
      const { t } = useI18n();
      const [device, setDevice] = useState<DeviceId>("desktop");

      const sanitizedBody = useMemo(
            () =>
                  result?.body
                        ? DOMPurify.sanitize(result.body, {
                              ALLOWED_TAGS: [
                                    "h1", "h2", "h3", "h4", "h5", "h6",
                                    "p", "br", "hr", "span", "div",
                                    "strong", "b", "em", "i", "u", "s",
                                    "ul", "ol", "li",
                                    "table", "thead", "tbody", "tr", "th", "td",
                                    "a", "img",
                                    "blockquote", "pre", "code",
                              ],
                              ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel", "width", "height"],
                              ALLOW_DATA_ATTR: false,
                        })
                        : "",
            [result?.body]
      );

      const currentDevice = DEVICES.find((d) => d.id === device)!;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                              <DialogTitle>{t("messaging.templates.preview") || "Preview"}</DialogTitle>
                        </DialogHeader>

                        {isLoading && (
                              <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                        )}

                        {result && !isLoading && (
                              <div className="space-y-4">
                                    {/* Subject */}
                                    {result.subject && (
                                          <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                      {t("messaging.templates.subject") || "Subject"}
                                                </p>
                                                <p className="text-base font-semibold">{result.subject}</p>
                                          </div>
                                    )}

                                    {/* Device Switcher */}
                                    <div className="flex items-center justify-center gap-1 border rounded-lg p-1 bg-muted/30 w-fit mx-auto">
                                          {DEVICES.map((d) => {
                                                const Icon = d.icon;
                                                return (
                                                      <Button
                                                            key={d.id}
                                                            type="button"
                                                            variant={device === d.id ? "default" : "ghost"}
                                                            size="sm"
                                                            className="gap-1.5 h-8 text-xs"
                                                            onClick={() => setDevice(d.id)}
                                                      >
                                                            <Icon className="h-3.5 w-3.5" />
                                                            {d.label}
                                                      </Button>
                                                );
                                          })}
                                    </div>

                                    {/* Body Preview */}
                                    <div className="flex justify-center">
                                          <div
                                                className={cn(
                                                      "border rounded-lg overflow-hidden shadow-sm transition-all duration-300 bg-white",
                                                      device === "mobile" && "rounded-2xl border-2"
                                                )}
                                                style={{ width: `${currentDevice.width}px`, maxWidth: "100%" }}
                                          >
                                                {/* Simulated device bar */}
                                                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b">
                                                      <div className="flex gap-1">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                                      </div>
                                                      <div className="flex-1 text-center">
                                                            <span className="text-[10px] text-gray-400 font-mono">
                                                                  {currentDevice.width}px
                                                            </span>
                                                      </div>
                                                </div>

                                                {/* Content */}
                                                <iframe
                                                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#000;padding:16px;background:#fff}img{max-width:100%;height:auto}a{color:#3b82f6}</style></head><body>${sanitizedBody}</body></html>`}
                                                      sandbox="allow-same-origin"
                                                      className="w-full border-0"
                                                      style={{ minHeight: "200px", height: "400px" }}
                                                      title="Template Preview"
                                                      onLoad={(e) => {
                                                            const iframe = e.currentTarget;
                                                            try {
                                                                  const body = iframe.contentDocument?.body;
                                                                  if (body) {
                                                                        iframe.style.height = `${Math.min(body.scrollHeight + 32, 600)}px`;
                                                                  }
                                                            } catch { /* sandbox restriction */ }
                                                      }}
                                                />
                                          </div>
                                    </div>
                              </div>
                        )}

                        {!result && !isLoading && (
                              <div className="text-center py-8 text-muted-foreground">
                                    {t("common.noData") || "No preview available"}
                              </div>
                        )}
                  </DialogContent>
            </Dialog>
      );
}
