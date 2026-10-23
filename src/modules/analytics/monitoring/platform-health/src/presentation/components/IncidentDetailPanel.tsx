/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Clock, Layers } from "lucide-react";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { HealthIncident } from "../../domain/entities/PlatformHealth";

interface IncidentDetailPanelProps {
  incident: HealthIncident | null;
  isLoading?: boolean;
}

/**
 * IncidentDetailPanel
 */
export function IncidentDetailPanel({ incident, isLoading = false }: IncidentDetailPanelProps) {
  const { t } = useI18n();

  if (!incident) {
    return (
      <Card className="flex min-h-[280px] flex-col items-center justify-center border-nx-line bg-nx-surface p-6 text-center text-nx-ink">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-success/20 bg-success/10 text-success">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-nx-ink">
          {t("platformHealth.incidents.noActiveIncidentsTitle") || "No Active Incidents"}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-nx-ink-3">
          {t("platformHealth.incidents.noActiveIncidentsDesc") ||
            "All monitored services and external dependencies are operating within normal parameters."}
        </p>
      </Card>
    );
  }

  const isInvestigating =
    incident.status.toLowerCase() === "investigating" ||
    incident.status.toLowerCase() === "degraded";
  const isResolved = incident.status.toLowerCase() === "resolved";

  return (
    <Card className="flex flex-col gap-4 border-nx-line bg-nx-surface p-4 text-nx-ink sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
              isInvestigating
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-success/20 bg-success/10 text-success"
            }`}
          >
            {isInvestigating ? (
              <AlertCircle className="h-4.5 w-4.5" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-nx-ink">
              {t("platformHealth.incidents.detailsTitle") || "Incident Details"}
            </h2>
            <div className="flex items-center gap-1.5 font-mono text-xs text-nx-ink-3">
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
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
            isInvestigating
              ? "border-destructive/30 bg-destructive/15 text-destructive"
              : isResolved
                ? "border-success/30 bg-success/15 text-success"
                : "border-info/30 bg-info/15 text-info"
          }`}
        >
          {incident.status}
        </span>
      </div>

      {/* Incident Title & Meta */}
      <div>
        <h3 className="text-base font-bold leading-snug text-nx-ink">{incident.title}</h3>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-nx-line bg-nx-raised/40 p-3">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
          {t("platformHealth.incidents.summary") || "Summary"}
        </div>
        <p className="text-xs leading-relaxed text-nx-ink">{incident.description}</p>
      </div>

      {/* Affected Service & Impact */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-nx-line bg-nx-raised/40 p-3">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
            {t("platformHealth.incidents.affectedService") || "Affected Service"}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-nx-ink">
            <Layers className="h-4 w-4 text-primary" />
            <span>{incident.affectedService}</span>
          </div>
        </div>

        <div className="rounded-lg border border-nx-line bg-nx-raised/40 p-3">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
            {t("platformHealth.incidents.impact") || "Operational Impact"}
          </div>
          <p className="text-xs leading-snug text-nx-ink-3">
            {incident.impact || "Standard operational latency threshold exceeded."}
          </p>
        </div>
      </div>

      {/* Investigation Timeline */}
      <div className="border-t border-nx-line pt-2">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
          {t("platformHealth.incidents.timeline") || "Investigation Timeline"}
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div>
              <span className="font-semibold text-nx-ink">Detected:</span>{" "}
              <span className="text-nx-ink-3">
                Automated health probe logged status change at{" "}
                {new Date(incident.detectedAt).toLocaleTimeString()}.
              </span>
            </div>
          </div>
          {incident.resolvedAt && (
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-success" />
              <div>
                <span className="font-semibold text-success">Resolved:</span>{" "}
                <span className="text-nx-ink-3">
                  Metrics returned to normal operating limits at{" "}
                  {new Date(incident.resolvedAt).toLocaleTimeString()}.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
