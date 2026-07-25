"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";

/**
 * Route-segment error boundary for /plugins/[installationId].
 *
 * This route renders InstalledPluginDetailView, which embeds a third-party
 * plugin's own UI through the PluginFrame postMessage bridge — code this app
 * does not control. That makes it the single most likely uncaught failure
 * point in the app, so it gets its own boundary: a crash here is contained to
 * this one route instead of taking down the whole workspace shell. This file
 * is a sibling of the page, not a change to PluginFrame or its postMessage
 * origin checks — the frame's security boundary is untouched.
 */
export default function PluginDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    appLogger.error("[plugins/[installationId] route error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-nx-ground p-4">
      <ErrorMessage message={t("common.error")} onRetry={reset} />

      <Button variant="ghost" size="sm" asChild className="mt-3">
        <Link href="/">
          <Home className="me-2 h-4 w-4" aria-hidden="true" />
          {t("errors.boundary.home")}
        </Link>
      </Button>
    </div>
  );
}
