/**
 * WebhookSecretPanel
 *
 * Displays the HMAC-SHA256 signing secret with copy and rotate functionality.
 *
 * IMPORTANT: The backend ALWAYS masks the secret on GET responses
 * (returns "****<last8chars>"). The full secret is only returned on:
 *   - Create (initial response)
 *   - RotateSecret (rotation response)
 *
 * So this panel shows the masked fingerprint for identification,
 * and provides a "rotate" action that reveals the new full secret.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
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
      Info,
} from "lucide-react";
import { format } from "date-fns";
import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
} from "@core/ui/tooltip";

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

      // Determine if the secret is masked (from GET) vs full (from Create/Rotate)
      const isMasked = secret.startsWith("****");

      // Build display value:
      // - If masked (from backend GET): show dots + last chars when hidden, raw when visible
      // - If full (from Create/Rotate): show dots when hidden, full when visible
      const displayValue = (() => {
            if (isMasked) {
                  // Backend already masked: "****abcdefgh"
                  if (isVisible) return secret; // Show the masked fingerprint
                  return "•".repeat(32); // Fully hidden
            }
            // Full secret available (just created or rotated)
            if (isVisible) return secret;
            return "•".repeat(40) + secret.slice(-4);
      })();

      const handleCopy = useCallback(() => {
            // Only copy the actual secret value — never copy dots
            navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
      }, [secret]);

      return (
            <>
                  <Card>
                        <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Shield className="h-4 w-4" />
                                          </div>
                                          <div>
                                                <CardTitle className="text-base">
                                                      {t("webhooks.secret") || "Signing Secret"}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-0.5">
                                                      {t("webhooks.secretDescription") ||
                                                            "Used to sign webhook payloads with HMAC-SHA256."}
                                                </CardDescription>
                                          </div>
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
                        </CardHeader>
                        <CardContent className="space-y-3">
                              {/* Secret display row */}
                              <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                          <Input
                                                readOnly
                                                value={displayValue}
                                                className="font-mono text-sm pe-24 bg-muted/30 border-muted select-all cursor-default"
                                          />
                                          <div className="absolute inset-y-0 end-0 flex items-center gap-0.5 pe-1.5">
                                                {/* Show/Hide toggle */}
                                                <TooltipProvider>
                                                      <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                  <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={onToggleVisibility}
                                                                  >
                                                                        {isVisible ? (
                                                                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                                                        ) : (
                                                                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                                        )}
                                                                  </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                  {isVisible ? "Hide" : "Reveal"}
                                                            </TooltipContent>
                                                      </Tooltip>
                                                </TooltipProvider>

                                                {/* Copy button */}
                                                <TooltipProvider>
                                                      <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                  <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={handleCopy}
                                                                  >
                                                                        {copied ? (
                                                                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                        ) : (
                                                                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                                                        )}
                                                                  </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                  {copied ? "Copied!" : "Copy"}
                                                            </TooltipContent>
                                                      </Tooltip>
                                                </TooltipProvider>
                                          </div>
                                    </div>
                              </div>

                              {/* Info note when secret is masked */}
                              {isMasked && (
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                          <p>
                                                {t("webhooks.secretMaskedNote") ||
                                                      "For security, the full secret is only shown when first created or after rotation. Use \"Rotate Secret\" to generate and reveal a new secret."}
                                          </p>
                                    </div>
                              )}

                              {/* Previous secret grace period */}
                              {hasPreviousSecret && previousSecretExpiresAt && (
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                          <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                                          <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
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
                                                className="text-xs bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shrink-0"
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
                                                "A new secret will be generated. The old secret will remain valid for 24 hours to allow time for updating your integration."}
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
