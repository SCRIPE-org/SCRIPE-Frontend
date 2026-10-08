"use client";

import React from "react";
import { AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { HealthIncident } from "../../domain/entities/PlatformHealth";

interface RecentIncidentsSectionProps {
  incidents?: HealthIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

export function RecentIncidentsSection({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
}: RecentIncidentsSectionProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {t("platformHealth.incidents.title") || "Recent Incidents & Degradations"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("platformHealth.incidents.subtitle") ||
                "Latest platform incidents, maintenance, and performance issues"}
            </p>
          </div>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {incidents.length} {incidents.length === 1 ? "notice" : "notices"}
        </span>
      </div>

      {/* Incident List */}
      <div className="flex flex-col gap-2">
        {incidents.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No Recent Incidents
            </h3>
            <p className="text-xs text-muted-foreground max-w-[250px]">
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
                className={`group flex items-center justify-between gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/70 border-primary/50 shadow-xs"
                    : "bg-card/70 border-border/70 hover:bg-accent/40 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isInvestigating
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                          : isResolved
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          : "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"
                      }`}
                    />
                    <span className="text-[10.5px] font-mono text-muted-foreground mt-1">
                      {detectedTime}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {inc.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      <span className="text-muted-foreground font-medium">
                        {t("platformHealth.incidents.affectedService") || "Affected"}:
                      </span>{" "}
                      <span className="text-foreground/80 font-mono text-[11px]">
                        {inc.affectedService}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Pill & Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      isInvestigating
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : isResolved
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                    }`}
                  >
                    {isInvestigating
                      ? t("platformHealth.incidents.statusInvestigating") || "Investigating"
                      : isResolved
                      ? t("platformHealth.incidents.statusResolved") || "Resolved"
                      : t("platformHealth.incidents.statusCompleted") || "Completed"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
