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

import { useState, useCallback } from "react";
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
import { Eye, EyeOff, Copy, Check, RefreshCw, Shield, Clock, Info } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

interface WebhookSecretPanelProps {
  secret: string;
  hasPreviousSecret: boolean;
  previousSecretExpiresAt: string | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onRotate: () => void;
  isRotating: boolean;
}

/**
 * Presentation UI component rendering the webhook secret panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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

  // Display: dots when hidden, full secret when revealed
  const maskedDisplay = "•".repeat(40) + secret.slice(-4);
  const displayValue = isVisible ? secret : maskedDisplay;

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
              <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-info/10 text-info">
                <Shield className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">{t("webhooks.secret")}</CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  {t("webhooks.secretDescription")}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotateDialogOpen(true)}
              disabled={isRotating}
              loading={isRotating}
              className="gap-1.5"
            >
              {!isRotating && <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
              {t("webhooks.rotateSecret")}
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
                aria-label={t("webhooks.secret")}
                className="cursor-default select-all pe-24 font-mono text-sm"
              />
              <div className="absolute inset-y-0 end-0 flex items-center gap-0.5 pe-1.5">
                {/* Show/Hide toggle — same masking logic, only the accessible
                    name and glyph annotation changed (R3: a hardcoded English
                    TooltipContent is not an accessible name for an icon-only
                    control, and this one guards a live HMAC signing secret). */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onToggleVisibility}
                        aria-label={isVisible ? t("webhooks.secretHide") : t("webhooks.secretReveal")}
                      >
                        {isVisible ? (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isVisible ? t("webhooks.secretHide") : t("webhooks.secretReveal")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Copy button — copies the actual secret value only, never
                    the masking dots; unchanged from before. */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopy}
                        aria-label={copied ? t("webhooks.secretCopied") : t("webhooks.secretCopy")}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {copied ? t("webhooks.secretCopied") : t("webhooks.secretCopy")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Info note when secret is masked */}
          {isMasked && (
            <div className="flex items-start gap-2 text-xs text-nx-ink-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <p>{t("webhooks.secretMaskedNote")}</p>
            </div>
          )}

          {/* Previous secret grace period */}
          {hasPreviousSecret && previousSecretExpiresAt && (
            <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/10 px-3 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              <p className="flex-1 text-xs text-info">
                {t("webhooks.previousSecretActive")}{" "}
                <strong>{formatUtc(previousSecretExpiresAt, "MMM d, yyyy 'at' HH:mm")}</strong>
              </p>
              <Badge variant="info" className="shrink-0 text-xs">
                {t("webhooks.gracePeriod")}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rotate confirmation dialog */}
      <AlertDialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("webhooks.rotateSecretTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("webhooks.rotateSecretDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRotate();
                setRotateDialogOpen(false);
              }}
            >
              {t("webhooks.rotateSecretConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
