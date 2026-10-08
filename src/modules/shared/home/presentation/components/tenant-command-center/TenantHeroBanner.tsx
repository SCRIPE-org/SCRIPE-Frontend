"use client";

import React from "react";
import { Building2, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

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
      return <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />;
    case "admins":
      return <Users className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
    case "plan":
      return <ShieldCheck className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
    case "healthy":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
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
    <section className="relative min-h-[180px] overflow-hidden rounded-2xl border border-border/70 bg-[#0b171e] text-white shadow-lg">
      {/* Background SVG Stadium Pitch Artwork */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
        viewBox="0 0 1400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#173047" />
            <stop offset=".55" stopColor="#d98163" />
            <stop offset="1" stopColor="#1f4939" />
          </linearGradient>
          <linearGradient id="fieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#214e35" />
            <stop offset="1" stopColor="#102a20" />
          </linearGradient>
          <filter id="floodGlow">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <rect width="1400" height="300" fill="url(#skyGrad)" />
        <circle cx="1070" cy="65" r="80" fill="#ffc67d" opacity=".26" filter="url(#floodGlow)" />
        <g fill="#0d1d28" opacity=".88">
          <rect x="0" y="138" width="1400" height="55" />
          <rect x="970" y="100" width="70" height="93" />
          <rect x="1070" y="118" width="100" height="75" />
          <rect x="1180" y="89" width="86" height="104" />
        </g>
        <g fill="#0b1d1b">
          <path d="M55 155q18-55 38 0h-11q-1 48-8 88H63q-8-42-8-88z" />
          <path d="M106 160q17-49 37 0h-11q-2 46-7 82h-10q-7-39-9-82z" />
          <path d="M1265 150q17-50 38 0h-11q-2 44-8 84h-10q-7-41-9-84z" />
        </g>
        <polygon points="0,185 1400,173 1400,300 0,300" fill="url(#fieldGrad)" />
        <g stroke="#d9ef8c" opacity=".55" fill="none">
          <rect x="595" y="190" width="570" height="104" />
          <line x1="880" y1="190" x2="880" y2="294" />
          <circle cx="880" cy="242" r="27" />
          <rect x="595" y="210" width="76" height="62" />
          <rect x="1089" y="210" width="76" height="62" />
        </g>
        <g stroke="#08151b" strokeWidth="5">
          <line x1="510" y1="55" x2="510" y2="210" />
          <line x1="1220" y1="20" x2="1220" y2="218" />
        </g>
        <g fill="#fff6c5">
          <circle cx="510" cy="55" r="5" />
          <circle cx="500" cy="58" r="3" />
          <circle cx="520" cy="58" r="3" />
          <circle cx="1220" cy="20" r="5" />
          <circle cx="1210" cy="23" r="3" />
          <circle cx="1230" cy="23" r="3" />
        </g>
      </svg>

      {/* Dark Vignette Overlay for Crisp Readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#040c12]/95 via-[#040c12]/80 to-[#040c12]/65" />

      {/* Hero Content Grid (Container-Aware) */}
      <div className="hero-container-layout relative z-10 p-4 sm:p-6 lg:p-7 min-w-0">
        {/* Left: Organization Title & Badges */}
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#c9ff43] truncate">
            {tenantName}
          </div>
          <h1 className="mb-1.5 mt-1 text-xl sm:text-2xl lg:text-[28px] font-extrabold leading-tight tracking-tight text-white">
            {heroTitle}
          </h1>
          <p className="max-w-2xl text-xs sm:text-[13px] text-[#c8d5dc] leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
            {metaPills.map((pill, idx) => (
              <div
                key={idx}
                className="border-white/12 flex h-8 items-center gap-1.5 rounded-lg border bg-[#061016]/70 px-2.5 text-[11px] text-[#e3edf2] backdrop-blur-md min-w-0"
              >
                {renderPillIcon(pill.icon)}
                <span className="truncate">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Readiness Ring Card */}
        <aside className="border-white/12 rounded-xl border bg-[#071118]/85 p-3.5 shadow-inner backdrop-blur-md min-w-0 w-full">
          <div className="flex items-center gap-2.5">
            {/* SVG Conic Readiness Ring */}
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#b8ee24 0 ${readinessPercent}%, rgba(255,255,255,0.12) ${readinessPercent}% 100%)`,
              }}
            >
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#0c1b23]">
                <span className="text-[10px] font-extrabold text-white">{readinessPercent}%</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <b className="block text-xs font-bold text-white truncate">
                {t("tenantCommandCenter.hero.readiness") || "Organization readiness"}
              </b>
              <span className="block text-[10px] text-[#b7c8d0] truncate">
                {t("tenantCommandCenter.hero.stepsComplete", {
                  completed: setupStepsCompleted,
                  total: setupStepsTotal,
                }) ||
                  `${setupStepsCompleted} of ${setupStepsTotal} essential setup steps are complete.`}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5">
            {readinessChecks.map((chk, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-[#d6e3e8] min-w-0">
                <span
                  className={`shadow-xs h-1.5 w-1.5 shrink-0 rounded-full ${
                    chk.status === "success"
                      ? "bg-[#5adb9d] shadow-[0_0_8px_rgba(90,219,157,0.5)]"
                      : "bg-[#f7aa1c] shadow-[0_0_8px_rgba(247,170,28,0.5)]"
                  }`}
                />
                <span className="truncate">{chk.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
