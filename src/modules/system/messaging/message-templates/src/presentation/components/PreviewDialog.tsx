"use client";

import DOMPurify from "dompurify";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Loader2 } from "lucide-react";
import type { PreviewTemplateResponse } from "../../domain/entities/MessageTemplate";

interface PreviewDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      result: PreviewTemplateResponse | null;
      isLoading: boolean;
}

export function PreviewDialog({ open, onOpenChange, result, isLoading }: PreviewDialogProps) {
      const { t } = useI18n();

      const sanitizedBody = result?.body
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
            : "";

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
                                    {result.subject && (
                                          <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                      {t("messaging.templates.subject") || "Subject"}
                                                </p>
                                                <p className="text-base font-semibold">{result.subject}</p>
                                          </div>
                                    )}

                                    <div>
                                          <p className="text-sm font-medium text-muted-foreground mb-2">
                                                {t("messaging.templates.body") || "Body"}
                                          </p>
                                          <div
                                                className="border rounded-lg p-4 bg-white dark:bg-zinc-900 prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                                          />
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
