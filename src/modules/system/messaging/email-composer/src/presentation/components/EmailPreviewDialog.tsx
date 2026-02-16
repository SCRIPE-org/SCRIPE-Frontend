"use client";

import React, { useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { Monitor, Tablet, Smartphone } from "lucide-react";

// ─── Device Presets ─────────────────────────────────────────
const DEVICES = [
      { id: "desktop", label: "Desktop", icon: Monitor, width: 600 },
      { id: "tablet", label: "Tablet", icon: Tablet, width: 480 },
      { id: "mobile", label: "Mobile", icon: Smartphone, width: 320 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Props ──────────────────────────────────────────────────
export interface EmailPreviewDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      subject: string;
      body: string;
      recipients: string[];
}

export function EmailPreviewDialog({
      open,
      onOpenChange,
      subject,
      body,
      recipients,
}: EmailPreviewDialogProps) {
      const { t } = useI18n();
      const [device, setDevice] = useState<DeviceId>("desktop");

      const sanitizedBody = useMemo(() => {
            return body
                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                  .replace(/on\w+="[^"]*"/gi, "")
                  .replace(/on\w+='[^']*'/gi, "");
      }, [body]);

      const currentDevice = DEVICES.find((d) => d.id === device)!;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                              <DialogTitle>{t("messaging.email.previewTitle") || "Email Preview"}</DialogTitle>
                              <DialogDescription>
                                    {t("messaging.email.previewDescription") || "Preview how your email will appear to recipients."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                              {/* Recipients */}
                              <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                          {t("messaging.email.to") || "To"}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                          {recipients.map((email) => (
                                                <Badge key={email} variant="secondary" className="text-xs">
                                                      {email}
                                                </Badge>
                                          ))}
                                    </div>
                              </div>

                              {/* Subject */}
                              <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                          {t("messaging.email.subject") || "Subject"}
                                    </p>
                                    <p className="text-base font-semibold">{subject || "—"}</p>
                              </div>

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
                                                "border rounded-lg bg-white transition-all duration-300 overflow-hidden shadow-sm",
                                                device === "mobile" && "rounded-2xl border-2"
                                          )}
                                          style={{
                                                width: `${currentDevice.width}px`,
                                                maxWidth: "100%",
                                          }}
                                    >
                                          {/* Simulated browser/device bar */}
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

                                          {/* Email Content */}
                                          <div className="p-4">
                                                {body.includes("<") ? (
                                                      <div
                                                            className="prose prose-sm max-w-none text-black [&_*]:text-inherit"
                                                            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                                                      />
                                                ) : (
                                                      <pre className="whitespace-pre-wrap text-sm font-sans text-black">
                                                            {body}
                                                      </pre>
                                                )}
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </DialogContent>
            </Dialog>
      );
}
