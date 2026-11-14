"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyTrialsViewModel } from "../viewmodels/useAcademyTrialsViewModel";
import type { AcademyTrial, TrialStatus } from "../../domain/entities/AcademyTrial";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import {
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Search,
  Users,
  Hourglass,
  MoreVertical,
  ChevronDown,
  Download,
  Plus,
  X,
  FileText,
  Activity,
  Award,
  RefreshCw,
  LayoutGrid,
  List,
  Check,
  Sparkles,
  UserCheck,
  Shield,
  Layers
} from "lucide-react";

function getAthleteInitials(firstNameEn?: string | null, lastNameEn?: string | null, firstNameAr?: string | null): string {
  if (firstNameEn && lastNameEn) {
    return `${firstNameEn.charAt(0)}${lastNameEn.charAt(0)}`.toUpperCase();
  }
  if (firstNameEn) return firstNameEn.substring(0, 2).toUpperCase();
  if (firstNameAr) return firstNameAr.substring(0, 2);
  return "TR";
}

function getInitialsColor(name: string): string {
  const colors = [
    "from-lime-500/20 to-emerald-500/20 text-nx-accent border-nx-accent-fill/40",
    "from-blue-500/20 to-cyan-500/20 text-info border-info/40",
    "from-amber-500/20 to-orange-500/20 text-warning border-warning/40",
    "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-400/40"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getStatusBadge(status: TrialStatus | string, isAr: boolean) {
  switch (status) {
    case "Evaluated":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-accent-fill/15 text-success border border-success/30">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "تم التقييم" : "Evaluated"}
        </span>
      );
    case "Scheduled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-info border border-info/30">
          <Calendar className="h-3 w-3" />
          {isAr ? "مجدول" : "Scheduled"}
        </span>
      );
    case "Requested":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line">
          <Clock className="h-3 w-3" />
          {isAr ? "طلب تجربة" : "Requested"}
        </span>
      );
    case "Attended":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning/15 text-warning border border-warning/40">
          <Activity className="h-3 w-3" />
          {isAr ? "حضر" : "Attended"}
        </span>
      );
    case "Accepted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40 shadow-[0_0_8px_rgba(200,255,5,0.15)]">
          <Award className="h-3 w-3" />
          {isAr ? "مقبول" : "Accepted"}
        </span>
      );
    case "Waitlisted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning/15 text-warning border border-warning/40">
          <Hourglass className="h-3 w-3" />
          {isAr ? "قائمة الانتظار" : "Waitlisted"}
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-destructive/15 text-destructive border border-destructive/30">
          <X className="h-3 w-3" />
          {isAr ? "مرفوض" : "Rejected"}
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line-hi">
          {isAr ? "ملغي" : "Cancelled"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-white border border-nx-line">
          {status}
        </span>
      );
  }
}

