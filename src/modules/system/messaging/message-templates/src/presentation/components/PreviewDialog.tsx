"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import type { PreviewTemplateResponse } from "../../domain/entities/MessageTemplate";

interface PreviewDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      result: PreviewTemplateResponse | null;
      isLoading: boolean;
}

export function PreviewDialog({ open, onOpenChange, result, isLoading }: PreviewDialogProps) {
      const { t } = useI18n();

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                              <DialogTitle>{t("messaging.templates.preview") || "Preview"}</DialogTitle>
                        </DialogHeader>

                        {isLoading && (
                              <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                                                className="border rounded-lg p-4 bg-white dark:bg-zinc-900"
                                                dangerouslySetInnerHTML={{ __html: result.body }}
                                          />
                                    </div>
                              </div>
                        )}
                  </DialogContent>
            </Dialog>
      );
}
