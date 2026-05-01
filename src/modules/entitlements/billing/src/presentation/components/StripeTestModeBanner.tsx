/**
 * StripeTestModeBanner (E-07)
 *
 * A prominent banner displayed when the platform is using Stripe test keys.
 * Uses @core/ui components exclusively per NEXORA UI rules.
 *
 * Detection: reads NEXT_PUBLIC_STRIPE_TEST_MODE env var.
 * Set to "true" in development/staging, omit or "false" in production.
 */
"use client";

import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

const isStripeTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";

export function StripeTestModeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();

  if (!isStripeTestMode || dismissed) return null;

  return (
    <Alert className="relative border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("billing.testMode.label") || "Stripe Test Mode"}</AlertTitle>
      <AlertDescription>
        {t("billing.testMode.description") ||
          "Payments are simulated. No real charges will be made. Switch to live keys for production."}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDismissed(true)}
        className="absolute end-2 top-2 h-7 w-7 opacity-60 hover:bg-amber-500/20 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </Alert>
  );
}
