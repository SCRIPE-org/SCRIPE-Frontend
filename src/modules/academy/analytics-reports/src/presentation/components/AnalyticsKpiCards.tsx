"use client";

import React from "react";
import type { AcademyOperationalMetrics } from "../../domain/entities/AcademyAnalytics";

interface AnalyticsKpiCardsProps {
  metrics: AcademyOperationalMetrics | null;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function AnalyticsKpiCards({ metrics, t }: AnalyticsKpiCardsProps) {
  const uniqueAthletes = metrics?.totalUniqueAthletes ?? 0;
  const registeredAthletes = metrics?.totalRegisteredAthletes ?? 0;
  const uniqueWithEnrollments = metrics?.uniqueAthletesWithEnrollments ?? 0;
  const activeEnrollments = metrics?.activeEnrollmentsCount ?? 0;
  const totalEnrollments = metrics?.totalEnrollmentsCount ?? 0;
  const multiSport = metrics?.multiSportAthletesCount ?? 0;
  const avgFillRate = metrics?.groupCapacityUtilization?.averageFillRatePercent ?? 0;
  const trialConversion = metrics?.trialFunnel?.conversionRatePercent ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Active Unique Athletes */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.uniqueAthletes")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-ink">
              {uniqueAthletes}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {t("kpi.uniqueAthletesSub")}
        </p>
      </div>

      {/* 2. Registered Athletes */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.registeredAthletes")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-ink">
              {registeredAthletes}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {uniqueWithEnrollments} {t("kpi.withEnrollments")}
        </p>
      </div>

      {/* 3. Enrollments (Active / Total) */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.activeEnrollments")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-ink">
              {activeEnrollments}
            </span>
            <span className="text-xs font-mono text-nx-ink-3">
              / {totalEnrollments}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {t("kpi.activeEnrollmentsSub")}
        </p>
      </div>

      {/* 4. Multi-Sport Participation */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.multiSport")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-ink">
              {multiSport}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {t("kpi.multiSportSub")}
        </p>
      </div>

      {/* 5. Group Fill Rate */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.groupCapacity")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-accent">
              {avgFillRate.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {t("kpi.groupCapacitySub")}
        </p>
      </div>

      {/* 6. Trial Conversion Rate */}
      <div className="rounded-lg border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-nx-ink-3 uppercase tracking-wider">
            {t("kpi.trialConversion")}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-nx-ink">
              {trialConversion.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-nx-ink-3">
          {t("kpi.trialConversionSub")}
        </p>
      </div>
    </div>
  );
}
