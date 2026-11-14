"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission, usePermissions } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyOverviewViewModel } from "../viewmodels/useAcademyOverviewViewModel";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  GraduationCap,
  Layers,
  Users,
  ClipboardCheck,
  CheckSquare,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Calendar,
  CreditCard,
  UserCheck,
  UserPlus,
  BarChart3,
  Zap,
  ChevronDown,
  ListOrdered,
  Gauge,
  MapPin,
} from "lucide-react";

export function AcademyOverviewView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_OVERVIEW_VIEW);
  const { has } = usePermissions();
  const locator = useAcademyServiceLocator();
  const { state, refreshing, refresh } = useAcademyOverviewViewModel(locator.overviewRepository);
  const [showOperationsMenu, setShowOperationsMenu] = useState(false);

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">
            {t("academyOverview.unauthorized.title") || "Access Restricted"}
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            {t("academyOverview.unauthorized.description") ||
              "You do not have permission to view the Academy command center, or the Academy capability pack is not active for this tenant."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state.stage === "loading") {
    return (
      <div className="flex h-96 items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (state.stage === "failed" && state.error) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">
            {t("academyOverview.errors.loadFailed") || "Failed to load Academy overview"}
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            <p className="mb-3">{state.error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refresh()}
              disabled={refreshing}
              className="gap-2 text-xs border-nx-line hover:border-[#c8ff05]"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {t("academyOverview.errors.retry") || "Retry Connection"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const attentionItems = [
    {
      title: t("academyOverview.attention.missingAttendance") || "Sessions Missing Attendance",
      count: "3 sessions (Today)",
      icon: Calendar,
      iconColor: "text-[#ff6672] bg-[#ff6672]/10 border-[#ff6672]/30",
      href: "/academy/attendance",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW,
    },
    {
      title: t("academyOverview.attention.pendingTrials") || "Pending Trial Decisions",
      count: `${state.pendingTrialsCount ?? 7} ${isAr ? "رياضيين في التجربة" : "trial athletes"}`,
      icon: UserCheck,
      iconColor: "text-[#e5be42] bg-[#e5be42]/10 border-[#e5be42]/30",
      href: "/academy/trials",
      permission: ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW,
    },
    {
      title: t("academyOverview.attention.overdueFees") || "Overdue Fees",
      count: "4 invoices • $8,450",
      icon: CreditCard,
      iconColor: "text-[#ff6672] bg-[#ff6672]/10 border-[#ff6672]/30",
      href: "/academy/fees-receivables",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW,
    },
    {
      title: t("academyOverview.attention.groupsNearCapacity") || "Groups Near Capacity",
      count: "2 groups (≥ 90%)",
      icon: Users,
      iconColor: "text-[#e5be42] bg-[#e5be42]/10 border-[#e5be42]/30",
      href: "/academy/groups",
      permission: ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW,
    },
    {
      title: t("academyOverview.attention.coachReplacement") || "Coach Replacement Needed",
      count: "1 upcoming session",
      icon: UserCheck,
      iconColor: "text-[#e5be42] bg-[#e5be42]/10 border-[#e5be42]/30",
      href: "/academy/sessions",
      permission: ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW,
    },
  ];

  const enrollmentBreakdown = [
    {
      label: t("academyOverview.enrollmentCapacity.activeEnrollments") || "Active Enrollments",
      value: state.activeEnrollmentsCount ?? 284,
      icon: Users,
    },
    {
      label: t("academyOverview.enrollmentCapacity.trialEnrollments") || "Trial Enrollments",
      value: state.pendingTrialsCount ?? 17,
      icon: ClipboardCheck,
    },
    {
      label: t("academyOverview.enrollmentCapacity.pendingPayment") || "Pending Payment",
      value: 11,
      icon: CreditCard,
    },
    {
      label: t("academyOverview.enrollmentCapacity.waitlist") || "Waitlist",
      value: 9,
      icon: ListOrdered,
    },
    {
      label: t("academyOverview.enrollmentCapacity.groupsNearFull") || "Groups Near Full (≥ 90%)",
      value: 2,
      icon: Gauge,
    },
  ];

  const todaySessions = [
    { time: "4:00 PM", session: "Football (Soccer)", group: "U12 - Alpha", loc: "QA Field Alpha" },
    { time: "5:30 PM", session: "Football (Soccer)", group: "U14 - Beta", loc: "QA Field Alpha" },
    { time: "6:00 PM", session: "Multi-Sport", group: "U10 - Fundamentals", loc: "Main Hall" },
    { time: "7:30 PM", session: "Football (Soccer)", group: "U16 - Elite", loc: "QA Field Beta" },
  ];

  const workflows = [
    {
      title: t("academyOverview.quickActions.setupProgram") || "Programs & Offerings",
      desc: t("academyOverview.quickActions.setupProgramDesc") || "Define sports, age criteria, and curriculum levels.",
      icon: Layers,
      href: "/academy/programs",
      permission: ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.intakeAthlete") || "Athletes & Families",
      desc: t("academyOverview.quickActions.intakeAthleteDesc") || "Register and manage youth and adult athletes and their guardians.",
      icon: Users,
      href: "/academy/athletes",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ATHLETES_VIEW,
    },
    {
      title: t("academyOverview.quickActions.scheduleTrial") || "Trials & Evaluations",
      desc: t("academyOverview.quickActions.scheduleTrialDesc") || "Assess prospective athletes and manage skill trials.",
      icon: ClipboardCheck,
      href: "/academy/trials",
      permission: ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.manageEnrollments") || "Student Enrollments",
      desc: t("academyOverview.quickActions.manageEnrollmentsDesc") || "Review registrations, active terms, and billing handoffs.",
      icon: CheckSquare,
      href: "/academy/enrollments",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.manageGroups") || "Training Groups & Rosters",
      desc: t("academyOverview.quickActions.manageGroupsDesc") || "Organize athletes into cohorts with coach assignments.",
      icon: Users,
      href: "/academy/groups",
      permission: ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.sportsSetup") || "Academy Sports Setup",
      desc: t("academyOverview.quickActions.sportsSetupDesc") || "Activate canonical sports and manage disciplines for your academy.",
      icon: Activity,
      href: "/academy/setup/sports",
      permission: ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW,
    },
  ];

  return (
    <div className="w-full space-y-5 p-6 text-white dark:text-white" dir={dir}>
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8ff05]/40 bg-[#14171a] text-[#c8ff05] shadow-[0_0_12px_rgba(200,255,5,0.15)] shrink-0">
            <GraduationCap className="h-6 w-6 text-[#c8ff05]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white dark:text-white">
              {t("academyOverview.title") || "Academy Operations Command Center"}
            </h1>
            <p className="text-xs text-[#9aa1a6] mt-0.5">
              {t("academyOverview.description") ||
                "Operate multi-sport programs, enrollments, attendance, and delivery."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setShowOperationsMenu(!showOperationsMenu)}
              aria-expanded={showOperationsMenu}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1c2024] px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#c8ff05]" />
              <span>{isAr ? "عمليات متعددة الرياضات" : "Multi-Sport Operations"}</span>
              <ChevronDown className="h-3 w-3 text-[#9aa1a6]" />
            </button>

            {showOperationsMenu && (
              <div
                role="menu"
                aria-label="Academy Operations Directory"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-[#2a3033] bg-[#14171a] shadow-2xl p-2 z-50 divide-y divide-[#222629] rtl:right-auto rtl:left-0"
              >
                {workflows
                  .filter((wf) => !wf.permission || has(wf.permission as any))
                  .map((wf) => (
                    <Link
                      key={wf.title}
                      href={wf.href}
                      role="menuitem"
                      onClick={() => setShowOperationsMenu(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1c2024] text-xs font-semibold text-white transition-colors"
                    >
                      <span>{wf.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#9aa1a6] rtl:rotate-180" />
                    </Link>
                  ))}
              </div>
            )}
          </div>

          <button
            onClick={() => refresh()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1c2024] px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-white ${refreshing ? "animate-spin" : ""}`} />
            <span>{t("academyOverview.actions.refresh") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 2. 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Programs (Highlighted with Signal Lime border & glow) */}
        <div className="rounded-xl border border-[#c8ff05] bg-[#101214] p-4 flex flex-col justify-between relative shadow-[0_0_16px_rgba(200,255,5,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9aa1a6]">
              {t("academyOverview.kpi.programs") || "Active Programs"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#14171a] border border-[#2a3033] text-[#9aa1a6]">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-3xl font-black text-white tracking-tight">
              {state.activeProgramsCount ?? 12}
            </p>
          </div>
          <p className="text-xs font-semibold text-[#c8ff05] flex items-center gap-1">
            ↑ +2 from last term
          </p>
        </div>

        {/* Card 2: Active Enrollments */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9aa1a6]">
              {t("academyOverview.kpi.enrollments") || "Active Enrollments"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#14171a] border border-[#2a3033] text-[#9aa1a6]">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-3xl font-black text-white tracking-tight">
              {state.activeEnrollmentsCount ?? 284}
            </p>
          </div>
          <p className="text-xs font-semibold text-[#c8ff05] flex items-center gap-1">
            ↑ +6% from last term
          </p>
        </div>

        {/* Card 3: Pending Trials */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9aa1a6]">
              {t("academyOverview.kpi.trials") || "Pending Trials"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#14171a] border border-[#2a3033] text-[#9aa1a6]">
              <ClipboardCheck className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-3xl font-black text-white tracking-tight">
              {state.pendingTrialsCount ?? 7}
            </p>
          </div>
          <p className="text-xs font-medium text-[#9aa1a6]">
            — No change
          </p>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9aa1a6]">
              {t("academyOverview.kpi.attendanceRate") || "Attendance Rate"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#14171a] border border-[#2a3033] text-[#9aa1a6]">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-3xl font-black text-white tracking-tight">
              92%
            </p>
          </div>
          <p className="text-xs font-semibold text-[#c8ff05] flex items-center gap-1">
            ↑ +3 pp from last term
          </p>
        </div>

        {/* Card 5: Outstanding Receivables */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9aa1a6]">
              {t("academyOverview.kpi.receivables") || "Outstanding Receivables"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#14171a] border border-[#2a3033] text-[#9aa1a6]">
              <CreditCard className="size-3.5" />
            </div>
          </div>
          <div className="my-1.5">
            <p className="text-3xl font-black text-white tracking-tight">
              $24,800
            </p>
          </div>
          <p className="text-xs font-semibold text-[#ff6672] flex items-center gap-1">
            ↑ +18% from last term
          </p>
        </div>
      </div>

      {/* 3. Needs Attention Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#e5be42]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              {t("academyOverview.attention.title") || "Needs Attention"}
            </h2>
            <span className="rounded-full bg-[#c8ff05] text-black font-extrabold text-[11px] px-2 py-0.5 leading-none">
              5
            </span>
          </div>
          <Link
            href="/academy/attendance"
            className="text-xs font-semibold text-[#9aa1a6] hover:text-[#c8ff05] flex items-center gap-1 transition-colors"
          >
            <span>{t("academyOverview.attention.viewAll") || "View All"}</span>
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {attentionItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between rounded-xl border border-[#222629] bg-[#101214] hover:bg-[#14171a] hover:border-[#353b40] p-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${item.iconColor}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-[#c8ff05] transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#9aa1a6] truncate">
                      {item.count}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#9aa1a6] shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. 3-Column Operational Workspace (Schedule, Capacity, Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Today's Schedule */}
        <div className="rounded-xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-[#222629]/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {t("academyOverview.todaySchedule.title") || "Today's Schedule"}
                </h3>
              </div>
              <Link
                href="/academy/sessions"
                className="text-xs font-semibold text-[#c8ff05] hover:underline flex items-center gap-1"
              >
                <span>{t("academyOverview.todaySchedule.viewSchedule") || "View Schedule"}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
            <p className="text-[11px] text-[#9aa1a6] mt-1.5 mb-3">
              {t("academyOverview.todaySchedule.subtitle") || "Upcoming sessions • Tue, Jan 28, 2026"}
            </p>

            {/* Table */}
            <div className="w-full text-xs">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-[#9aa1a6] tracking-wider pb-2 border-b border-[#222629]">
                <div className="col-span-3">{t("academyOverview.todaySchedule.time") || "Time"}</div>
                <div className="col-span-4">{t("academyOverview.todaySchedule.session") || "Session"}</div>
                <div className="col-span-2">{t("academyOverview.todaySchedule.group") || "Group"}</div>
                <div className="col-span-3">{t("academyOverview.todaySchedule.location") || "Location"}</div>
              </div>

              <div className="divide-y divide-[#222629]/50">
                {todaySessions.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-2.5 items-center">
                    <div className="col-span-3 font-bold text-white text-[11px]">{row.time}</div>
                    <div className="col-span-4 flex items-center gap-1.5 font-bold text-white text-[11px] truncate">
                      <span className="w-1 h-3.5 bg-[#c8ff05] rounded-full inline-block shrink-0" />
                      <span className="truncate">{row.session}</span>
                    </div>
                    <div className="col-span-2 text-[11px] text-[#9aa1a6] truncate">{row.group}</div>
                    <div className="col-span-3 flex items-center gap-1 text-[11px] text-[#9aa1a6] truncate">
                      <MapPin className="h-3 w-3 text-[#9aa1a6] shrink-0" />
                      <span className="truncate">{row.loc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Enrollment & Capacity */}
        <div className="rounded-xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-[#222629]/60">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {t("academyOverview.enrollmentCapacity.title") || "Enrollment & Capacity"}
                </h3>
              </div>
              <Link
                href="/academy/enrollments"
                className="text-xs font-semibold text-[#c8ff05] hover:underline flex items-center gap-1"
              >
                <span>{t("academyOverview.enrollmentCapacity.viewDetails") || "View Details"}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="divide-y divide-[#222629]/60 mt-2">
              {enrollmentBreakdown.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-2 text-[#9aa1a6]">
                      <Icon className="h-4 w-4 text-[#9aa1a6]" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-extrabold text-white text-sm">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Attendance Trend */}
        <div className="rounded-xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-[#222629]/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {t("academyOverview.attendanceTrend.title") || "Attendance Trend"}
                </h3>
              </div>
              <Link
                href="/academy/reports"
                className="text-xs font-semibold text-[#c8ff05] hover:underline flex items-center gap-1"
              >
                <span>{t("academyOverview.attendanceTrend.viewReports") || "View Reports"}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[11px] text-[#9aa1a6]">
                {t("academyOverview.attendanceTrend.subtitle") || "Attendance rate (last 8 weeks)"}
              </span>
              <span className="text-[11px] text-[#9aa1a6] font-medium">
                {t("academyOverview.attendanceTrend.target") || "Target: 90%"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1 mb-2">
              <span className="text-2xl font-black text-white">92%</span>
              <span className="inline-flex items-center gap-1 rounded bg-[#1e2800] border border-[#c8ff05]/40 px-2 py-0.5 text-xs font-bold text-[#c8ff05]">
                ↑ +3 pp
              </span>
            </div>

            {/* SVG Trend Chart */}
            <div className="relative w-full h-[145px] mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8ff05" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#c8ff05" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis gridlines & labels */}
                <g stroke="#222629" strokeDasharray="3 3">
                  <line x1="35" y1="15" x2="395" y2="15" />
                  <line x1="35" y1="42" x2="395" y2="42" />
                  <line x1="35" y1="69" x2="395" y2="69" />
                  <line x1="35" y1="96" x2="395" y2="96" />
                </g>

                <g className="text-[9px] fill-[#9aa1a6]" textAnchor="end">
                  <text x="30" y="18">100%</text>
                  <text x="30" y="45">95%</text>
                  <text x="30" y="72">90%</text>
                  <text x="30" y="99">85%</text>
                </g>

                {/* Shaded Area */}
                <path
                  d="M 50 82 Q 95 62 140 76 T 235 60 T 325 58 T 385 40 L 385 105 L 50 105 Z"
                  fill="url(#trendGradient)"
                />

                {/* Trend line */}
                <path
                  d="M 50 82 Q 95 62 140 76 T 235 60 T 325 58 T 385 40"
                  fill="none"
                  stroke="#c8ff05"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="50" cy="82" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="95" cy="67" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="140" cy="76" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="190" cy="65" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="235" cy="60" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="280" cy="64" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="325" cy="58" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />
                <circle cx="385" cy="40" r="3.5" fill="#c8ff05" stroke="#101214" strokeWidth="1.5" />

                {/* X-axis labels */}
                <g className="text-[8px] fill-[#9aa1a6]" textAnchor="middle">
                  <text x="50" y="122">Dec 7</text>
                  <text x="95" y="122">Dec 14</text>
                  <text x="140" y="122">Dec 21</text>
                  <text x="190" y="122">Dec 28</text>
                  <text x="235" y="122">Jan 4</text>
                  <text x="280" y="122">Jan 11</text>
                  <text x="325" y="122">Jan 18</text>
                  <text x="385" y="122">Jan 25</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Actions Strip */}
      <div className="rounded-xl border border-[#222629] bg-[#101214] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#14171a] border border-[#2a3033] text-[#c8ff05] shrink-0">
            <Zap className="size-4 text-[#c8ff05]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {t("academyOverview.quickActions.sectionTitle") || "Quick Actions"}
            </div>
            <div className="text-xs text-[#9aa1a6]">
              {t("academyOverview.quickActions.sectionDesc") || "Common operational tasks for today."}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* New Athlete Intake */}
          <Link href="/academy/athletes">
            <Button
              size="sm"
              className="bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold border-0 gap-2 text-xs h-9 px-4 rounded-lg shadow-sm shadow-[#c8ff05]/20 cursor-pointer"
            >
              <UserPlus className="size-3.5 text-black stroke-[3]" />
              {t("academyOverview.quickActions.newIntake") || "New Athlete Intake"}
            </Button>
          </Link>

          {/* Record Attendance */}
          <Link href="/academy/attendance">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-9 px-3.5 rounded-lg border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-white font-semibold cursor-pointer"
            >
              <CheckSquare className="size-3.5 text-[#9aa1a6]" />
              {t("academyOverview.quickActions.recordAttendance") || "Record Attendance"}
            </Button>
          </Link>

          {/* Create Session */}
          <Link href="/academy/sessions">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-9 px-3.5 rounded-lg border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-white font-semibold cursor-pointer"
            >
              <Calendar className="size-3.5 text-[#9aa1a6]" />
              {t("academyOverview.quickActions.createSession") || "Create Session"}
            </Button>
          </Link>

          {/* Create Program */}
          <Link href="/academy/programs">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-9 px-3.5 rounded-lg border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-white font-semibold cursor-pointer"
            >
              <Layers className="size-3.5 text-[#9aa1a6]" />
              {t("academyOverview.quickActions.createProgram") || "Create Program"}
            </Button>
          </Link>
        </div>
      </div>



      {/* Empty State when tenant has no items */}
      {state.stage === "empty" && (
        <Card className="border border-[#222629] bg-[#101214] rounded-xl">
          <CardContent className="p-8">
            <EmptyState
              icon={GraduationCap}
              title={t("academyOverview.empty.title") || "Welcome to SCRIPE Academy"}
              description={
                t("academyOverview.empty.description") ||
                "Your academy is active. Begin by configuring your multi-sport programs, seasonal offerings, and intake rosters."
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="pt-2 pb-1 text-xs text-[#9aa1a6]">
        © 2026 SCRIPE Academy. All rights reserved.
      </div>
    </div>
  );
}
