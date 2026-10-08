/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Clock, Layers } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { HealthIncident } from "../../domain/entities/PlatformHealth";

interface IncidentDetailPanelProps {
  incident: HealthIncident | null;
  isLoading?: boolean;
}

/**
 * IncidentDetailPanel
 */
export function IncidentDetailPanel({
  incident,
  isLoading = false,
}: IncidentDetailPanelProps) {
  const { t } = useI18n();

  if (!incident) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col items-center justify-center text-center min-h-[280px]">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {t("platformHealth.incidents.noActiveIncidentsTitle") || "No Active Incidents"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          {t("platformHealth.incidents.noActiveIncidentsDesc") ||
            "All monitored services and external dependencies are operating within normal parameters."}
        </p>
      </div>
    );
  }

  const isInvestigating =
    incident.status.toLowerCase() === "investigating" ||
    incident.status.toLowerCase() === "degraded";
  const isResolved = incident.status.toLowerCase() === "resolved";

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              isInvestigating
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {isInvestigating ? (
              <AlertCircle className="h-4.5 w-4.5" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {t("platformHealth.incidents.detailsTitle") || "Incident Details"}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(incident.detectedAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
            isInvestigating
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
              : isResolved
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-sky-500/15 text-sky-400 border-sky-500/30"
          }`}
        >
          {incident.status}
        </span>
      </div>

      {/* Incident Title & Meta */}
      <div>
        <h3 className="text-base font-bold text-foreground leading-snug">
          {incident.title}
        </h3>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {t("platformHealth.incidents.summary") || "Summary"}
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {incident.description}
        </p>
      </div>

      {/* Affected Service & Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            {t("platformHealth.incidents.affectedService") || "Affected Service"}
          </div>
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>{incident.affectedService}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            {t("platformHealth.incidents.impact") || "Operational Impact"}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            {incident.impact || "Standard operational latency threshold exceeded."}
          </p>
        </div>
      </div>

      {/* Investigation Timeline */}
      <div className="pt-2 border-t border-border/60">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {t("platformHealth.incidents.timeline") || "Investigation Timeline"}
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Detected:</span>{" "}
              <span className="text-muted-foreground">
                Automated health probe logged status change at{" "}
                {new Date(incident.detectedAt).toLocaleTimeString()}.
              </span>
            </div>
          </div>
          {incident.resolvedAt && (
            <div className="flex items-start gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-400">Resolved:</span>{" "}
                <span className="text-muted-foreground">
                  Metrics returned to normal operating limits at{" "}
                  {new Date(incident.resolvedAt).toLocaleTimeString()}.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
