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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  AcademyPageHeader,
  IconTile,
  LightStreak,
  AcademyPill,
} from "@modules/academy/shared";
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
  ListOrdered,
  Gauge,
  MapPin,
  ChevronDown,
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
              className="gap-2 text-xs border-nx-line hover:border-nx-accent"
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
      iconColor: "text-destructive bg-destructive/10 border-destructive/30",
      href: "/academy/attendance",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW,
    },
    {
      title: t("academyOverview.attention.pendingTrials") || "Pending Trial Decisions",
      count: `${state.pendingTrialsCount ?? 7} ${isAr ? "رياضيين في التجربة" : "trial athletes"}`,
      icon: UserCheck,
      iconColor: "text-warning bg-warning/10 border-warning/30",
      href: "/academy/trials",
      permission: ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW,
    },
    {
      title: t("academyOverview.attention.overdueFees") || "Overdue Fees",
      count: "4 invoices • $8,450",
      icon: CreditCard,
      iconColor: "text-destructive bg-destructive/10 border-destructive/30",
      href: "/academy/fees-receivables",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW,
    },
    {
      title: t("academyOverview.attention.groupsNearCapacity") || "Groups Near Capacity",
      count: "2 groups (≥ 90%)",
      icon: Users,
      iconColor: "text-warning bg-warning/10 border-warning/30",
      href: "/academy/groups",
      permission: ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW,
    },
    {
      title: t("academyOverview.attention.coachReplacement") || "Coach Replacement Needed",
      count: "1 upcoming session",
      icon: UserCheck,
      iconColor: "text-warning bg-warning/10 border-warning/30",
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
    <div className="w-full space-y-6 p-6 text-nx-ink academy-bg" dir={dir}>
      {/* 1. Header */}
      <AcademyPageHeader
        title={t("academyOverview.title") || "Academy Operations Command Center"}
        description={
          t("academyOverview.description") ||
          "Operate multi-sport programs, enrollments, attendance, and delivery."
        }
        icon={GraduationCap}
        actions={
          <>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOperationsMenu(!showOperationsMenu)}
                aria-expanded={showOperationsMenu}
                aria-haspopup="true"
                className="gap-2 text-xs font-semibold border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
              >
                <ShieldCheck className="size-3.5 text-nx-accent" />
                <span>{isAr ? "عمليات متعددة الرياضات" : "Multi-Sport Operations"}</span>
                <ChevronDown className="size-3 text-nx-ink-2" />
              </Button>

              {showOperationsMenu && (
                <div
                  role="menu"
                  aria-label="Academy Operations Directory"
                  className="absolute right-0 mt-2 w-64 rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-popover p-2 z-50 divide-y divide-nx-line/50 rtl:right-auto rtl:left-0"
                >
                  {workflows
                    .filter((wf) => !wf.permission || has(wf.permission as any))
                    .map((wf) => (
                      <Link
                        key={wf.title}
                        href={wf.href}
                        role="menuitem"
                        onClick={() => setShowOperationsMenu(false)}
                        className="flex items-center justify-between p-2 rounded-nx-control hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors"
                      >
                        <span>{wf.title}</span>
                        <ArrowRight className="size-3.5 text-nx-ink-2 rtl:rotate-180" />
                      </Link>
                    ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={refreshing}
              className="gap-2 text-xs font-semibold border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{t("academyOverview.actions.refresh") || "Refresh"}</span>
            </Button>
          </>
        }
      />

      {/* 2. 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Programs (Highlighted with Signal Lime card-glow & kpi-accent) */}
        <div className="card-glass card-glow kpi-accent p-4 flex flex-col justify-between relative">
          <LightStreak />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("academyOverview.kpi.programs") || "Active Programs"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm bg-nx-raised border border-nx-line text-nx-accent">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">
              {state.activeProgramsCount ?? 12}
            </p>
          </div>
          <p className="text-xs font-semibold text-nx-accent flex items-center gap-1">
            ↑ +2 from last term
          </p>
        </div>

        {/* Card 2: Active Enrollments */}
        <div className="card-glass p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("academyOverview.kpi.enrollments") || "Active Enrollments"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">
              {state.activeEnrollmentsCount ?? 284}
            </p>
          </div>
          <p className="text-xs font-semibold text-nx-accent flex items-center gap-1">
            ↑ +6% from last term
          </p>
        </div>

        {/* Card 3: Pending Trials */}
        <div className="card-glass p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("academyOverview.kpi.trials") || "Pending Trials"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2">
              <ClipboardCheck className="size-3.5" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">
              {state.pendingTrialsCount ?? 7}
            </p>
          </div>
          <p className="text-xs font-medium text-nx-ink-3">
            — No change
          </p>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="card-glass p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("academyOverview.kpi.attendanceRate") || "Attendance Rate"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">
              92%
            </p>
          </div>
          <p className="text-xs font-semibold text-nx-accent flex items-center gap-1">
            ↑ +3 pp from last term
          </p>
        </div>

        {/* Card 5: Outstanding Receivables */}
        <div className="card-glass p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("academyOverview.kpi.receivables") || "Outstanding Receivables"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-nx-sm bg-nx-raised border border-nx-line text-nx-ink-2">
              <CreditCard className="size-3.5" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">
              $24,800
            </p>
          </div>
          <p className="text-xs font-semibold text-destructive flex items-center gap-1">
            ↑ +18% from last term
          </p>
        </div>
      </div>

      {/* 3. Needs Attention Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />
            <h2 className="text-sm font-bold text-nx-ink tracking-tight">
              {t("academyOverview.attention.title") || "Needs Attention"}
            </h2>
            <AcademyPill variant="lime">
              5
            </AcademyPill>
          </div>
          <Link
            href="/academy/attendance"
            className="text-xs font-semibold text-nx-ink-2 hover:text-nx-accent flex items-center gap-1 transition-colors"
          >
            <span>{t("academyOverview.attention.viewAll") || "View All"}</span>
            <ArrowRight className="size-3 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {attentionItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between card-glass p-3 transition-all cursor-pointer hover:border-nx-line-hi hover:bg-nx-raised"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-nx-control border ${item.iconColor}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-nx-ink-2 truncate">
                      {item.count}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-nx-ink-3 shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. 3-Column Operational Workspace (Schedule, Capacity, Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Today's Schedule */}
        <div className="card-glass p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-nx-accent" />
                <h3 className="text-sm font-bold text-nx-ink">
                  {t("academyOverview.todaySchedule.title") || "Today's Schedule"}
                </h3>
              </div>
              <Link
                href="/academy/sessions"
                className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1"
              >
                <span>{t("academyOverview.todaySchedule.viewSchedule") || "View Schedule"}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Link>
            </div>
            <p className="text-[11px] text-nx-ink-2 mt-1.5 mb-3">
              {t("academyOverview.todaySchedule.subtitle") || "Upcoming sessions • Tue, Jan 28, 2026"}
            </p>

            {/* Table */}
            <div className="w-full text-xs">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-nx-ink-3 tracking-wider pb-2 border-b border-nx-line">
                <div className="col-span-3">{t("academyOverview.todaySchedule.time") || "Time"}</div>
                <div className="col-span-4">{t("academyOverview.todaySchedule.session") || "Session"}</div>
                <div className="col-span-2">{t("academyOverview.todaySchedule.group") || "Group"}</div>
                <div className="col-span-3">{t("academyOverview.todaySchedule.location") || "Location"}</div>
              </div>

              <div className="divide-y divide-nx-line/40">
                {todaySessions.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-2.5 items-center hover:bg-nx-raised/40 transition-colors">
                    <div className="col-span-3 font-bold text-nx-ink text-[11px]">{row.time}</div>
                    <div className="col-span-4 flex items-center gap-1.5 font-bold text-nx-ink text-[11px] truncate">
                      <span className="w-1 h-3.5 bg-nx-accent-fill rounded-full inline-block shrink-0" />
                      <span className="truncate">{row.session}</span>
                    </div>
                    <div className="col-span-2 text-[11px] text-nx-ink-2 truncate">{row.group}</div>
                    <div className="col-span-3 flex items-center gap-1 text-[11px] text-nx-ink-2 truncate">
                      <MapPin className="size-3 text-nx-ink-3 shrink-0" />
                      <span className="truncate">{row.loc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Enrollment & Capacity */}
        <div className="card-glass p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-nx-accent" />
                <h3 className="text-sm font-bold text-nx-ink">
                  {t("academyOverview.enrollmentCapacity.title") || "Enrollment & Capacity"}
                </h3>
              </div>
              <Link
                href="/academy/enrollments"
                className="text-xs font-semibold text-nx-accent hover:underline flex items-center gap-1"
              >
                <span>{t("academyOverview.enrollmentCapacity.viewEnrollments") || "View Enrollments"}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Link>
            </div>
            <p className="text-[11px] text-nx-ink-2 mt-1.5 mb-3">
              {t("academyOverview.enrollmentCapacity.subtitle") || "Active term capacity utilization"}
            </p>

            <div className="space-y-2.5">
              {enrollmentBreakdown.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 text-nx-ink-2">
                      <Icon className="size-3.5 text-nx-ink-3" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-bold text-nx-ink">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-nx-line">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-nx-ink-2 text-[11px]">Total Capacity Reached</span>
              <span className="font-bold text-nx-accent text-xs">84%</span>
            </div>
            <div className="w-full bg-nx-raised h-2 rounded-full overflow-hidden border border-nx-line/50">
              <div className="bg-nx-accent-fill h-full rounded-full transition-all duration-500" style={{ width: "84%" }} />
            </div>
          </div>
        </div>

        {/* Column 3: Quick Workflows */}
        <div className="card-glass p-4 flex flex-col justify-between min-h-[310px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-nx-accent" />
                <h3 className="text-sm font-bold text-nx-ink">
                  {t("academyOverview.quickActions.title") || "Operational Workflows"}
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-nx-ink-2 mt-1.5 mb-3">
              Direct access to sovereign Academy modules
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { title: "Configure Programs & Tracks", desc: "Define sports, age criteria, and curriculum levels.", icon: Layers, href: "/academy/programs", perm: ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW },
                { title: "Register Athlete Intake", desc: "Register and manage youth and adult athletes.", icon: Users, href: "/academy/athletes", perm: ACADEMY_PERMISSIONS.ACADEMY_ATHLETES_VIEW },
                { title: "Schedule Skill Assessment", desc: "Assess prospective athletes and manage skill trials.", icon: ClipboardCheck, href: "/academy/trials", perm: ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW },
                { title: "Manage Cohort Rosters", desc: "Review registrations, active terms, and billing handoffs.", icon: CheckSquare, href: "/academy/enrollments", perm: ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW },
              ]
                .filter((qa) => !qa.perm || has(qa.perm as any))
                .map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <Link
                      key={qa.title}
                      href={qa.href}
                      className="group flex items-center justify-between p-2.5 rounded-nx-control border border-nx-line/60 bg-nx-surface hover:bg-nx-raised hover:border-nx-line-hi transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-nx-sm bg-nx-raised text-nx-accent border border-nx-line">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors truncate">
                            {qa.title}
                          </p>
                          <p className="text-[10px] text-nx-ink-2 truncate">
                            {qa.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="size-3 text-nx-ink-3 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
