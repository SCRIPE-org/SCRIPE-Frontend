"use client";

import React from "react";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { AlertCircle, ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";

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
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-nx-line/70 shadow-lg bg-nx-surface p-6 sm:p-8 text-center space-y-5">
        <div className="size-14 mx-auto rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-nx-ink tracking-tight">
            {title || t("guestPortal.errors.invalidOrExpiredTitle")}
          </h1>
          <p className="text-sm text-nx-ink-2 leading-relaxed">
            {description || t("guestPortal.errors.invalidOrExpiredDescription")}
          </p>
        </div>

        <div className="p-3.5 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/50 text-xs text-nx-ink-3">
          {t("guestPortal.errors.contactVenue")}
        </div>

        {onRetry && (
          <div className="pt-2 flex justify-center">
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
