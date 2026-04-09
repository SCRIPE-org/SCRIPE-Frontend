/**
 * WebhookSecretPanel
 *
 * Displays the HMAC-SHA256 signing secret with reveal/copy/rotate functionality.
 * Shows previous secret grace period countdown when rotating.
 */
"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
} from "@core/ui/alert-dialog";
import {
      Eye,
      EyeOff,
      Copy,
      Check,
      RefreshCw,
      Shield,
      Clock,
} from "lucide-react";
import { format } from "date-fns";

interface WebhookSecretPanelProps {
      secret: string;
      hasPreviousSecret: boolean;
      previousSecretExpiresAt: string | null;
      isVisible: boolean;
      onToggleVisibility: () => void;
      onRotate: () => void;
      isRotating: boolean;
}

export function WebhookSecretPanel({
      secret,
      hasPreviousSecret,
      previousSecretExpiresAt,
      isVisible,
      onToggleVisibility,
      onRotate,
      isRotating,
}: WebhookSecretPanelProps) {
      const { t } = useI18n();
      const [copied, setCopied] = useState(false);
      const [rotateDialogOpen, setRotateDialogOpen] = useState(false);

      const handleCopy = useCallback(() => {
            navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
      }, [secret]);

      const maskedSecret = "whsk_" + "•".repeat(40) + secret.slice(-6);

      return (
            <>
                  <Card>
                        <CardHeader>
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                          <Shield className="h-4 w-4 text-blue-500" />
                                          <CardTitle className="text-base">
                                                {t("webhooks.secret") || "Signing Secret"}
                                          </CardTitle>
                                    </div>
                                    <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setRotateDialogOpen(true)}
                                          disabled={isRotating}
                                          className="gap-1.5"
                                    >
                                          <RefreshCw
                                                className={`h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`}
                                          />
                                          {t("webhooks.rotateSecret") || "Rotate Secret"}
                                    </Button>
                              </div>
                              <CardDescription>
                                    {t("webhooks.secretDescription") ||
                                          "Used to sign webhook payloads with HMAC-SHA256. Keep this secret safe."}
                              </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              {/* Secret display */}
                              <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted/50 rounded-lg px-4 py-3 font-mono text-sm overflow-hidden">
                                          <span className="select-all break-all">
                                                {isVisible ? secret : maskedSecret}
                                          </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={onToggleVisibility}
                                          >
                                                {isVisible ? (
                                                      <EyeOff className="h-4 w-4" />
                                                ) : (
                                                      <Eye className="h-4 w-4" />
                                                )}
                                          </Button>
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handleCopy}
                                          >
                                                {copied ? (
                                                      <Check className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                      <Copy className="h-4 w-4" />
                                                )}
                                          </Button>
                                    </div>
                              </div>

                              {/* Previous secret grace period */}
                              {hasPreviousSecret && previousSecretExpiresAt && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                          <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                                          <p className="text-xs text-blue-700 dark:text-blue-300">
                                                {t("webhooks.previousSecretActive") ||
                                                      "Previous secret is still valid until"}{" "}
                                                <strong>
                                                      {format(
                                                            new Date(previousSecretExpiresAt),
                                                            "MMM d, yyyy 'at' HH:mm"
                                                      )}
                                                </strong>
                                          </p>
                                          <Badge
                                                variant="outline"
                                                className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                                          >
                                                {t("webhooks.gracePeriod") || "Grace Period"}
                                          </Badge>
                                    </div>
                              )}
                        </CardContent>
                  </Card>

                  {/* Rotate confirmation dialog */}
                  <AlertDialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
                        <AlertDialogContent>
                              <AlertDialogHeader>
                                    <AlertDialogTitle>
                                          {t("webhooks.rotateSecretTitle") || "Rotate Signing Secret"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                          {t("webhooks.rotateSecretDesc") ||
                                                "A new secret will be generated. The old secret will remain valid for 24 hours to allow time for updating your integration. After 24 hours, only the new secret will be accepted."}
                                    </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                    <AlertDialogCancel>
                                          {t("common.cancel") || "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                          onClick={() => {
                                                onRotate();
                                                setRotateDialogOpen(false);
                                          }}
                                    >
                                          {t("webhooks.rotateSecretConfirm") || "Rotate Secret"}
                                    </AlertDialogAction>
                              </AlertDialogFooter>
                        </AlertDialogContent>
                  </AlertDialog>
            </>
      );
}
