"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Calendar, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAvailabilityViewModel } from "../viewmodels/useAvailabilityViewModel";

interface AvailabilityViewProps {
  resourceId?: string;
  resourceName?: string;
}

/**
 * Presentation view component for inspecting court and resource availability schedules.
 *
 * Provides a dedicated interface for reviewing operational blocks, operating hours,
 * and seamless deep-links into the unified Operations Calendar.
 */
export function AvailabilityView({
  resourceId,
  resourceName,
}: AvailabilityViewProps): React.JSX.Element {
  const { t } = useI18n();
  const { loading, error } = useAvailabilityViewModel();

  return (
    <div className="space-y-6">
      <Card className="border border-nx-line bg-nx-surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-nx-accent" />
              <CardTitle className="text-base font-semibold text-nx-ink">
                {resourceName
                  ? t("venue.availability.courtTitle", {
                      name: resourceName,
                      defaultValue: `Availability & Schedule: ${resourceName}`,
                    })
                  : t("venue.availability.title", {
                      defaultValue: "Court Availability & Operating Hours",
                    })}
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-2">
              {t("venue.availability.consolidatedBadge", {
                defaultValue: "Operations Integrated",
              })}
            </Badge>
          </div>
          <CardDescription className="text-xs text-nx-ink-2">
            {t("venue.availability.description", {
              defaultValue:
                "Real-time court availability, maintenance blocks, and booking schedules are managed directly in the Operations Calendar.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-nx-line bg-nx-raised/40 p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-nx-accent" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-nx-ink">
                  {t("venue.availability.unifiedCalloutTitle", {
                    defaultValue: "Looking to check slots or block time?",
                  })}
                </p>
                <p className="text-xs text-nx-ink-2">
                  {t("venue.availability.unifiedCalloutBody", {
                    defaultValue:
                      "Use the interactive 30-minute Operations Calendar to view live lane occupancy, identify conflict-free windows, or apply emergency maintenance closures.",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Link
                href={
                  resourceId
                    ? `/venue/calendar?courtId=${encodeURIComponent(resourceId)}`
                    : "/venue/calendar"
                }
              >
                <Button size="sm" className="gap-2">
                  <span>
                    {t("venue.availability.goToCalendar", {
                      defaultValue: "Open Operations Calendar",
                    })}
                  </span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
