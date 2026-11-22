"use client";

import React from "react";
import type { AcademyOperationalMetrics } from "../../domain/entities/AcademyAnalytics";
import { Activity, CheckCircle, Filter, Layers, Trophy, Users } from "lucide-react";

interface AnalyticsKpiCardsProps {
  metrics: AcademyOperationalMetrics | null;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function AnalyticsKpiCards({ metrics, t }: AnalyticsKpiCardsProps) {
  const cards = [
    {
      key: "registered",
      label: t("kpi.registeredAthletes"),
      detail: metrics ? `${metrics.uniqueAthletesWithEnrollments} ${t("kpi.withEnrollments")}` : "",
      value: metrics?.totalRegisteredAthletes,
      icon: Users,
    },
    {
      key: "active",
      label: t("kpi.activeEnrollments"),
      detail: t("kpi.activeEnrollmentsSub"),
      value: metrics?.activeEnrollmentsCount,
      icon: CheckCircle,
    },
    {
      key: "unique",
      label: t("kpi.uniqueAthletes"),
      detail: t("kpi.uniqueAthletesSub"),
      value: metrics?.totalUniqueAthletes,
      icon: Activity,
    },
    {
      key: "multi-sport",
      label: t("kpi.multiSport"),
      detail: t("kpi.multiSportSub"),
      value: metrics?.multiSportAthletesCount,
      icon: Trophy,
    },
    {
      key: "capacity",
      label: t("kpi.groupCapacity"),
      detail: t("kpi.groupCapacitySub"),
      value: metrics ? `${metrics.groupCapacityUtilization.averageFillRatePercent.toFixed(1)}%` : undefined,
      icon: Layers,
    },
    {
      key: "trials",
      label: t("kpi.trialConversion"),
      detail: t("kpi.trialConversionSub"),
      value: metrics ? `${metrics.trialFunnel.conversionRatePercent.toFixed(1)}%` : undefined,
      icon: Filter,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map(({ key, label, detail, value, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-nx-raised border border-nx-line text-nx-accent flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-bold text-nx-ink-3 uppercase tracking-wider">
              {label}
            </div>
            <div className="text-2xl font-black text-nx-ink font-mono mt-0.5">
              {value ?? "—"}
            </div>
            <div className="text-[10px] text-nx-ink-3 mt-1 font-medium min-h-4">
              {value === undefined ? "" : detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
