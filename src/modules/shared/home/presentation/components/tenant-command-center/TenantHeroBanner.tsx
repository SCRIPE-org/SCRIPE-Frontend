"use client";

import React from "react";
import { Building2, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantMetaPill, TenantReadinessCheck } from "./tenantTypes";

interface TenantHeroBannerProps {
  tenantName: string;
  readinessPercent: number;
  setupStepsCompleted: number;
  setupStepsTotal: number;
  metaPills: TenantMetaPill[];
  readinessChecks: TenantReadinessCheck[];
}

function renderPillIcon(icon: string) {
  switch (icon) {
    case "branches":
      return <Building2 className="h-3.5 w-3.5 text-nx-accent shrink-0" />;
    case "admins":
      return <Users className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
    case "plan":
      return <ShieldCheck className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    case "healthy":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />;
    default:
      return <span className="shrink-0">{icon}</span>;
  }
}

export function TenantHeroBanner({
  tenantName,
  readinessPercent,
  setupStepsCompleted,
  setupStepsTotal,
  metaPills,
  readinessChecks,
}: TenantHeroBannerProps) {
  const { t } = useI18n();

  const isReady = readinessPercent >= 100;
  const heroTitle = isReady
    ? t("tenantCommandCenter.hero.title") || "Your organization is ready to operate."
    : t("tenantCommandCenter.hero.titleInProgress") || "Complete your organization setup.";
  const heroSubtitle = isReady
    ? t("tenantCommandCenter.hero.subtitle") ||
      "Everything you need to manage your workspace, products and people — in one place."
    : t("tenantCommandCenter.hero.subtitleInProgress") ||
      "Finish the essential setup steps below to unlock your full operational capabilities.";

  return (
    <Card className="relative min-h-[170px] overflow-hidden p-5 sm:p-6 lg:p-7 border border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro">
      {/* Subtle Tactical Architectural Background Lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 1200 260"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="stroke-nx-line" strokeWidth="1" fill="none">
          <line x1="0" y1="40" x2="1200" y2="40" strokeDasharray="4 4" />
          <line x1="0" y1="120" x2="1200" y2="120" strokeDasharray="4 4" />
          <line x1="0" y1="200" x2="1200" y2="200" strokeDasharray="4 4" />
          <line x1="300" y1="0" x2="300" y2="260" strokeDasharray="4 4" />
          <line x1="600" y1="0" x2="600" y2="260" strokeDasharray="4 4" />
          <line x1="900" y1="0" x2="900" y2="260" strokeDasharray="4 4" />
          <circle cx="600" cy="130" r="45" />
          <rect x="180" y="55" width="840" height="150" rx="6" />
        </g>
      </svg>

      {/* Hero Content Grid (Container-Aware) */}
      <div className="hero-container-layout relative z-10 min-w-0">
        {/* Left: Organization Title & Badges */}
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-nx-accent truncate">
            {tenantName}
          </div>
          <h1 className="mb-1.5 mt-1 text-xl sm:text-2xl lg:text-[26px] font-bold leading-tight tracking-tight text-nx-ink">
            {heroTitle}
          </h1>
          <p className="max-w-2xl text-xs sm:text-[13px] text-nx-ink-3 leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
            {metaPills.map((pill, idx) => (
              <div
                key={idx}
                className="flex h-8 items-center gap-1.5 rounded-nx-md border border-nx-line bg-nx-raised px-2.5 text-xs text-nx-ink-2 min-w-0"
              >
                {renderPillIcon(pill.icon)}
                <span className="truncate">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Readiness Ring Card */}
        <aside className="rounded-nx-md border border-nx-line bg-nx-raised/40 p-4 min-w-0 w-full backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* SVG Conic Readiness Ring */}
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--nx-accent) 0 ${readinessPercent}%, color-mix(in srgb, var(--nx-line) 60%, transparent) ${readinessPercent}% 100%)`,
              }}
            >
              <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-nx-surface">
                <span className="text-[11px] font-mono font-bold text-nx-ink">
                  {readinessPercent}%
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <b className="block text-xs font-semibold text-nx-ink truncate">
                {t("tenantCommandCenter.hero.readiness") || "Organization readiness"}
              </b>
              <span className="block text-[11px] text-nx-ink-3 truncate">
                {t("tenantCommandCenter.hero.stepsComplete", {
                  completed: setupStepsCompleted,
                  total: setupStepsTotal,
                }) ||
                  `${setupStepsCompleted} of ${setupStepsTotal} essential setup steps are complete.`}
              </span>
            </div>
          </div>

          <div className="mt-3.5 space-y-2 border-t border-nx-line pt-2.5">
            {readinessChecks.map((chk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-[11px] text-nx-ink-2 min-w-0"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    chk.status === "success"
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                />
                <span className="truncate">{chk.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Card>
  );
}