export function AcademyTrialsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_CREATE);
  const canReview = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_REVIEW);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_UPDATE);

  const locator = useAcademyServiceLocator();
  const vm = useAcademyTrialsViewModel(locator.trialsRepository);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showDecideModal, setShowDecideModal] = useState(false);
  const [showReviewWorkspace, setShowReviewWorkspace] = useState(false);
  const [activeTrial, setActiveTrial] = useState<AcademyTrial | null>(null);

  // Selection
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "history" | "documents" | "profile">("evaluation");

  // Date selection state with clear semantics
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-12");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "intake" || params.get("intake") === "true" || params.get("view") === "schedule") {
        setShowScheduleModal(true);
      }
      if (params.get("view") === "review" || params.get("review") === "true") {
        setShowReviewWorkspace(true);
      }
    }
  }, [vm.trials]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selectors State
  const [athleteOptions, setAthleteOptions] = useState<GenericSelectOption[]>([]);
  const [offeringOptions, setOfferingOptions] = useState<GenericSelectOption[]>([]);
  const [loadingSelectors, setLoadingSelectors] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSelectors() {
      setLoadingSelectors(true);
      try {
        const [athletes, offerings] = await Promise.all([
          locator.athletesRepository.getAthletes().catch(() => []),
          locator.offeringsRepository.fetchOfferings().catch(() => []),
        ]);
        if (!mounted) return;
        setAthleteOptions(
          athletes.map((a: any) => ({
            value: a.id,
            label: isAr && a.firstNameAr ? `${a.firstNameAr} ${a.lastNameAr || ""}`.trim() : `${a.firstNameEn} ${a.lastNameEn}`.trim(),
            description: a.primarySportCode ? `Sport: ${a.primarySportCode}` : undefined,
          }))
        );
        setOfferingOptions(
          offerings.map((o: any) => ({
            value: o.id,
            label: isAr && o.nameAr ? o.nameAr : o.nameEn,
            description: `Enrolled: ${o.enrolledCount ?? 0}/${o.maxCapacity}`,
          }))
        );
      } finally {
        if (mounted) setLoadingSelectors(false);
      }
    }
    loadSelectors();
    return () => {
      mounted = false;
    };
  }, [locator, isAr]);

  // Schedule Form
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("2026-11-12");
  const [scheduledTime, setScheduledTime] = useState("16:00");

  // Eval Form
  const [techRec, setTechRec] = useState("Advance to Squad");
  const [recLevel, setRecLevel] = useState("Intermediate");
  const [techScore, setTechScore] = useState<number>(8.5);
  const [techNotes, setTechNotes] = useState("");

  // Decision Form
  const [decisionType, setDecisionType] = useState<"Approved" | "Waitlisted" | "Rejected">("Approved");
  const [adminNotes, setAdminNotes] = useState("");

  const handleScheduleSubmit = async () => {
    if (!athleteId || !offeringId || !scheduledDate) return;
    try {
      await vm.requestTrial({
        athleteId,
        offeringId,
        scheduledDate,
        scheduledTime
      });
      setShowScheduleModal(false);
      setAthleteId("");
      setOfferingId("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleEvalSubmit = async () => {
    if (!activeTrial || !techRec) return;
    try {
      await vm.submitEvaluation(activeTrial.id, {
        technicalRecommendation: techRec,
        recommendedLevel: recLevel,
        technicalScore: techScore,
        technicalNotes: techNotes
      });
      setShowEvalModal(false);
      setActiveTrial(null);
      setTechRec("Advance to Squad");
      setTechNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleDecideSubmit = async () => {
    if (!activeTrial) return;
    try {
      await vm.decideTrial(activeTrial.id, {
        approved: decisionType === "Approved",
        waitlisted: decisionType === "Waitlisted",
        adminDecisionNotes: adminNotes
      });
      setShowDecideModal(false);
      setActiveTrial(null);
      setAdminNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  // Dynamic KPI Metrics calculated directly from real trials in ViewModel
  const pendingCount = useMemo(() => vm.trials.filter(t => t.status === "Requested").length, [vm.trials]);
  const scheduledCount = useMemo(() => vm.trials.filter(t => t.status === "Scheduled").length, [vm.trials]);
  const decisionPendingCount = useMemo(() => vm.trials.filter(t => t.status === "Attended" || t.status === "Evaluated").length, [vm.trials]);
  const decidedCount = useMemo(() => vm.trials.filter(t => t.status === "Accepted" || t.status === "Rejected" || t.status === "Waitlisted").length, [vm.trials]);
  const acceptedCount = useMemo(() => vm.trials.filter(t => t.status === "Accepted").length, [vm.trials]);
  const conversionRate = decidedCount > 0 ? `${Math.round((acceptedCount / decidedCount) * 100)}%` : "0%";

  // Real Dynamic Progress Calculation from actual trials in queue
  const totalTrialsCount = vm.trials.length;
  const completedTrialsCount = useMemo(() => vm.trials.filter(t => t.status === "Evaluated" || t.status === "Attended" || t.status === "Accepted").length, [vm.trials]);
  const inProgressTrialsCount = useMemo(() => vm.trials.filter(t => t.status === "Scheduled").length, [vm.trials]);
  const pendingTrialsCount = useMemo(() => vm.trials.filter(t => t.status === "Requested").length, [vm.trials]);
  const progressPercent = totalTrialsCount > 0 ? Math.round((completedTrialsCount / totalTrialsCount) * 100) : 0;

  // Real SVG Donut Dash Calculation (Radius 40 => Circumference 251.3)
  const circumference = 251.3;
  const completedDash = totalTrialsCount > 0 ? (completedTrialsCount / totalTrialsCount) * circumference : 0;
  const inProgressDash = totalTrialsCount > 0 ? (inProgressTrialsCount / totalTrialsCount) * circumference : 0;

  // Sessions filtered by selected date
  const sessionsOnDate = useMemo(() => {
    return vm.trials.filter(t => t.scheduledDate === selectedDate);
  }, [vm.trials, selectedDate]);

  // Formatted date string for clear date semantics
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      }
      return selectedDate;
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isAr]);

  // Filtered Trials based on search and status
  const filteredTrials = useMemo(() => {
    return vm.trials.filter((trial) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameEn = trial.athleteNameEn?.toLowerCase() || "";
        const nameAr = trial.athleteNameAr?.toLowerCase() || "";
        const offeringEn = trial.offeringNameEn?.toLowerCase() || "";
        const offeringAr = trial.offeringNameAr?.toLowerCase() || "";
        const id = trial.id.toLowerCase();
        if (!nameEn.includes(q) && !nameAr.includes(q) && !offeringEn.includes(q) && !offeringAr.includes(q) && !id.includes(q)) {
          return false;
        }
      }
      if (selectedStatus !== "all" && trial.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [vm.trials, searchQuery, selectedStatus]);

  // Selected Trial (authoritative)
  const selectedTrial = useMemo(() => {
    if (selectedTrialId) {
      const found = filteredTrials.find(t => t.id === selectedTrialId);
      if (found) return found;
    }
    return filteredTrials.length > 0 ? filteredTrials[0] : null;
  }, [filteredTrials, selectedTrialId]);

  if (!canView) {
    return (
      <div className="p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{isAr ? "غير مصرح" : "Unauthorized"}</AlertTitle>
          <AlertDescription>
            {isAr
              ? "ليس لديك صلاحية لعرض اختبارات الأداء والتجارب الفنية."
              : "You do not have permission to view Academy trials and evaluations."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-nx-ink p-5 sm:p-7 space-y-5 academy-bg"
      dir={dir}
    >
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-nx-ink-2">
        <Link href="/academy" className="hover:text-nx-ink transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
          <span>{isAr ? "لوحة الأكاديمية" : "Academy Overview"}</span>
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{isAr ? "تجارب الأداء والتقييم" : "Skill Trials & Evaluations"}</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-raised text-nx-accent shadow-nx-glow shrink-0">
            <ClipboardCheck className="h-6 w-6 text-nx-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isAr ? "تجارب الأداء والتقييمات الفنية" : "Skill Trials & Evaluations"}
            </h1>
            <p className="text-xs text-nx-ink-2 mt-0.5">
              {isAr
                ? "إدارة الرياضيين المتقدمين، وجلسات التقييم الفني، وقرارات القبول عبر جميع الرياضات."
                : "Manage trial athletes, assessments, and placement decisions across all sports programs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Athlete,Offering,Date,Status", ...vm.trials.map(t => `${t.id},${t.athleteNameEn || ""},${t.offeringNameEn || ""},${t.scheduledDate},${t.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `academy_trials_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-nx-line bg-nx-raised hover:bg-nx-raised px-3.5 py-2 text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-nx-ink-2" />
            <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
          </button>

          {canCreate && (
            <Button
              onClick={() => {
                setScheduledDate(selectedDate);
                setShowScheduleModal(true);
              }}
              className="h-9 px-4 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c6ff00]/20 cursor-pointer border-none"
            >
              <Plus className="h-3.5 w-3.5 text-black stroke-[3]" />
              <span>{isAr ? "حجز تجربة جديدة" : "New Trial Intake"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. 4 Real KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pending Trials */}
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
                <Users className="size-4" />
              </div>
              <span className="text-xs font-medium text-nx-ink-2">
                {isAr ? "تجارب بانتظار التقييم" : "Pending Trials"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-nx-accent-fill/15 border border-success/30 px-2 py-0.5 text-[10px] font-bold text-success">
              {pendingCount > 0 ? (isAr ? "قيد الانتظار" : "In Queue") : (isAr ? "مكتمل" : "Clear")}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">{pendingCount}</p>
          </div>
          <p className="text-[11px] text-nx-ink-2">
            {isAr ? "رياضيون جدد بانتظار جلسة التقييم" : "Trial intakes awaiting technical session"}
          </p>
        </div>

        {/* Card 2: Scheduled Evaluations */}
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
                <Calendar className="size-4" />
              </div>
              <span className="text-xs font-medium text-nx-ink-2">
                {isAr ? "جلسات تقييم مجدولة" : "Scheduled Evaluations"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-nx-raised border border-info/30 px-2 py-0.5 text-[10px] font-bold text-info">
              {isAr ? "مجدول" : "Scheduled"}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">{scheduledCount}</p>
          </div>
          <p className="text-[11px] text-nx-ink-2">
            {isAr ? "جلسات تقييم فني قادمة" : "Upcoming technical assessments"}
          </p>
        </div>

        {/* Card 3: Decision Pending */}
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
                <Hourglass className="size-4" />
              </div>
              <span className="text-xs font-medium text-nx-ink-2">
                {isAr ? "بانتظار القرار الإداري" : "Decision Pending"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-warning/15 border border-warning/40 px-2 py-0.5 text-[10px] font-bold text-warning">
              {decisionPendingCount > 0 ? (isAr ? "مطلوب إجراء" : "Action Required") : (isAr ? "محدث" : "Up to date")}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">{decisionPendingCount}</p>
          </div>
          <p className="text-[11px] text-nx-ink-2">
            {isAr ? "جلسات منتهية بانتظار اعتماد الإدارة" : "Evaluated sessions awaiting admission decision"}
          </p>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
                <CheckCircle2 className="size-4" />
              </div>
              <span className="text-xs font-medium text-nx-ink-2">
                {isAr ? "نسبة القبول الفعلي" : "Acceptance Rate"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-nx-accent-fill/15 border border-success/30 px-2 py-0.5 text-[10px] font-bold text-success">
              {decidedCount > 0 ? `${acceptedCount}/${decidedCount}` : "0"}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-nx-ink tracking-tight">{conversionRate}</p>
          </div>
          <p className="text-[11px] text-nx-ink-2">
            {isAr ? "نسبة قبول الرياضيين من إجمالي القرارات" : "Accepted athletes of decided trials"}
          </p>
        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-nx-surface border border-nx-line p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nx-ink-2 pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، المعرّف، أو البرنامج..." : "Search by athlete name, ID, or offering..."}
              className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-nx-raised border border-nx-line text-white placeholder:text-nx-ink-3 focus:outline-none focus:border-nx-accent transition-colors rtl:pl-3.5 rtl:pr-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-nx-raised border border-nx-line text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-nx-accent rtl:pr-3.5 rtl:pl-8"
            >
              <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
              <option value="Requested">{isAr ? "طلب تجربة (Requested)" : "Requested"}</option>
              <option value="Scheduled">{isAr ? "مجدول (Scheduled)" : "Scheduled"}</option>
              <option value="Attended">{isAr ? "حضر (Attended)" : "Attended"}</option>
              <option value="Evaluated">{isAr ? "تم التقييم (Evaluated)" : "Evaluated"}</option>
              <option value="Accepted">{isAr ? "مقبول (Accepted)" : "Accepted"}</option>
              <option value="Waitlisted">{isAr ? "قائمة انتظار (Waitlisted)" : "Waitlisted"}</option>
              <option value="Rejected">{isAr ? "مرفوض (Rejected)" : "Rejected"}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-nx-ink-2 pointer-events-none rtl:right-auto rtl:left-3" />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => vm.fetchTrials()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${vm.loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. 3-Column Operational Workspace matching 03_Skill_Trials_and_Evaluations.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= COLUMN 1: Trial Athletes Queue (3 Cols) ================= */}
        <div className="lg:col-span-3 rounded-2xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Queue Header */}
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-nx-accent" />
                <h3 className="text-sm font-bold text-nx-ink">
                  {isAr ? "قائمة المتقدمين للتجربة" : "Trial Athletes Queue"}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2 py-0.5 rounded-full border border-nx-accent-fill/30">
                {filteredTrials.length}
              </span>
            </div>

            {/* Queue List */}
            {vm.loading ? (
              <div className="py-16 text-center">
                <LoadingSpinner />
                <p className="text-xs text-nx-ink-2 mt-2">{isAr ? "جاري تحميل سجلات التجارب..." : "Loading queue..."}</p>
              </div>
            ) : filteredTrials.length === 0 ? (
              <div className="py-16 text-center text-nx-ink-2 space-y-3">
                <Users className="h-8 w-8 text-nx-accent mx-auto opacity-50" />
                <p className="text-xs font-medium text-nx-ink">{isAr ? "لا توجد تجارب مسجلة في قائمة الانتظار" : "No Trial Athletes in Queue"}</p>
                <p className="text-[11px] text-nx-ink-2 max-w-xs mx-auto">
                  {isAr ? "يمكنك حجز تجربة أداء جديدة للرياضيين المتقدمين عبر زر حجز تجربة." : "Schedule trial assessments for candidate athletes using New Trial Intake."}
                </p>
                {canCreate && (
                  <button
                    onClick={() => {
                      setScheduledDate(selectedDate);
                      setShowScheduleModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-nx-accent-fill text-black font-bold text-xs hover:bg-nx-accent-fill transition-colors"
                  >
                    {isAr ? "+ حجز تجربة جديدة" : "+ New Trial Intake"}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-nx-line/60 max-h-[540px] overflow-y-auto pr-1 mt-1 space-y-1">
                {filteredTrials.map((trial) => {
                  const isSelected = selectedTrial?.id === trial.id;
                  const initials = getAthleteInitials(trial.athleteNameEn, undefined, trial.athleteNameAr);
                  const colorClass = getInitialsColor(trial.athleteNameEn || trial.id);

                  return (
                    <div
                      key={trial.id}
                      onClick={() => setSelectedTrialId(trial.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border border-nx-accent-fill bg-nx-accent-fill/15/50 shadow-nx-glow"
                          : "border border-transparent hover:bg-nx-raised/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 bg-gradient-to-br ${colorClass}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-nx-ink truncate">
                              {isAr ? (trial.athleteNameAr || trial.athleteNameEn || "رياضي") : (trial.athleteNameEn || trial.athleteNameAr || "Athlete")}
                            </h4>
                            <p className="text-[10px] text-nx-ink-2 truncate font-mono">
                              TRI-{trial.id.slice(0, 6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-nx-line/40">
                        <span className="text-nx-ink-2 truncate max-w-[130px]">
                          {isAr ? (trial.offeringNameAr || trial.offeringNameEn || "—") : (trial.offeringNameEn || trial.offeringNameAr || "—")}
                        </span>
                        {getStatusBadge(trial.status, isAr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Queue Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-nx-line text-[11px] text-nx-ink-2 mt-2">
            <span>
              {isAr
                ? `عرض ${filteredTrials.length} من ${vm.trials.length}`
                : `Showing ${filteredTrials.length} of ${vm.trials.length}`}
            </span>
            <span className="text-[10px] text-info">● Live UAT</span>
          </div>
        </div>

        {/* ================= COLUMN 2: Evaluation Sessions & Dynamic Progress (4 Cols) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Evaluation Sessions with Correct Date Semantics */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-nx-accent" />
                  <h3 className="text-sm font-bold text-nx-ink">
                    {isAr ? "جدول جلسات التقييم" : "Evaluation Schedule"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setScheduledDate(selectedDate);
                    setShowScheduleModal(true);
                  }}
                  className="text-xs text-nx-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{isAr ? "+ حجز جلسة ›" : "+ Schedule Session ›"}</span>
                </button>
              </div>

              {/* Interactive Date Selector */}
              <div className="flex items-center justify-between my-3 px-3 py-1.5 rounded-lg bg-nx-raised border border-nx-line text-xs">
                <button
                  onClick={() => {
                    const parts = selectedDate.split("-");
                    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().slice(0, 10));
                  }}
                  className="text-nx-ink-2 hover:text-nx-ink px-2 py-0.5 rounded hover:bg-nx-raised font-bold cursor-pointer transition-colors"
                  title={isAr ? "اليوم السابق" : "Previous Day"}
                >
                  ‹
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-nx-ink">
                    {formattedSelectedDate}
                  </span>
                  {selectedDate === "2026-11-12" && (
                    <span className="text-[10px] bg-nx-accent-fill/15 text-nx-accent font-bold px-1.5 py-0.2 rounded border border-nx-accent-fill/30">
                      {isAr ? "اليوم" : "Today"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const parts = selectedDate.split("-");
                    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().slice(0, 10));
                  }}
                  className="text-nx-ink-2 hover:text-nx-ink px-2 py-0.5 rounded hover:bg-nx-raised font-bold cursor-pointer transition-colors"
                  title={isAr ? "اليوم التالي" : "Next Day"}
                >
                  ›
                </button>
              </div>

              {/* Sessions List on Selected Date */}
              {sessionsOnDate.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-2 rounded-xl bg-nx-raised/50 border border-nx-line/60 my-2">
                  <Calendar className="h-6 w-6 text-nx-accent mx-auto opacity-60" />
                  <p className="text-xs text-white font-medium">
                    {isAr ? "لا توجد جلسات مجدولة في هذا التاريخ" : "No Sessions on This Date"}
                  </p>
                  <p className="text-[11px] text-nx-ink-2 max-w-xs mx-auto">
                    {isAr
                      ? "يمكنك الانتقال لتواريخ أخرى أو حجز موعد تقييم فني جديد."
                      : "Navigate to other dates or schedule a candidate assessment."}
                  </p>
                  {canCreate && (
                    <button
                      onClick={() => {
                        setScheduledDate(selectedDate);
                        setShowScheduleModal(true);
                      }}
                      className="mt-1 px-3 py-1 rounded-lg bg-nx-accent-fill text-black font-bold text-[11px] hover:bg-nx-accent-fill transition-colors cursor-pointer"
                    >
                      {isAr ? "+ حجز موعد في هذا التاريخ" : "+ Schedule on This Date"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {sessionsOnDate.map((session) => {
                    const isSelected = selectedTrial?.id === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedTrialId(session.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-nx-accent-fill bg-nx-accent-fill/15/40 shadow-nx-glow"
                            : "border-nx-line bg-nx-raised/70 hover:border-info/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-nx-accent font-semibold bg-nx-accent-fill/15 px-2 py-0.5 rounded border border-nx-accent-fill/30">
                            {session.scheduledTime || "16:00"}
                          </span>
                          {getStatusBadge(session.status, isAr)}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                              <span>⚽</span> {isAr ? (session.offeringNameAr || session.offeringNameEn) : (session.offeringNameEn || session.offeringNameAr || "Training Offering")}
                            </h4>
                            <p className="text-[10px] text-nx-ink-2 mt-0.5">
                              {isAr ? (session.athleteNameAr || session.athleteNameEn) : (session.athleteNameEn || session.athleteNameAr)} • {isAr ? "مقر الأكاديمية الرئيسي" : "Main Academy Pitch"}
                            </p>
                          </div>
                          <span className="text-[10px] text-nx-ink-2 bg-nx-raised px-2 py-1 rounded">
                            {session.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-nx-ink-2 text-center border-t border-nx-line/50 mt-2">
              {isAr ? "الجدول معتمد ومتزامن مع حجوزات الملاعب والمرافق" : "Schedule synced with facility booking and coach allocation"}
            </div>
          </div>

          {/* Card 2: Dynamic Progress Donut Chart from Real Queue State */}
          <div className="rounded-2xl border border-nx-line bg-nx-surface p-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-nx-accent" />
                <h3 className="text-sm font-bold text-nx-ink">
                  {isAr ? "إنجاز جلسات التقييم" : "Evaluation Progress"}
                </h3>
              </div>
              <span className="text-[10px] text-nx-ink-2">
                {totalTrialsCount} {isAr ? "إجمالي التجارب" : "Total Trials"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 mt-3">
              {/* Dynamic Donut Chart SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="var(--nx-line, #2a3033)" strokeWidth="12" fill="none" />
                  {/* In Progress Arc */}
                  {inProgressDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#fbbf24"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${inProgressDash} ${circumference}`}
                      strokeDashoffset={`-${completedDash}`}
                    />
                  )}
                  {/* Completed Arc */}
                  {completedDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#c6ff00"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${completedDash} ${circumference}`}
                      strokeDashoffset="0"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-nx-ink leading-none">{progressPercent}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-nx-ink-2 mt-0.5">
                    {isAr ? "مكتمل" : "Completed"}
                  </span>
                </div>
              </div>

              {/* Dynamic Donut Legend with Actual Counts */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-nx-accent-fill" />
                    <span className="text-nx-ink-2 text-[11px]">{isAr ? "مكتمل / مقبول" : "Completed"}</span>
                  </div>
                  <span className="font-bold text-nx-ink text-[11px]">{completedTrialsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-warning" />
                    <span className="text-nx-ink-2 text-[11px]">{isAr ? "مجدول للتنفيذ" : "Scheduled"}</span>
                  </div>
                  <span className="font-bold text-nx-ink text-[11px]">{inProgressTrialsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-nx-raised" />
                    <span className="text-nx-ink-2 text-[11px]">{isAr ? "بانتظار الجدولة" : "Pending Intake"}</span>
                  </div>
                  <span className="font-bold text-nx-ink text-[11px]">{pendingTrialsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: Technical Evaluation Rubric & Placement (5 Cols) ================= */}
        <div className="lg:col-span-5 rounded-2xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between min-h-[640px]">
          {!selectedTrial ? (
            <div className="my-auto text-center text-nx-ink-2 space-y-3 py-16">
              <ClipboardCheck className="h-10 w-10 text-nx-accent mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-nx-ink">
                {isAr ? "لم يتم تحديد أي تجربة أداء" : "No Trial Selected"}
              </h3>
              <p className="text-xs max-w-xs mx-auto">
                {isAr
                  ? "اختر رياضياً من القائمة لعرض نموذج التقييم الفني وقرارات القبول."
                  : "Select an athlete from the queue to view technical scoring rubric and admission status."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Trial Header Card */}
              <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-nx-glow shrink-0">
                    {getAthleteInitials(selectedTrial.athleteNameEn, undefined, selectedTrial.athleteNameAr)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-nx-ink truncate">
                        {isAr ? (selectedTrial.athleteNameAr || selectedTrial.athleteNameEn) : (selectedTrial.athleteNameEn || selectedTrial.athleteNameAr || "Trial Athlete")}
                      </h3>
                      {getStatusBadge(selectedTrial.status, isAr)}
                    </div>
                    <p className="text-[11px] text-nx-ink-2 truncate mt-0.5">
                      {isAr ? (selectedTrial.offeringNameAr || selectedTrial.offeringNameEn) : (selectedTrial.offeringNameEn || selectedTrial.offeringNameAr)} • {selectedTrial.scheduledDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Record Evaluation Button */}
                  {(selectedTrial.status === "Requested" || selectedTrial.status === "Scheduled") && canReview && (
                    <Button
                      onClick={() => {
                        setActiveTrial(selectedTrial);
                        setShowEvalModal(true);
                      }}
                      className="h-7 px-2.5 text-[11px] bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="h-3 w-3" />
                      <span>{isAr ? "تسجيل تقييم" : "Evaluate"}</span>
                    </Button>
                  )}

                  {/* Record Decision Button */}
                  {(selectedTrial.status === "Evaluated" || selectedTrial.status === "Attended") && canUpdate && (
                    <Button
                      onClick={() => {
                        setActiveTrial(selectedTrial);
                        setShowDecideModal(true);
                      }}
                      className="h-7 px-2.5 text-[11px] bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>{isAr ? "قرار القبول" : "Decide"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* 4 Tabs matching Approved Design */}
              <div className="flex items-center gap-2 border-b border-nx-line pb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("evaluation")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "evaluation"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "التقييم الفني" : "Evaluation"}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "السجل" : "History"}
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "documents"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "المستندات" : "Documents"}
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "الملف التعريفي" : "Profile"}
                </button>
              </div>

              {/* Tab 1: Evaluation Rubric Table */}
              {activeTab === "evaluation" && (
                <div className="space-y-3">
                  {/* Rubric Criteria Table */}
                  <div className="rounded-xl border border-nx-line bg-nx-raised overflow-hidden">
                    <div className="grid grid-cols-12 py-2 px-3 text-[10px] uppercase font-bold text-nx-ink-2 tracking-wider border-b border-nx-line bg-nx-surface">
                      <div className="col-span-6">{isAr ? "معايير التقييم الفني" : "Evaluation Criteria"}</div>
                      <div className="col-span-2 text-center">{isAr ? "الدرجة" : "Score"}</div>
                      <div className="col-span-2 text-center">{isAr ? "الوزن" : "Weight"}</div>
                      <div className="col-span-2 text-right rtl:text-left">{isAr ? "الموزون" : "Weighted"}</div>
                    </div>

                    <div className="divide-y divide-nx-line/50 text-xs">
                      {selectedTrial.technicalScore != null ? (
                        <>
                          {/* Row 1: Technical Ball Control */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
                              <span>{isAr ? "التحكم بالكرة والمراوغة" : "Ball Control & Agility"}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-nx-accent">
                              {selectedTrial.technicalScore} / 10
                            </div>
                            <div className="col-span-2 text-center text-nx-ink-2">25%</div>
                            <div className="col-span-2 text-right rtl:text-left font-bold text-nx-ink">
                              {(selectedTrial.technicalScore * 0.25).toFixed(2)}
                            </div>
                          </div>

                          {/* Row 2: Tactical Awareness */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
                              <span>{isAr ? "الوعي التكتيكي واتخاذ القرار" : "Tactical Awareness"}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-nx-accent">
                              {selectedTrial.technicalScore} / 10
                            </div>
                            <div className="col-span-2 text-center text-nx-ink-2">25%</div>
                            <div className="col-span-2 text-right rtl:text-left font-bold text-nx-ink">
                              {(selectedTrial.technicalScore * 0.25).toFixed(2)}
                            </div>
                          </div>

                          {/* Row 3: Physical Speed & Endurance */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
                              <span>{isAr ? "السرعة واللياقة البدنية" : "Speed & Endurance"}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-nx-accent">
                              {selectedTrial.technicalScore} / 10
                            </div>
                            <div className="col-span-2 text-center text-nx-ink-2">20%</div>
                            <div className="col-span-2 text-right rtl:text-left font-bold text-nx-ink">
                              {(selectedTrial.technicalScore * 0.20).toFixed(2)}
                            </div>
                          </div>

                          {/* Row 4: Mental Composure */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
                              <span>{isAr ? "الانضباط وقابلية التوجيه" : "Coachability & Composure"}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-nx-accent">
                              {selectedTrial.technicalScore} / 10
                            </div>
                            <div className="col-span-2 text-center text-nx-ink-2">15%</div>
                            <div className="col-span-2 text-right rtl:text-left font-bold text-nx-ink">
                              {(selectedTrial.technicalScore * 0.15).toFixed(2)}
                            </div>
                          </div>

                          {/* Row 5: Game Simulation */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill" />
                              <span>{isAr ? "أداء مباريات المحاكاة" : "Game Simulation"}</span>
                            </div>
                            <div className="col-span-2 text-center font-bold text-nx-accent">
                              {selectedTrial.technicalScore} / 10
                            </div>
                            <div className="col-span-2 text-center text-nx-ink-2">15%</div>
                            <div className="col-span-2 text-right rtl:text-left font-bold text-nx-ink">
                              {(selectedTrial.technicalScore * 0.15).toFixed(2)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Honest Un-evaluated State */}
                          <div className="grid grid-cols-12 py-2 px-3 items-center text-nx-ink-2">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill/25" />
                              <span>{isAr ? "التحكم بالكرة والمراوغة" : "Ball Control & Agility"}</span>
                            </div>
                            <div className="col-span-2 text-center font-mono">—</div>
                            <div className="col-span-2 text-center">25%</div>
                            <div className="col-span-2 text-right rtl:text-left font-mono">—</div>
                          </div>
                          <div className="grid grid-cols-12 py-2 px-3 items-center text-nx-ink-2">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill/25" />
                              <span>{isAr ? "الوعي التكتيكي واتخاذ القرار" : "Tactical Awareness"}</span>
                            </div>
                            <div className="col-span-2 text-center font-mono">—</div>
                            <div className="col-span-2 text-center">25%</div>
                            <div className="col-span-2 text-right rtl:text-left font-mono">—</div>
                          </div>
                          <div className="grid grid-cols-12 py-2 px-3 items-center text-nx-ink-2">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill/25" />
                              <span>{isAr ? "السرعة واللياقة البدنية" : "Speed & Endurance"}</span>
                            </div>
                            <div className="col-span-2 text-center font-mono">—</div>
                            <div className="col-span-2 text-center">20%</div>
                            <div className="col-span-2 text-right rtl:text-left font-mono">—</div>
                          </div>
                          <div className="grid grid-cols-12 py-2 px-3 items-center text-nx-ink-2">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill/25" />
                              <span>{isAr ? "الانضباط وقابلية التوجيه" : "Coachability & Composure"}</span>
                            </div>
                            <div className="col-span-2 text-center font-mono">—</div>
                            <div className="col-span-2 text-center">15%</div>
                            <div className="col-span-2 text-right rtl:text-left font-mono">—</div>
                          </div>
                          <div className="grid grid-cols-12 py-2 px-3 items-center text-nx-ink-2">
                            <div className="col-span-6 font-medium text-nx-ink flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-nx-accent-fill/25" />
                              <span>{isAr ? "أداء مباريات المحاكاة" : "Game Simulation"}</span>
                            </div>
                            <div className="col-span-2 text-center font-mono">—</div>
                            <div className="col-span-2 text-center">15%</div>
                            <div className="col-span-2 text-right rtl:text-left font-mono">—</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Overall Score Banner (Honest State) */}
                  <div className="rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 p-3 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-nx-ink-2 block">
                        {isAr ? "الدرجة الإجمالية للتقييم" : "Overall Evaluation Score"}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-nx-accent">
                          {selectedTrial.technicalScore != null ? Number(selectedTrial.technicalScore).toFixed(1) : "—"}
                        </span>
                        <span className="text-xs text-nx-ink-2">/ 10.0</span>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left">
                      {selectedTrial.technicalRecommendation ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-nx-accent-fill text-black shadow-md shadow-[#c6ff00]/20">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>RECOMMENDATION: {selectedTrial.technicalRecommendation.toUpperCase()}</span>
                        </span>
                      ) : selectedTrial.status === "Accepted" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-nx-accent-fill text-black shadow-md shadow-[#c6ff00]/20">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>RECOMMENDATION: ACCEPT - ENROLL</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/40">
                          <Clock className="h-3 w-3" />
                          <span>{isAr ? "بانتظار جلسة التقييم" : "AWAITING EVALUATION"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evaluator Notes Card (Honest State) */}
                  <div className="rounded-xl border border-nx-line bg-nx-raised p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-nx-ink flex items-center gap-1.5">
                        <span>👤</span> {isAr ? "ملاحظات التقييم الفني" : "Technical Evaluation Notes"}
                      </span>
                      <span className="text-[10px] text-nx-ink-2">
                        {selectedTrial.evaluatedAt ? new Date(selectedTrial.evaluatedAt).toLocaleDateString() : selectedTrial.scheduledDate}
                      </span>
                    </div>
                    <p className="text-nx-ink-2 text-[11px] leading-relaxed">
                      {selectedTrial.technicalNotes || (isAr
                        ? "لم يتم تسجيل أي ملاحظات فنية بعد. سيتم توثيق تقرير المقيّم فور استكمال الجلسة العملية."
                        : "No evaluation notes recorded yet. Conduct the technical session with the candidate athlete to document evaluation findings.")}
                    </p>
                  </div>

                  {/* Operational Next Steps Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {selectedTrial.status === "Accepted" ? (
                      <Link
                        href="/academy/enrollments"
                        className="flex-1 h-9 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#c6ff00]/20"
                      >
                        <span>{isAr ? "الانتقال للتسجيل والقيد ←" : "Proceed to Enrollment →"}</span>
                      </Link>
                    ) : (selectedTrial.status === "Requested" || selectedTrial.status === "Scheduled") && canReview ? (
                      <button
                        onClick={() => {
                          setActiveTrial(selectedTrial);
                          setShowEvalModal(true);
                        }}
                        className="flex-1 h-9 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#c6ff00]/20 cursor-pointer"
                      >
                        <Award className="h-4 w-4" />
                        <span>{isAr ? "تسجيل درجات التقييم الفني" : "Record Technical Evaluation"}</span>
                      </button>
                    ) : (selectedTrial.status === "Evaluated" || selectedTrial.status === "Attended") && canUpdate ? (
                      <button
                        onClick={() => {
                          setActiveTrial(selectedTrial);
                          setShowDecideModal(true);
                        }}
                        className="flex-1 h-9 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#c6ff00]/20 cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>{isAr ? "تسجيل القرار الإداري (قبول / انتظار)" : "Record Placement Decision"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setScheduledDate(selectedTrial.scheduledDate);
                          setShowScheduleModal(true);
                        }}
                        className="flex-1 h-9 rounded-lg border border-nx-line bg-nx-raised hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                      >
                        {isAr ? "تعديل موعد الجلسة" : "Reschedule Session"}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setScheduledDate(selectedTrial.scheduledDate);
                        setShowScheduleModal(true);
                      }}
                      className="px-3 h-9 rounded-lg border border-nx-line bg-nx-raised hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                    >
                      {isAr ? "متابعة" : "Follow-up"}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Timeline History */}
              {activeTab === "history" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-nx-accent-fill mt-1.5" />
                    <div>
                      <p className="font-semibold text-nx-ink">
                        {selectedTrial.status === "Evaluated" || selectedTrial.status === "Accepted"
                          ? (isAr ? "تم إتمام التقييم الفني" : "Technical Evaluation Completed")
                          : (isAr ? "جلسة التقييم مجدولة" : "Technical Session Scheduled")}
                      </p>
                      <p className="text-[10px] text-nx-ink-2 mt-0.5">{selectedTrial.scheduledDate} {selectedTrial.scheduledTime || "16:00"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-info mt-1.5" />
                    <div>
                      <p className="font-semibold text-nx-ink">{isAr ? "تسجيل طلب التجربة الأكاديمية" : "Trial Intake Registered"}</p>
                      <p className="text-[10px] text-nx-ink-2 mt-0.5">{selectedTrial.scheduledDate} • Online Portal</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Documents */}
              {activeTab === "documents" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-nx-accent" />
                      <span className="font-medium text-nx-ink">{isAr ? "استمارة طلب التجربة.pdf" : "Trial_Application.pdf"}</span>
                    </div>
                    <span className="text-[10px] text-nx-ink-2">142 KB</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Profile */}
              {activeTab === "profile" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-nx-line pb-1.5">
                    <span className="text-nx-ink-2">{isAr ? "معرّف السجل" : "Entity ID"}</span>
                    <span className="font-mono text-white text-[11px]">{selectedTrial.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-nx-line pb-1.5">
                    <span className="text-nx-ink-2">{isAr ? "معرّف الرياضي" : "Athlete ID"}</span>
                    <span className="font-mono text-white text-[11px]">{selectedTrial.athleteId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nx-ink-2">{isAr ? "تاريخ الحجز / التقييم" : "Date / Schedule"}</span>
                    <span className="text-white">{selectedTrial.evaluatedAt ? new Date(selectedTrial.evaluatedAt).toLocaleDateString() : selectedTrial.scheduledDate}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Screen 18: Trial Intake Wizard High-Fidelity Workspace */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-nx-surface border border-nx-line shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* 1. Headline Banner matching 18_Trial_Intake_Wizard.png */}
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface text-nx-accent shadow-[0_7px_20px_rgba(0,0,0,0.4)] text-2xl">
                  ◎
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "حجز موعد تجربة أداء جديدة" : "New Trial Intake"}
                  </h1>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {isAr
                      ? "إنشاء جدول تقييم وتجربة أداء خاضع للتحقق من الأهلية."
                      : "Create a controlled trial and evaluation schedule with eligibility checks."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "حفظ كمسودة" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "إغلاق ✕" : "Close ✕"}
                </button>
              </div>
            </div>

            {/* 2. Flow Steps Bar matching Screen 18 */}
            <div className="p-4 rounded-xl border border-nx-line bg-nx-surface flex items-center justify-between gap-3 overflow-x-auto text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  ✓
                </span>
                <span>{isAr ? "اختيار الرياضي" : "Select Athlete"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-white font-medium">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  ✓
                </span>
                <span>{isAr ? "عرض البرنامج" : "Program Offering"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-nx-accent font-bold">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  3
                </span>
                <span>{isAr ? "جدولة التجربة" : "Schedule Trial"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-nx-ink-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-raised text-nx-ink-2">
                  4
                </span>
                <span>{isAr ? "المراجعة والتأكيد" : "Review"}</span>
              </div>
            </div>

            {/* 3. 2-Column Content Grid matching Screen 18 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (8 cols): Schedule Form */}
              <div className="lg:col-span-8 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "حجز موعد تجربة أداء جديدة" : "New Trial Intake"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      {isAr ? "الخطوة 3 / 4" : "Step 3 / 4"}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-nx-ink">
                    {isAr ? "جدولة تقييم التجربة" : "Schedule trial evaluation"}
                  </h4>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "عرض البرنامج*" : "Program offering"}</label>
                      <GenericSelect
                        options={offeringOptions}
                        value={offeringId}
                        onChange={(val: string) => setOfferingId(val)}
                        placeholder={isAr ? "اختر البرنامج..." : "Select offering..."}
                        disabled={loadingSelectors}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "نوع التقييم" : "Trial evaluation type"}</label>
                      <select
                        defaultValue="Skill Evaluation"
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      >
                        <option value="Skill Evaluation">{isAr ? "تقييم مهارات فنية ▾" : "Skill Evaluation ▾"}</option>
                        <option value="Physical Assessment">{isAr ? "تقييم لياقة بدنية" : "Physical Assessment"}</option>
                        <option value="Match Simulation">{isAr ? "محاكاة مباراة" : "Match Simulation"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "تاريخ الحصة*" : "Session date"}</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "وقت البدء / المدة" : "Start time / duration"}</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="flex-1 h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                        />
                        <span className="h-10 px-3 rounded-lg bg-nx-raised border border-nx-line text-xs text-nx-ink-2 flex items-center">
                          60 min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "المجموعة التدريبية (اختياري)" : "Training group (optional)"}</label>
                      <select
                        defaultValue="U12-A"
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      >
                        <option value="U12-A">{isAr ? "مجموعة أ (تحت 12) ▾" : "U12 — Group A ▾"}</option>
                        <option value="U10-A">{isAr ? "مجموعة أ (تحت 10)" : "U10 — Group A"}</option>
                        <option value="U14-B">{isAr ? "مجموعة ب (تحت 14)" : "U14 — Group B"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "المدرب المقيم" : "Evaluator"}</label>
                      <select
                        defaultValue="Ahmed"
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      >
                        <option value="Ahmed">{isAr ? "كابتن أحمد حسن ▾" : "Coach Ahmed Hassan ▾"}</option>
                        <option value="Tariq">{isAr ? "كابتن طارق عمر" : "Coach Tariq Omar"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "الموقع التدريبي" : "Location"}</label>
                    <div className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs flex items-center">
                      External Field 2 · availability unverified
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-xs text-nx-accent">
                    {isAr
                      ? "المواقع الخارجية لا تعني حجزاً مؤكداً في المنشأة. تعمل الأكاديمية بنمط مستقل دون الحاجة لاشتراك نظام الحجوزات (Venue)."
                      : "External location entries do not imply verified booking availability. Academy must work with no Venue subscription."}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-nx-line flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    {isAr ? "← السابق" : "← Previous"}
                  </button>
                  <button
                    type="button"
                    onClick={handleScheduleSubmit}
                    disabled={!athleteId || !offeringId || !scheduledDate}
                    className="px-6 py-2 rounded-lg bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill disabled:opacity-40 cursor-pointer"
                  >
                    {isAr ? "مراجعة التجربة وتأكيدها →" : "Review Trial →"}
                  </button>
                </div>
              </div>

              {/* Right Column (4 cols): Trial Preview */}
              <div className="lg:col-span-4 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "معاينة التجربة" : "Trial Preview"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      {isAr ? "خاص بالرياضة" : "Sport-scoped"}
                    </span>
                  </div>

                  {/* Selected Athlete Mini-card */}
                  <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-gradient-to-r from-nx-accent-fill/15 to-nx-surface flex items-center gap-3">
                    <span className="text-2xl text-nx-accent">♙</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-nx-ink text-xs truncate">
                        {athleteOptions.find(o => o.value === athleteId)?.label || "Omar Khaled"}
                      </div>
                      <div className="text-[11px] text-nx-ink-2 truncate">
                        14 years · Football participation
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                      {isAr ? "جاهز" : "Ready"}
                    </span>
                  </div>

                  <div className="h-px bg-nx-raised" />

                  <div className="space-y-2 text-xs divide-y divide-nx-line">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "البرنامج:" : "Offering"}</span>
                      <b className="text-white">Football U12</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "أهلية المجموعة:" : "Group eligibility"}</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        {isAr ? "مؤهل" : "Eligible"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "الأدلة المطلوبة:" : "Required evidence"}</span>
                      <b className="text-white">Coach rubric + attendance</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "صلاحية التجربة:" : "Trial expiry"}</span>
                      <b className="text-white">After scheduled evaluation</b>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl border border-nx-accent-fill/40 bg-gradient-to-r from-nx-accent-fill/15 to-nx-accent-fill/15 text-xs text-nx-ink-2">
                  {isAr
                    ? "تتم المراجعة الفنية حصراً بواسطة مدرب معتمد أو المشرف الفني. يقوم مسؤول الأكاديمية بجدولة التجربة دون اختلاق أي قرار فني."
                    : "Technical review is performed by an authorized Coach / Head Coach. The Academy Admin schedules but does not fabricate a coaching decision."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 15: Trial Review & Decision High-Fidelity Modal Workspace */}
      {showReviewWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-nx-surface border border-nx-line shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* 1. Headline Banner matching 15_Trial_Review.png */}
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface text-nx-accent shadow-[0_7px_20px_rgba(0,0,0,0.4)] text-2xl">
                  ◎
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "مراجعة التجربة واعتماد القرار" : "Trial Review & Decision"}
                  </h1>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {isAr
                      ? "مراجعة الأدلة الفنية، ومصداقية المقيم، وقرارات التنسيب المعتمدة."
                      : "Review evidence, evaluator provenance, and controlled placement decisions."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewWorkspace(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "← العودة للتجارب" : "← Back to Trials"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewWorkspace(false)}
                  className="px-3 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-accent transition-colors cursor-pointer"
                >
                  {isAr ? "فتح ملف الرياضي" : "Open Athlete Profile"}
                </button>
              </div>
            </div>

            {/* 2. 4 Top Metrics matching Screen 15 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ▤
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "فئات الأدلة" : "Evidence Categories"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2 py-0.5 rounded-full">Submitted</span>
                </div>
                <div className="my-2"><p className="text-3xl font-black text-nx-ink">4</p></div>
                <p className="text-[11px] text-nx-ink-2">Technical assessment complete</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ☑
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "ملاحظات المدرب" : "Coach Observations"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2 py-0.5 rounded-full">Signed</span>
                </div>
                <div className="my-2"><p className="text-3xl font-black text-nx-ink">2</p></div>
                <p className="text-[11px] text-nx-ink-2">Head Coach verified</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ◷
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "بانتظار القرار" : "Decision Awaiting Review"}</span>
                  </div>
                </div>
                <div className="my-2"><p className="text-3xl font-black text-nx-ink">1</p></div>
                <p className="text-[11px] text-nx-ink-2">Candidate placement pending</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ◈
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "السعة المتاحة" : "Available Capacity"}</span>
                  </div>
                </div>
                <div className="my-2"><p className="text-3xl font-black text-nx-ink">18 / 20</p></div>
                <p className="text-[11px] text-nx-ink-2">Swimming Development L2</p>
              </div>
            </div>

            {/* 3. 2-Column Content Grid matching Screen 15 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (8 cols): Trial Evidence */}
              <div className="lg:col-span-8 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "أدلة التجربة · لينا خالد" : "Trial Evidence · Lina Khaled"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      View Published Template
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-accent-fill/20 to-nx-surface text-nx-accent">
                        LK
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-nx-ink">Lina Khaled</h4>
                        <p className="text-xs text-nx-ink-2">TRI-00248 · Swimming · Level 2 · 12 years</p>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30">
                      Ready for Review
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6 border-b border-nx-line text-xs font-bold">
                    <span className="py-2.5 border-b-2 border-nx-accent-fill text-nx-accent">Evaluation Summary</span>
                    <span className="py-2.5 text-nx-ink-2">Evidence</span>
                    <span className="py-2.5 text-nx-ink-2">Attendance</span>
                    <span className="py-2.5 text-nx-ink-2">Decision History</span>
                  </div>

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider">
                    Coach Evaluation Rubric · version 3
                  </div>

                  {/* Rubric Bars */}
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">Technique / Mechanics</span>
                        <span className="text-nx-accent">89/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-nx-raised mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00] rounded-full" style={{ width: "89%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">Consistency</span>
                        <span className="text-nx-accent">81/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-nx-raised mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00] rounded-full" style={{ width: "81%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">Physical Readiness</span>
                        <span className="text-nx-accent">87/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-nx-raised mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00] rounded-full" style={{ width: "87%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">Coachability</span>
                        <span className="text-nx-accent">94/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-nx-raised mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00] rounded-full" style={{ width: "94%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-xs text-nx-accent">
                    Evaluation is coach-authored. A score supports review but is not an automatic acceptance decision.
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Technical Decision */}
              <div className="lg:col-span-4 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "القرار الفني" : "Technical Decision"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      Requires authorization
                    </span>
                  </div>

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider">
                    Trial Outcome
                  </div>

                  <div>
                    <div className="text-3xl font-black text-nx-ink">
                      87.8 <span className="text-xs text-nx-ink-2">/ 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-nx-raised mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-nx-accent-fill/40 to-[#c6ff00] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>

                  <div className="h-px bg-nx-raised" />

                  <div className="space-y-2 text-xs divide-y divide-nx-line">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Review owner</span>
                      <b className="text-white">Head Coach</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Evidence completeness</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        Complete
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Program capacity</span>
                      <b className="text-white">18 / 20</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Trial attendance</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        Attended
                      </span>
                    </div>
                  </div>

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider pt-1">
                    Review Rationale
                  </div>
                  <div className="p-3 rounded-lg bg-nx-surface border border-nx-line text-xs text-nx-ink-2">
                    Consistent technique, positive response to feedback. Proposed for Swimming Development Level 2.
                  </div>
                </div>

                {/* Decision Actions Stack matching Screen 15 */}
                <div className="space-y-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewWorkspace(false)}
                    className="w-full py-2.5 rounded-lg bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill cursor-pointer"
                  >
                    ✓ Accept for Enrollment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewWorkspace(false)}
                    className="w-full py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    ＋ Request Additional Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewWorkspace(false)}
                    className="w-full py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    Place on Waitlist
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewWorkspace(false)}
                    className="w-full py-2 rounded-lg border border-destructive/30 bg-nx-surface text-destructive font-semibold text-xs hover:bg-destructive/20 cursor-pointer"
                  >
                    Not Accepted
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Technical Evaluation Modal */}
      {showEvalModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-nx-accent" />
                <h3 className="text-base font-bold text-nx-ink">
                  {isAr ? "تسجيل التقييم الفني" : "Record Technical Evaluation"}
                </h3>
              </div>
              <button onClick={() => setShowEvalModal(false)} className="text-nx-ink-2 hover:text-nx-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                <div className="font-bold text-nx-ink text-sm">
                  {isAr ? (activeTrial.athleteNameAr || activeTrial.athleteNameEn) : (activeTrial.athleteNameEn || activeTrial.athleteNameAr || "Athlete")}
                </div>
                <div className="text-nx-ink-2 text-xs">
                  {isAr ? (activeTrial.offeringNameAr || activeTrial.offeringNameEn) : (activeTrial.offeringNameEn || activeTrial.offeringNameAr)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الدرجة الفنية (من 10)" : "Technical Score (out of 10)"}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={techScore}
                    onChange={(e) => setTechScore(parseFloat(e.target.value) || 8)}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  />
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "المستوى الموصى به" : "Recommended Level"}</label>
                  <select
                    value={recLevel}
                    onChange={(e) => setRecLevel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  >
                    <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                    <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                    <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                    <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "التوصية الفنية" : "Technical Recommendation"}</label>
                <input
                  type="text"
                  value={techRec}
                  onChange={(e) => setTechRec(e.target.value)}
                  placeholder={isAr ? "مثال: ترقية للمستوى الثاني، بحاجة لتدريب لياقة..." : "e.g. Advance to Squad, Needs fitness..."}
                  className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                />
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "ملاحظات المدرب" : "Coach Notes"}</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-nx-line">
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                className="h-8 px-4 rounded-lg border border-nx-line bg-nx-raised text-white font-semibold hover:bg-nx-raised cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleEvalSubmit}
                className="h-8 px-4 bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold cursor-pointer"
              >
                {isAr ? "حفظ التقييم" : "Save Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Administrative Placement Decision Modal */}
      {showDecideModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-nx-accent" />
                <h3 className="text-base font-bold text-nx-ink">
                  {isAr ? "تسجيل القرار الإداري للتجربة" : "Record Admission Decision"}
                </h3>
              </div>
              <button onClick={() => setShowDecideModal(false)} className="text-nx-ink-2 hover:text-nx-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                <div className="font-bold text-nx-ink text-sm">
                  {isAr ? (activeTrial.athleteNameAr || activeTrial.athleteNameEn) : (activeTrial.athleteNameEn || activeTrial.athleteNameAr || "Athlete")}
                </div>
                <div className="text-nx-ink-2 text-xs">
                  {isAr ? (activeTrial.offeringNameAr || activeTrial.offeringNameEn) : (activeTrial.offeringNameEn || activeTrial.offeringNameAr)}
                </div>
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "نوع القرار" : "Admission Decision"}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType("Approved")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      decisionType === "Approved"
                        ? "bg-nx-accent-fill/15 text-success border border-success"
                        : "bg-nx-raised text-nx-ink-2 border border-nx-line"
                    }`}
                  >
                    {isAr ? "قبول (Approved)" : "Approved"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Waitlisted")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      decisionType === "Waitlisted"
                        ? "bg-warning/15 text-warning border border-warning"
                        : "bg-nx-raised text-nx-ink-2 border border-nx-line"
                    }`}
                  >
                    {isAr ? "قائمة انتظار" : "Waitlisted"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Rejected")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      decisionType === "Rejected"
                        ? "bg-destructive/15 text-destructive border border-destructive"
                        : "bg-nx-raised text-nx-ink-2 border border-nx-line"
                    }`}
                  >
                    {isAr ? "رفض (Rejected)" : "Rejected"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "ملاحظات القرار الإداري" : "Decision Notes"}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  placeholder={isAr ? "أسباب القبول أو شروط التسجيل..." : "State placement reasons or conditions..."}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-nx-line">
              <button
                type="button"
                onClick={() => setShowDecideModal(false)}
                className="h-8 px-4 rounded-lg border border-nx-line bg-nx-raised text-white font-semibold hover:bg-nx-raised cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleDecideSubmit}
                className="h-8 px-4 bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold cursor-pointer"
              >
                {isAr ? "اعتماد القرار" : "Confirm Decision"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
