"use client";

import React, { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";

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

      const sanitizedBody = useMemo(() => {
            // Basic sanitization: escape script tags while keeping HTML structure
            return body
                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                  .replace(/on\w+="[^"]*"/gi, "")
                  .replace(/on\w+='[^']*'/gi, "");
      }, [body]);

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

                              {/* Body */}
                              <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                          {t("messaging.email.body") || "Body"}
                                    </p>
                                    <div className="border rounded-md p-4 bg-card">
                                          {body.includes("<") ? (
                                                <div
                                                      className="prose prose-sm dark:prose-invert max-w-none"
                                                      dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                                                />
                                          ) : (
                                                <pre className="whitespace-pre-wrap text-sm font-sans">{body}</pre>
                                          )}
                                    </div>
                              </div>
                        </div>
                  </DialogContent>
            </Dialog>
      );
}
