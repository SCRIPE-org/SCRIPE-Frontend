"use client";

import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";

interface Props {
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Documentation for module export
 */
export function VenueOverviewRecentActivityDeferred({ t }: Props) {
  return (
    <div className="mt-6" data-testid="recent-activity-deferred">
      <Alert variant="info" className="bg-nx-surfaceSubtle/60 border-nx-line text-xs text-nx-ink-2">
        <Info className="size-4 text-nx-accent" aria-hidden="true" />
        <AlertDescription className="text-xs">
          {t("venueOverview.deferred.recentActivity")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
