"use client";

import React from "react";
import { AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { HealthIncident } from "../../domain/entities/PlatformHealth";

interface RecentIncidentsSectionProps {
  incidents?: HealthIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

/**
 * RecentIncidentsSection
 */
export function RecentIncidentsSection({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
}: RecentIncidentsSectionProps) {
  const { t } = useI18n();

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-nx-ink">
              {t("platformHealth.incidents.title") || "Recent Incidents & Degradations"}
            </h2>
            <p className="text-xs text-nx-ink-3">
              {t("platformHealth.incidents.subtitle") ||
                "Latest platform incidents, maintenance, and performance issues"}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-nx-ink-3">
          {incidents.length} {incidents.length === 1 ? "notice" : "notices"}
        </span>
      </div>

      {/* Incident List */}
      <div className="flex flex-col gap-2">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-nx-ink">No Recent Incidents</h3>
            <p className="max-w-[250px] text-xs text-nx-ink-3">
              Platform services are operating normally with no recent degradations or outages.
            </p>
          </div>
        ) : (
          incidents.map((inc) => {
            const isSelected = selectedIncidentId === inc.id;
            const statusLower = inc.status.toLowerCase();
            const isInvestigating = statusLower === "investigating" || statusLower === "degraded";
            const isResolved = statusLower === "resolved";

            const detectedTime = new Date(inc.detectedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-primary/50 bg-nx-raised"
                    : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-raised/40"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* Timeline dot */}
                  <div className="flex shrink-0 flex-col items-center">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isInvestigating
                          ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          : isResolved
                            ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                            : "bg-info shadow-[0_0_8px_rgba(14,165,233,0.7)]"
                      }`}
                    />
                    <span className="mt-1 font-mono text-[10.5px] text-nx-ink-3">
                      {detectedTime}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-nx-ink transition-colors group-hover:text-primary">
                      {inc.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-nx-ink-3">
                      <span className="font-medium text-nx-ink-3">
                        {t("platformHealth.incidents.affectedService") || "Affected"}:
                      </span>{" "}
                      <span className="font-mono text-[11px] text-nx-ink/80">
                        {inc.affectedService}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Pill & Arrow */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${
                      isInvestigating
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : isResolved
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-info/30 bg-info/10 text-info"
                    }`}
                  >
                    {isInvestigating
                      ? t("platformHealth.incidents.statusInvestigating") || "Investigating"
                      : isResolved
                        ? t("platformHealth.incidents.statusResolved") || "Resolved"
                        : t("platformHealth.incidents.statusCompleted") || "Completed"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-nx-ink-3 transition-all group-hover:translate-x-0.5 group-hover:text-nx-ink rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
