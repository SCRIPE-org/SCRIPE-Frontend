"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";

/**
 * Route-segment error boundary for the (studio) group.
 *
 * The studio layout does not use DashboardLayout — the studio IS the full
 * viewport — so the crash screen fills the viewport itself rather than a
 * partial-height slot inside a persistent shell.
 */
export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    appLogger.error("[(studio) route error]", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nx-ground p-4">
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
