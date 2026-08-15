"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";

/**
 * Route-segment error boundary for the (modules) group.
 *
 * The group's own layout.tsx (DashboardLayout — header, sidebar, nav) stays
 * mounted above this boundary, so a crash inside one workspace page never
 * takes the surrounding shell down with it. That is also why the wrapper
 * below is a partial height (60vh), not a full viewport: the header is still
 * on screen above it.
 */
export default function ModulesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    appLogger.error("[(modules) route error]", { message: error.message, digest: error.digest });
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
