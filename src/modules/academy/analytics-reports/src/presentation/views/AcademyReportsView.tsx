"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAcademyServiceLocator } from "@/modules/academy/di";
import { useAcademyReportsViewModel } from "../viewmodels/useAcademyReportsViewModel";
import { AnalyticsKpiCards } from "../components/AnalyticsKpiCards";
import { GroupCapacityTable } from "../components/GroupCapacityTable";
import { TrialFunnelCard } from "../components/TrialFunnelCard";
import { ReceivablesSnapshotCard } from "../components/ReceivablesSnapshotCard";
import { DeferredMetricsNotice } from "../components/DeferredMetricsNotice";
import { ExportDialog } from "../components/ExportDialog";
import { reportsEn, reportsAr } from "@/modules/academy/analytics-reports/locales";
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  PieChart,
  Users,
  Award,
  DollarSign
} from "lucide-react";

interface AcademyReportsViewProps {
  locale?: string;
}

export function AcademyReportsView({ locale = "en" }: AcademyReportsViewProps) {
  const locator = useAcademyServiceLocator();
  const repo = locator.analyticsRepository;
  const vm = useAcademyReportsViewModel(repo);

  const [currentLocale, setCurrentLocale] = useState<string>(locale);
  const [trendMetric, setTrendMetric] = useState<"enrollments" | "trials" | "active">("enrollments");
  const strings = currentLocale === "ar" ? reportsAr : reportsEn;

  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let val: any = strings;
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        return key;
      }
    }
    if (typeof val === "string" && options) {
      return Object.entries(options).reduce(
        (acc, [optKey, optVal]) => acc.replace(`{${optKey}}`, String(optVal)),
        val
      );
    }
    return typeof val === "string" ? val : key;
  };

  const isRtl = currentLocale === "ar";
  const isAr = currentLocale === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 text-nx-ink font-sans"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-nx-ink-3 mb-1">
            <Link href="/academy" className="hover:underline text-nx-ink-2">
              {isAr ? "لوحة الأكاديمية" : "Academy Operations"}
            </Link>
            <span>/</span>
            <span>{isAr ? "العمليات" : "Operations"}</span>
            <span>/</span>
            <span className="text-nx-ink font-bold">{isAr ? "التقارير والمؤشرات" : "Reports & KPIs"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-nx-surface to-nx-surface border border-nx-accent-fill/40 text-nx-accent shadow-lg">
              <BarChart2 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-nx-ink">
                {isAr ? "التقارير ومؤشرات الأداء الرئيسية" : "Reports & KPIs"}
              </h1>
              <p className="text-xs text-nx-ink-3 mt-0.5">
                {isAr
                  ? "تحليلات الأداء والعمليات عبر الاشتراكات والحضور ومعدلات التحويل والتحصيل والإيرادات."
                  : "Operational and performance analytics for the academy, across enrollments, attendance, conversion, collections, and revenue."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => vm.setIsExportDialogOpen(true)}
            className="rounded-lg bg-nx-accent-fill border border-nx-accent-fill px-4 py-2 text-xs font-bold text-nx-on-fill shadow-nx-glow hover:brightness-105 transition-all flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>{isAr ? "تصدير التقرير" : "Export Report"}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <button
            type="button"
            className="rounded-lg border border-nx-line-hi bg-nx-surface px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-nx-raised transition-colors flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-nx-accent" />
            <span>{isAr ? "جدولة التقرير" : "Schedule Report"}</span>
          </button>

          <button
            type="button"
            className="rounded-lg border border-nx-accent-fill/40 bg-nx-accent-fill/15 px-3.5 py-2 text-xs font-bold text-nx-accent flex items-center gap-1.5"
          >
            <span>📅 {isAr ? "الموسم الحالي" : "This Season"}</span>
            <span className="text-[10px] text-zinc-400 font-mono font-normal">Jul 1 – Dec 31, 2026</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <button
            type="button"
            className="rounded-lg border border-nx-accent-fill/40 bg-nx-accent-fill/15 px-3.5 py-2 text-xs font-bold text-nx-accent flex items-center gap-1.5"
          >
            <span>⚽ {isAr ? "جميع الرياضات" : "All Sports"}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentLocale(currentLocale === "en" ? "ar" : "en")}
            className="rounded-lg border border-nx-line bg-nx-surface px-2.5 py-2 text-xs font-bold text-nx-ink"
          >
            {currentLocale === "en" ? "العربية (AR)" : "English (EN)"}
          </button>
        </div>
      </div>

      {/* Governance & Source Truth Banner */}
      <div className="rounded-xl border border-nx-line bg-nx-surface p-3 text-xs text-nx-ink-2 flex items-center justify-between">
        <p className="leading-relaxed font-sans">{t("sourceNotice")}</p>
        <button
          onClick={() => vm.fetchMetrics()}
          disabled={vm.loading}
          className="text-xs font-bold text-nx-accent hover:underline flex items-center gap-1 shrink-0"
        >
          <RefreshCw className={`h-3 w-3 ${vm.loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث الآن" : "Refresh Now"}</span>
        </button>
      </div>

      {/* Top 5 KPI Cards */}
      <AnalyticsKpiCards metrics={vm.metrics} t={t} />

      {/* Analytics Visual Grid: Trends, Attendance by Sport, Revenue, Funnel, Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (approx 7 cols): Trends */}
        <div className="lg:col-span-7 space-y-5">
          {/* Enrollment Trend */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-nx-ink flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-nx-accent" />
                  <span>{isAr ? "اتجاه الاشتراكات بمرور الوقت" : "Enrollment Trend"}</span>
                </h3>
                <p className="text-[11px] text-nx-ink-3">
                  {isAr ? "إجمالي الاشتراكات عبر أشهر الموسم" : "Total enrollments over time"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-nx-surface p-0.5 border border-nx-line text-[11px] font-bold">
                  <button
                    onClick={() => setTrendMetric("enrollments")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      trendMetric === "enrollments" ? "bg-nx-accent-fill/15 text-nx-accent" : "text-nx-ink-3"
                    }`}
                  >
                    Enrollments
                  </button>
                  <button
                    onClick={() => setTrendMetric("trials")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      trendMetric === "trials" ? "bg-nx-accent-fill/15 text-nx-accent" : "text-nx-ink-3"
                    }`}
                  >
                    Trials
                  </button>
                  <button
                    onClick={() => setTrendMetric("active")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      trendMetric === "active" ? "bg-nx-accent-fill/15 text-nx-accent" : "text-nx-ink-3"
                    }`}
                  >
                    Active
                  </button>
                </div>

                <span className="text-xs font-bold text-nx-ink-3 bg-nx-raised px-2.5 py-1 rounded-lg border border-nx-line">
                  Monthly ▾
                </span>
              </div>
            </div>

            {/* Simulated Line Chart Canvas */}
            <div className="h-44 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c6ff00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#c6ff00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="var(--nx-line, #2a3033)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="var(--nx-line, #2a3033)" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="var(--nx-line, #2a3033)" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d="M 20 110 Q 150 95, 270 70 T 520 30 L 520 130 L 20 130 Z"
                  fill="url(#enrollGrad)"
                />
                {/* Smooth Curve */}
                <path
                  d="M 20 110 Q 150 95, 270 70 T 520 30"
                  fill="none"
                  stroke="#c6ff00"
                  strokeWidth="3"
                />
                {/* Points */}
                <circle cx="20" cy="110" r="4" fill="#c6ff00" />
                <circle cx="120" cy="98" r="4" fill="#c6ff00" />
                <circle cx="220" cy="85" r="4" fill="#c6ff00" />
                <circle cx="320" cy="72" r="4" fill="#c6ff00" />
                <circle cx="420" cy="55" r="4" fill="#c6ff00" />
                <circle cx="520" cy="30" r="5" fill="#c6ff00" />
              </svg>

              {/* Data Tooltip at end */}
              <div className="absolute right-12 top-2 bg-nx-surface border border-nx-accent-fill/40 px-2 py-1 rounded-lg text-[10px] font-bold text-nx-accent shadow-lg">
                Dec 2026: 1,126 (+7.4%)
              </div>

              {/* Month Axis */}
              <div className="flex justify-between text-[10px] text-nx-ink-3 font-mono pt-2 border-t border-nx-line mt-2">
                <span>Jul 2026</span>
                <span>Aug 2026</span>
                <span>Sep 2026</span>
                <span>Oct 2026</span>
                <span>Nov 2026</span>
                <span>Dec 2026</span>
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-nx-ink flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-nx-accent" />
                  <span>{isAr ? "اتجاه الإيرادات المالية (ريال)" : "Revenue Trend"}</span>
                </h3>
                <p className="text-[11px] text-nx-ink-3">
                  {isAr ? "الإيرادات المحصلة عبر المالية" : "Academy revenue over time (SAR / Finance Source)"}
                </p>
              </div>

              <span className="text-xs font-bold text-nx-ink-3 bg-nx-raised px-2.5 py-1 rounded-lg border border-nx-line">
                Monthly ▾
              </span>
            </div>

            <div className="h-36 w-full relative pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c6ff00" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#c6ff00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="600" y2="20" stroke="var(--nx-line, #2a3033)" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="var(--nx-line, #2a3033)" strokeDasharray="3 3" />

                <path
                  d="M 20 90 Q 180 80, 300 60 T 520 20 L 520 110 L 20 110 Z"
                  fill="url(#revGrad)"
                />
                <path
                  d="M 20 90 Q 180 80, 300 60 T 520 20"
                  fill="none"
                  stroke="#c6ff00"
                  strokeWidth="2.5"
                />
                <circle cx="520" cy="20" r="5" fill="#c6ff00" />
              </svg>

              <div className="absolute right-12 top-1 bg-nx-surface border border-nx-accent-fill/40 px-2 py-1 rounded-lg text-[10px] font-bold text-nx-accent">
                Dec 2026: SAR 265,750 (+8.9%)
              </div>

              <div className="flex justify-between text-[10px] text-nx-ink-3 font-mono pt-2 border-t border-nx-line mt-2">
                <span>Jul 2026</span>
                <span>Aug 2026</span>
                <span>Sep 2026</span>
                <span>Oct 2026</span>
                <span>Nov 2026</span>
                <span>Dec 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (approx 5 cols): Attendance by Sport, Funnel, Participation */}
        <div className="lg:col-span-5 space-y-5">
          {/* Attendance by Sport */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-nx-ink flex items-center gap-2">
                <Users className="h-4 w-4 text-nx-accent" />
                <span>{isAr ? "معدل الحضور حسب الرياضة" : "Attendance by Sport"}</span>
              </h3>
              <p className="text-[11px] text-nx-ink-3">
                {isAr ? "نسبة الحضور وعدد الحصص" : "Attendance rate and sessions count"}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { sport: "Football", emoji: "⚽", rate: 94.2, count: 432 },
                { sport: "Swimming", emoji: "≋", rate: 92.6, count: 208 },
                { sport: "Padel", emoji: "◉", rate: 90.8, count: 196 },
                { sport: "Basketball", emoji: "◈", rate: 89.1, count: 128 },
                { sport: "Gymnastics", emoji: "♧", rate: 87.9, count: 96 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-nx-ink flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.sport}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-nx-ink">
                      {item.rate}% <span className="text-[10px] text-nx-ink-3 font-normal">({item.count})</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-nx-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00]"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Conversion Funnel */}
          <TrialFunnelCard funnel={vm.metrics?.trialFunnel} t={t} />

          {/* Sport Participation Breakdown */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-nx-ink flex items-center gap-2">
                <PieChart className="h-4 w-4 text-nx-accent" />
                <span>{isAr ? "توزيع المشاركة الرياضية" : "Sport Participation"}</span>
              </h3>
              <p className="text-[11px] text-nx-ink-3">
                {isAr ? "نسبة المشاركين عبر الرياضات" : "Athlete distribution across sports"}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative size-28 shrink-0 rounded-full border-8 border-nx-accent-fill flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-black text-nx-ink font-mono leading-none">1,126</div>
                  <div className="text-[9px] text-nx-ink-3 font-medium">Enrollments</div>
                </div>
              </div>

              <div className="flex-1 space-y-1 text-xs">
                {[
                  { sport: "Football", pct: "45.5%", count: 512, color: "#c6ff00" },
                  { sport: "Swimming", pct: "20.2%", count: 228, color: "#95bd00" },
                  { sport: "Padel", pct: "17.4%", count: 196, color: "#6a8700" },
                  { sport: "Basketball", pct: "8.7%", count: 98, color: "#e5be42" },
                  { sport: "Gymnastics", pct: "8.2%", count: 92, color: "#73adff" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-nx-ink-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.sport}</span>
                    </span>
                    <span className="font-mono text-nx-ink-3 text-[11px]">
                      {s.count} <span className="text-nx-accent font-bold">({s.pct})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Alerts & Insights (4 Alert Cards) */}
      <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-nx-ink flex items-center gap-2">
              <span className="text-nx-accent">🔔</span>
              <span>{isAr ? "أهم التنبيهات والرؤى التشغيلية" : "Top Alerts & Insights"}</span>
            </h3>
            <p className="text-[11px] text-nx-ink-3">
              {isAr ? "مؤشرات وتنبيهات الأداء المباشرة لهذا الموسم" : "Key operational signals and performance insights for this season"}
            </p>
          </div>
          <span className="text-xs font-bold text-nx-accent hover:underline cursor-pointer flex items-center gap-1">
            <span>{isAr ? "عرض جميع الرؤى" : "View All Insights"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/15 flex items-start gap-3">
            <span className="text-lg text-warning shrink-0">⚠️</span>
            <div className="text-xs">
              <div className="font-bold text-warning">12 trial enrollments pending</div>
              <div className="text-[11px] text-zinc-300 mt-0.5">Review and convert to improve acquisition.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-start gap-3">
            <span className="text-lg text-nx-accent shrink-0">📅</span>
            <div className="text-xs">
              <div className="font-bold text-nx-ink">3 sessions low attendance</div>
              <div className="text-[11px] text-nx-ink-3 mt-0.5">Attendance: 66%, 62%, 58%.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 flex items-start gap-3">
            <span className="text-lg text-nx-accent shrink-0">📈</span>
            <div className="text-xs">
              <div className="font-bold text-nx-accent">Football enrollments up +18.4%</div>
              <div className="text-[11px] text-zinc-300 mt-0.5">+80 enrollments vs. last season.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/15 flex items-start gap-3">
            <span className="text-lg text-warning shrink-0">💳</span>
            <div className="text-xs">
              <div className="font-bold text-warning">SAR 264,750 pending payments</div>
              <div className="text-[11px] text-zinc-300 mt-0.5">76 enrollments · Follow up for collection.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Datasets: Group Capacity & Authoritative Receivables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <GroupCapacityTable
            groups={vm.metrics?.groupCapacityUtilization?.groups || []}
            locale={currentLocale}
            t={t}
          />
        </div>

        <div className="lg:col-span-5">
          <ReceivablesSnapshotCard
            financialReceivables={vm.metrics?.financialReceivables}
            t={t}
          />
        </div>
      </div>

      {/* Codex S5/S6 Deferred Seam */}
      <DeferredMetricsNotice
        deferred={vm.metrics?.deferredCodexMetrics}
        t={t}
      />

      {/* CSV Export Dialog */}
      <ExportDialog
        isOpen={vm.isExportDialogOpen}
        onClose={() => vm.setIsExportDialogOpen(false)}
        onDownload={vm.handleDownloadExport}
        t={t}
      />
    </div>
  );
}
