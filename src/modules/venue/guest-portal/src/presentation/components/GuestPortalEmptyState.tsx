"use client";

import React from "react";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface GuestPortalEmptyStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function GuestPortalEmptyState({
  title,
  description,
  onRetry,
  t,
}: GuestPortalEmptyStateProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="border-nx-line/70 w-full max-w-md space-y-5 border bg-nx-surface p-6 text-center shadow-lg sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {title || t("guestPortal.errors.invalidOrExpiredTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-nx-ink-2">
            {description || t("guestPortal.errors.invalidOrExpiredDescription")}
          </p>
        </div>

        <div className="bg-nx-surfaceSubtle border-nx-line/50 rounded-nx-md border p-3.5 text-xs text-nx-ink-3">
          {t("guestPortal.errors.contactVenue")}
        </div>

        {onRetry && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
