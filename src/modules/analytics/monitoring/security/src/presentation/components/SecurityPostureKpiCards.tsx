"use client";

import React, { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { ShieldCheck, KeyRound, Laptop, ShieldAlert } from "lucide-react";
import type { SecurityPostureKpis } from "../../domain/entities/SecurityEntities";

interface SecurityPostureKpiCardsProps {
  kpis: SecurityPostureKpis;
  isLoading: boolean;
  cardClasses?: string;
}

export const SecurityPostureKpiCards = memo(function SecurityPostureKpiCards({
  kpis,
  isLoading,
  cardClasses,
}: SecurityPostureKpiCardsProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="status"
        aria-label={t("common.loading") || "Loading KPIs..."}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} isLoading label="" value="" className={cardClasses} />
        ))}
      </div>
    );
  }

  // 1. Auth Health Rate Tone
  const authTone: StatTone =
    kpis.authHealthRate >= 95
      ? "success"
      : kpis.authHealthRate >= 85
      ? "warning"
      : "danger";

  // 2. MFA Coverage Tone
  const mfaTone: StatTone =
    kpis.mfaAdoptionRate >= 70
      ? "success"
      : kpis.mfaAdoptionRate >= 40
      ? "warning"
      : "neutral";

  // 3. Active Sessions Tone
  const sessionsTone: StatTone = "info";

  // 4. Failed Logins Tone
  const failedTone: StatTone = kpis.failedLoginsCount > 0 ? "danger" : "success";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-live="polite">
      {/* 1. Authentication Health Rate */}
      <StatCard
        label={t("security.kpis.authHealthRate") || "Auth Health Rate"}
        value={`${kpis.authHealthRate}%`}
        subtitle={
          t("security.kpis.authHealthDesc", { count: kpis.totalAuthentications }) ||
          `${kpis.totalAuthentications.toLocaleString()} logins evaluated`
        }
        icon={ShieldCheck}
        tone={authTone}
        className={cardClasses}
      />

      {/* 2. MFA Coverage */}
      <StatCard
        label={t("security.kpis.mfaCoverage") || "MFA Coverage"}
        value={`${kpis.mfaAdoptionRate}%`}
        subtitle={
          t("security.kpis.mfaCoverageDesc", {
            enrolled: kpis.mfaEnabledCount,
            total: kpis.totalAdmins,
          }) || `${kpis.mfaEnabledCount} of ${kpis.totalAdmins} eligible admins`
        }
        icon={KeyRound}
        tone={mfaTone}
        className={cardClasses}
      />

      {/* 3. Active Sessions */}
      <StatCard
        label={t("security.kpis.activeSessions") || "Active Sessions"}
        value={kpis.activeSessionsCount.toString()}
        subtitle={
          t("security.kpis.activeSessionsDesc") || "Live authenticated admin sessions"
        }
        icon={Laptop}
        tone={sessionsTone}
        className={cardClasses}
      />

      {/* 4. Failed Logins & Interceptions */}
      <StatCard
        label={t("security.kpis.failedLogins") || "Failed Logins & Blocks"}
        value={kpis.failedLoginsCount.toString()}
        subtitle={
          t("security.kpis.failedLoginsDesc", { count: kpis.securityEventsCount }) ||
          `${kpis.securityEventsCount} security events recorded`
        }
        icon={ShieldAlert}
        tone={failedTone}
        className={cardClasses}
      />
    </div>
  );
});
