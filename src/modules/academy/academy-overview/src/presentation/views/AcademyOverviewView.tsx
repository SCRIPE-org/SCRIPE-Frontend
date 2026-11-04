"use client";

import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission, usePermissions } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyOverviewViewModel } from "../viewmodels/useAcademyOverviewViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  GraduationCap,
  Layers,
  Users,
  ClipboardCheck,
  CalendarDays,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function AcademyOverviewView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_OVERVIEW_VIEW);
  const { has } = usePermissions();
  const locator = useAcademyServiceLocator();
  const { state, refreshing, refresh } = useAcademyOverviewViewModel(locator.overviewRepository);

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
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">
            {t("academyOverview.errors.loadFailed") || "Failed to load Academy overview"}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-xs text-nx-ink-2">{state.error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2 text-xs"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {t("academyOverview.errors.retry") || "Retry Connection"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const workflows = [
    {
      title: t("academyOverview.quickActions.setupProgram") || "Configure Programs & Offerings",
      desc: t("academyOverview.quickActions.setupProgramDesc") || "Define sports, age criteria, and curriculum levels.",
      icon: Layers,
      href: "/academy/programs",
      permission: ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.intakeAthlete") || "Athletes & Families",
      desc: t("academyOverview.quickActions.intakeAthleteDesc") || "Search-before-create with PartyKernel deduplication.",
      icon: Users,
      href: "/academy/athletes",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.scheduleTrial") || "Trials & Evaluations",
      desc: t("academyOverview.quickActions.scheduleTrialDesc") || "Technical assessment before group placement.",
      icon: ClipboardCheck,
      href: "/academy/trials",
      permission: ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.manageGroups") || "Training Groups & Rosters",
      desc: t("academyOverview.quickActions.manageGroupsDesc") || "Cohort capacity and coach assignment rules.",
      icon: Users,
      href: "/academy/groups",
      permission: ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.viewSessions") || "Schedule & Sessions",
      desc: t("academyOverview.quickActions.viewSessionsDesc") || "Weekly sessions at external or internal venues.",
      icon: CalendarDays,
      href: "/academy/sessions",
      permission: ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW,
    },
    {
      title: t("academyOverview.quickActions.attendance") || "Attendance Register",
      desc: t("academyOverview.quickActions.attendanceDesc") || "Coach attendance capture with audit history.",
      icon: CheckSquare,
      href: "/academy/attendance",
      permission: ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW,
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-nx-raised border border-nx-line text-nx-ink">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {t("academyOverview.title") || "Academy Operations Command Center"}
              </h1>
              <p className="text-xs text-nx-ink-2">
                {t("academyOverview.description") ||
                  "Multi-Sport academy operations, athlete enrollment, training groups, sessions, and attendance."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 border-nx-line text-xs font-medium">
            <ShieldCheck className="size-3.5 text-nx-accent-fill" />
            {t("academyOverview.status.sprintNotice") || "Sprint 0 Architecture Baseline Verified"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="gap-2 text-xs border-nx-line"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            {t("academyOverview.errors.retry") || "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip — Live numbers from backend, no fake mock values */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border border-nx-line bg-nx-surface p-4">
          <p className="text-xs font-medium text-nx-ink-2">
            {t("academyOverview.kpi.programs") || "Active Programs"}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-nx-ink">
            {state.activeProgramsCount}
          </p>
          <p className="mt-1 text-[11px] text-nx-ink-3">
            {t("academyOverview.status.noPrograms") || "0 configured"}
          </p>
        </Card>
        <Card className="border border-nx-line bg-nx-surface p-4">
          <p className="text-xs font-medium text-nx-ink-2">
            {t("academyOverview.kpi.offerings") || "Term Offerings"}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-nx-ink">
            {state.activeOfferingsCount}
          </p>
          <p className="mt-1 text-[11px] text-nx-ink-3">S1 schedule delivery</p>
        </Card>
        <Card className="border border-nx-line bg-nx-surface p-4">
          <p className="text-xs font-medium text-nx-ink-2">
            {t("academyOverview.kpi.enrollments") || "Active Enrollments"}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-nx-ink">
            {state.activeEnrollmentsCount}
          </p>
          <p className="mt-1 text-[11px] text-nx-ink-3">S2 athlete intake</p>
        </Card>
        <Card className="border border-nx-line bg-nx-surface p-4">
          <p className="text-xs font-medium text-nx-ink-2">
            {t("academyOverview.kpi.trials") || "Pending Trials"}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-nx-ink">
            {state.pendingTrialsCount}
          </p>
          <p className="mt-1 text-[11px] text-nx-ink-3">S3 technical evaluation</p>
        </Card>
      </div>

      {/* Empty / Foundation State */}
      {state.stage === "empty" && (
        <Card className="border border-nx-line bg-nx-surface">
          <CardContent className="p-8">
            <EmptyState
              icon={GraduationCap}
              title={t("academyOverview.empty.title") || "Welcome to SCRIPE Academy"}
              description={
                t("academyOverview.empty.description") ||
                "Your academy foundation is active and verified. Programs, offerings, and athlete intake will unlock in Sprints 1–3."
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Workflows / Information Architecture Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide text-nx-ink uppercase">
          {t("academyOverview.quickActions.title") || "Academy Workflows"}
        </h2>
        {workflows.filter((wf) => !wf.permission || has(wf.permission as any)).length === 0 ? (
          <p className="text-xs text-nx-ink-3">
            {t("academyOverview.unauthorized.description") || "No authorized workflows available for your current role."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows
              .filter((wf) => !wf.permission || has(wf.permission as any))
              .map((wf) => {
                const Icon = wf.icon;
                return (
                  <Link
                    key={wf.title}
                    href={wf.href}
                    className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-nx-accent-fill rounded-md"
                  >
                    <Card className="h-full border border-nx-line bg-nx-surface transition-colors hover:border-nx-line-hi cursor-pointer">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex size-9 items-center justify-center rounded-md bg-nx-raised text-nx-ink">
                            <Icon className="size-4" />
                          </div>
                          <ArrowRight className="size-4 text-nx-ink-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                        </div>
                        <CardTitle className="mt-3 text-sm font-semibold text-nx-ink">
                          {wf.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-nx-ink-2">
                          {wf.desc}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
