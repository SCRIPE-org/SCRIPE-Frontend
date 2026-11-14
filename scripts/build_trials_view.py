import os

trials_view_code = '''"use client";

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
  UserCheck
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
    "from-lime-500/20 to-emerald-500/20 text-[#c8ff05] border-[#c8ff05]/40",
    "from-blue-500/20 to-cyan-500/20 text-[#38bdf8] border-[#38bdf8]/40",
    "from-amber-500/20 to-orange-500/20 text-[#fbbf24] border-[#fbbf24]/40",
    "from-purple-500/20 to-indigo-500/20 text-[#c084fc] border-[#c084fc]/40"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getStatusBadge(status: TrialStatus | string, isAr: boolean) {
  switch (status) {
    case "Evaluated":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "تم التقييم" : "Evaluated"}
        </span>
      );
    case "Scheduled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          <Calendar className="h-3 w-3" />
          {isAr ? "مجدول" : "Scheduled"}
        </span>
      );
    case "Requested":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#9aa1a6] border border-[#343b3e]">
          <Clock className="h-3 w-3" />
          {isAr ? "طلب تجربة" : "Requested"}
        </span>
      );
    case "Attended":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          <Activity className="h-3 w-3" />
          {isAr ? "حضر" : "Attended"}
        </span>
      );
    case "Accepted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#c8ff05] border border-[#c8ff05]/40 shadow-[0_0_8px_rgba(200,255,5,0.15)]">
          <Award className="h-3 w-3" />
          {isAr ? "مقبول" : "Accepted"}
        </span>
      );
    case "Waitlisted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          <Hourglass className="h-3 w-3" />
          {isAr ? "قائمة الانتظار" : "Waitlisted"}
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]/30">
          <X className="h-3 w-3" />
          {isAr ? "مرفوض" : "Rejected"}
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#6b7280] border border-[#374151]">
          {isAr ? "ملغي" : "Cancelled"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#14171a] text-white border border-[#2a3033]">
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
  const [activeTrial, setActiveTrial] = useState<AcademyTrial | null>(null);

  // Selection
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "history" | "documents" | "profile">("evaluation");

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
  const [scheduledDate, setScheduledDate] = useState("2026-11-15");
  const [scheduledTime, setScheduledTime] = useState("16:00");

  // Eval Form
  const [techRec, setTechRec] = useState("Advance to Squad");
  const [recLevel, setRecLevel] = useState("Intermediate");
  const [techScore, setTechScore] = useState<number>(8);
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
  const conversionRate = decidedCount > 0 ? `${Math.round((acceptedCount / decidedCount) * 100)}%` : "N/A";

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
      className="min-h-screen text-[#f5f7f8] p-5 sm:p-7 space-y-5"
      dir={dir}
      style={{
        backgroundColor: "#07090a",
        backgroundImage: "radial-gradient(ellipse 900px 320px at 85% 0%, rgba(200, 255, 5, 0.055), transparent 75%)"
      }}
    >
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#9aa1a6]">
        <Link href="/academy" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
          <span>{isAr ? "لوحة الأكاديمية" : "Academy Overview"}</span>
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{isAr ? "تجارب الأداء والتقييم" : "Skill Trials & Evaluations"}</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8ff05]/40 bg-[#14171a] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
            <ClipboardCheck className="h-6 w-6 text-[#c8ff05]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isAr ? "تجارب الأداء والتقييمات الفنية" : "Skill Trials & Evaluations"}
            </h1>
            <p className="text-xs text-[#9aa1a6] mt-0.5">
              {isAr
                ? "إدارة الرياضيين المتقدمين، وجلسات التقييم الفني، وقرارات القبول عبر جميع الرياضات."
                : "Manage trial athletes, assessments, and placement decisions across all sports programs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Athlete,Offering,Date,Status", ...vm.trials.map(t => `${t.id},${t.athleteNameEn || ""},${t.offeringNameEn || ""},${t.scheduledDate},${t.status}`)].join("\\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `academy_trials_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1c2024] px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#9aa1a6]" />
            <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
          </button>

          {canCreate && (
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="h-9 px-4 rounded-lg bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c8ff05]/20 cursor-pointer border-none"
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
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#1a2307] border border-[#c8ff05]/40 text-[#c8ff05]">
                <Users className="size-4" />
              </div>
              <span className="text-xs font-medium text-[#9aa1a6]">
                {isAr ? "تجارب بانتظار التقييم" : "Pending Trials"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#122815] border border-[#22c55e]/30 px-2 py-0.5 text-[10px] font-bold text-[#4ade80]">
              {pendingCount > 0 ? (isAr ? "قيد الانتظار" : "In Queue") : (isAr ? "مكتمل" : "Clear")}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white tracking-tight">{pendingCount}</p>
          </div>
          <p className="text-[11px] text-[#9aa1a6]">
            {isAr ? "رياضيون جدد بانتظار جلسة التقييم" : "Trial intakes awaiting technical session"}
          </p>
        </div>

        {/* Card 2: Scheduled Evaluations */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#1a2307] border border-[#c8ff05]/40 text-[#c8ff05]">
                <Calendar className="size-4" />
              </div>
              <span className="text-xs font-medium text-[#9aa1a6]">
                {isAr ? "جلسات تقييم مجدولة" : "Scheduled Evaluations"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#141b22] border border-[#3b82f6]/30 px-2 py-0.5 text-[10px] font-bold text-[#93c5fd]">
              {isAr ? "مجدول" : "Scheduled"}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white tracking-tight">{scheduledCount}</p>
          </div>
          <p className="text-[11px] text-[#9aa1a6]">
            {isAr ? "جلسات تقييم فني قادمة" : "Upcoming technical assessments"}
          </p>
        </div>

        {/* Card 3: Decision Pending */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#1a2307] border border-[#c8ff05]/40 text-[#c8ff05]">
                <Hourglass className="size-4" />
              </div>
              <span className="text-xs font-medium text-[#9aa1a6]">
                {isAr ? "بانتظار القرار الإداري" : "Decision Pending"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#2a1d08] border border-[#f59e0b]/40 px-2 py-0.5 text-[10px] font-bold text-[#fbbf24]">
              {decisionPendingCount > 0 ? (isAr ? "مطلوب إجراء" : "Action Required") : (isAr ? "محدث" : "Up to date")}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white tracking-tight">{decisionPendingCount}</p>
          </div>
          <p className="text-[11px] text-[#9aa1a6]">
            {isAr ? "جلسات منتهية بانتظار اعتماد الإدارة" : "Evaluated sessions awaiting admission decision"}
          </p>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="rounded-xl border border-[#2a3033] bg-[#101214] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#1a2307] border border-[#c8ff05]/40 text-[#c8ff05]">
                <CheckCircle2 className="size-4" />
              </div>
              <span className="text-xs font-medium text-[#9aa1a6]">
                {isAr ? "نسبة القبول الفعلي" : "Acceptance Rate"}
              </span>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#122815] border border-[#22c55e]/30 px-2 py-0.5 text-[10px] font-bold text-[#4ade80]">
              {decidedCount > 0 ? `${acceptedCount}/${decidedCount}` : "0"}
            </span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white tracking-tight">{conversionRate}</p>
          </div>
          <p className="text-[11px] text-[#9aa1a6]">
            {isAr ? "نسبة قبول الرياضيين من إجمالي القرارات" : "Accepted athletes of decided trials"}
          </p>
        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#101214] border border-[#222629] p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، المعرّف، أو البرنامج..." : "Search by athlete name, ID, or offering..."}
              className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-[#14171a] border border-[#222629] text-white placeholder-[#9aa1a6] focus:outline-none focus:border-[#c8ff05] transition-colors rtl:pl-3.5 rtl:pr-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-[#14171a] border border-[#222629] text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c8ff05] rtl:pr-3.5 rtl:pl-8"
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3" />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => vm.fetchTrials()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#222629] bg-[#14171a] text-[#9aa1a6] hover:text-white transition-colors cursor-pointer"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${vm.loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. 3-Column Operational Workspace matching 03_Skill_Trials_and_Evaluations.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= COLUMN 1: Trial Athletes Queue (5 Cols) ================= */}
        <div className="lg:col-span-5 rounded-2xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Queue Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? `رياضيو التجارب (${filteredTrials.length})` : `Trial Athletes (${filteredTrials.length})`}
                </h3>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 py-2 text-[10px] uppercase font-bold text-[#9aa1a6] tracking-wider border-b border-[#222629]">
              <div className="col-span-6 flex items-center gap-2">
                <span>{isAr ? "الرياضي" : "Athlete"}</span>
              </div>
              <div className="col-span-3">{isAr ? "البرنامج" : "Offering"}</div>
              <div className="col-span-3 text-right rtl:text-left">{isAr ? "الحالة / الموعد" : "Status / Date"}</div>
            </div>

            {/* Rows List */}
            {vm.loading ? (
              <div className="py-16 text-center">
                <LoadingSpinner />
                <p className="text-xs text-[#9aa1a6] mt-2">{isAr ? "جاري تحميل سجلات التجارب..." : "Loading trial evaluations..."}</p>
              </div>
            ) : filteredTrials.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a3033] bg-[#14171a] text-[#9aa1a6]">
                  <ClipboardCheck className="h-6 w-6 text-[#c8ff05]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isAr ? "لا توجد طلبات تجارب مسجلة" : "No Trial Requests in Queue"}</h4>
                  <p className="text-xs text-[#9aa1a6] mt-1 max-w-xs mx-auto">
                    {isAr
                      ? "لم يتم العثور على أي تجارب أداء تطابق المعايير. يمكنك حجز تجربة أداء جديدة عبر الزر أدناه."
                      : "No trial evaluations currently match the active filter criteria. Register new trials using New Trial Intake."}
                  </p>
                </div>
                {canCreate && (
                  <Button
                    onClick={() => setShowScheduleModal(true)}
                    className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
                  >
                    {isAr ? "+ حجز تجربة جديدة" : "+ New Trial Intake"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#222629]/50">
                {filteredTrials.map((trial) => {
                  const isSelected = selectedTrial?.id === trial.id;
                  const initials = getAthleteInitials(trial.athleteNameEn, undefined, trial.athleteNameAr);
                  const colorClass = getInitialsColor(trial.athleteNameEn || trial.id);

                  return (
                    <div
                      key={trial.id}
                      onClick={() => setSelectedTrialId(trial.id)}
                      className={`grid grid-cols-12 py-3 px-2.5 items-center rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border border-[#c8ff05] bg-[#1a2307]/40 shadow-[0_0_16px_rgba(200,255,5,0.12)]"
                          : "hover:bg-[#14171a]/80"
                      }`}
                    >
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        {/* Deterministic Initials Badge */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border bg-gradient-to-br ${colorClass}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold text-white truncate">
                            {isAr ? (trial.athleteNameAr || trial.athleteNameEn || "رياضي") : (trial.athleteNameEn || trial.athleteNameAr || "Athlete")}
                          </div>
                          <div className="text-[10px] text-[#9aa1a6]">
                            TRI-{trial.id.slice(0, 6).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 text-xs text-[#9aa1a6] truncate">
                        {isAr ? (trial.offeringNameAr || trial.offeringNameEn || "—") : (trial.offeringNameEn || trial.offeringNameAr || "—")}
                      </div>

                      <div className="col-span-3 flex flex-col items-end rtl:items-start">
                        {getStatusBadge(trial.status, isAr)}
                        <span className="text-[10px] text-[#9aa1a6] mt-0.5">{trial.scheduledDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Queue Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#222629] text-xs text-[#9aa1a6] mt-2">
            <span>
              {isAr
                ? `عرض ${filteredTrials.length} من إجمالي ${vm.trials.length} تجربة`
                : `Showing ${filteredTrials.length} of ${vm.trials.length} trial athletes`}
            </span>
          </div>
        </div>

        {/* ================= COLUMN 2 & 3: Evaluation Details & Decision (7 Cols) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!selectedTrial ? (
            <div className="rounded-2xl border border-[#222629] bg-[#101214] p-12 text-center text-[#9aa1a6] space-y-3">
              <ClipboardCheck className="h-10 w-10 text-[#5a7800] mx-auto" />
              <h3 className="text-base font-bold text-white">
                {isAr ? "لم يتم تحديد أي تجربة أداء" : "No Trial Selected"}
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                {isAr
                  ? "اختر رياضياً من القائمة لعرض نموذج التقييم الفني وقرارات القبول."
                  : "Select an athlete from the queue to view technical scoring rubric and admission status."}
              </p>
            </div>
          ) : (
            <>
              {/* Selected Trial Header Card */}
              <div className="rounded-2xl border border-[#222629] bg-[#101214] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222629]">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-base font-bold border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] shadow-[0_0_20px_rgba(200,255,5,0.15)] shrink-0">
                      {getAthleteInitials(selectedTrial.athleteNameEn, undefined, selectedTrial.athleteNameAr)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-white">
                          {isAr ? (selectedTrial.athleteNameAr || selectedTrial.athleteNameEn) : (selectedTrial.athleteNameEn || selectedTrial.athleteNameAr || "Trial Athlete")}
                        </h2>
                        {getStatusBadge(selectedTrial.status, isAr)}
                      </div>
                      <p className="text-xs text-[#9aa1a6] mt-0.5">
                        {isAr ? (selectedTrial.offeringNameAr || selectedTrial.offeringNameEn) : (selectedTrial.offeringNameEn || selectedTrial.offeringNameAr)} • {selectedTrial.scheduledDate} {selectedTrial.scheduledTime || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Record Evaluation Button */}
                    {(selectedTrial.status === "Requested" || selectedTrial.status === "Scheduled") && canReview && (
                      <Button
                        onClick={() => {
                          setActiveTrial(selectedTrial);
                          setShowEvalModal(true);
                        }}
                        className="h-8 px-3 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center gap-1.5"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>{isAr ? "تسجيل التقييم الفني" : "Record Evaluation"}</span>
                      </Button>
                    )}

                    {/* Record Decision Button */}
                    {(selectedTrial.status === "Evaluated" || selectedTrial.status === "Attended") && canUpdate && (
                      <Button
                        onClick={() => {
                          setActiveTrial(selectedTrial);
                          setShowDecideModal(true);
                        }}
                        className="h-8 px-3 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center gap-1.5"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{isAr ? "تسجيل القرار الإداري" : "Record Decision"}</span>
                      </Button>
                    )}

                    {/* Accepted -> Link to Enrollments */}
                    {selectedTrial.status === "Accepted" && (
                      <Link
                        href="/academy/enrollments"
                        className="h-8 px-3 text-xs bg-[#122815] hover:bg-[#1a381e] text-[#4ade80] border border-[#22c55e]/40 font-bold rounded-md flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="h-3.5 w-3.5 text-[#c8ff05]" />
                        <span>{isAr ? "مقبول — الانتقال للتسجيل" : "Accepted — Proceed to Enrollment"}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mt-4 border-b border-[#222629] text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("evaluation")}
                    className={`pb-2.5 transition-colors cursor-pointer ${
                      activeTab === "evaluation"
                        ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                        : "text-[#9aa1a6] hover:text-white"
                    }`}
                  >
                    {isAr ? "التقييم الفني والدرجات" : "Technical Evaluation"}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2.5 transition-colors cursor-pointer ${
                      activeTab === "history"
                        ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                        : "text-[#9aa1a6] hover:text-white"
                    }`}
                  >
                    {isAr ? "سجل المراحل" : "Timeline History"}
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-2.5 transition-colors cursor-pointer ${
                      activeTab === "profile"
                        ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                        : "text-[#9aa1a6] hover:text-white"
                    }`}
                  >
                    {isAr ? "بيانات التعريف" : "Entity Metadata"}
                  </button>
                </div>

                {/* Tab 1: Evaluation Rubric */}
                {activeTab === "evaluation" && (
                  <div className="pt-4 space-y-4">
                    {selectedTrial.technicalScore != null || selectedTrial.technicalRecommendation ? (
                      <div className="space-y-4">
                        {/* Overall Score Box */}
                        <div className="rounded-xl border border-[#2a3033] bg-[#14171a] p-4 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-[#9aa1a6]">
                              {isAr ? "الدرجة الفنية الإجمالية" : "Overall Technical Score"}
                            </span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-3xl font-black text-[#c8ff05]">
                                {selectedTrial.technicalScore != null ? selectedTrial.technicalScore : "—"}
                              </span>
                              <span className="text-xs text-[#9aa1a6]">/ 10</span>
                            </div>
                          </div>
                          <div className="text-right rtl:text-left">
                            <span className="text-xs text-[#9aa1a6]">
                              {isAr ? "المستوى الموصى به" : "Recommended Level"}
                            </span>
                            <p className="text-sm font-bold text-white mt-1">
                              {selectedTrial.recommendedLevel || (isAr ? "غير محدد" : "Unspecified")}
                            </p>
                          </div>
                        </div>

                        {/* Technical Recommendation */}
                        <div className="rounded-xl border border-[#2a3033] bg-[#14171a] p-4 space-y-1.5">
                          <span className="text-xs font-semibold text-[#9aa1a6]">
                            {isAr ? "توصية المدرب الفني" : "Coach Recommendation"}
                          </span>
                          <p className="text-sm font-medium text-white">
                            {selectedTrial.technicalRecommendation || (isAr ? "لا توجد توصية مسجلة" : "No recommendation recorded")}
                          </p>
                          {selectedTrial.technicalNotes && (
                            <p className="text-xs text-[#9aa1a6] mt-2 border-t border-[#222629] pt-2">
                              {selectedTrial.technicalNotes}
                            </p>
                          )}
                        </div>

                        {/* Administrative Decision */}
                        <div className="rounded-xl border border-[#2a3033] bg-[#14171a] p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#9aa1a6]">
                              {isAr ? "القرار الإداري والقبول" : "Administrative Placement Decision"}
                            </span>
                            {selectedTrial.decidedAt && (
                              <span className="text-[10px] text-[#9aa1a6]">
                                {new Date(selectedTrial.decidedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-white">
                            {selectedTrial.status === "Accepted"
                              ? (isAr ? "تم قبول الرياضي في البرنامج" : "Approved for Program Admission")
                              : selectedTrial.status === "Waitlisted"
                              ? (isAr ? "تم إدراج الرياضي في قائمة الانتظار" : "Placed on Program Waitlist")
                              : selectedTrial.status === "Rejected"
                              ? (isAr ? "لم يتم قبول الرياضي في هذا البرنامج" : "Application Rejected")
                              : (isAr ? "بانتظار صدور القرار النهائي من إدارة الأكاديمية" : "Awaiting final decision by Academy Management")}
                          </p>
                          {selectedTrial.adminDecisionNotes && (
                            <p className="text-xs text-[#9aa1a6] mt-1 border-t border-[#222629] pt-1.5">
                              {selectedTrial.adminDecisionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <Clock className="h-8 w-8 text-[#9aa1a6] mx-auto opacity-50" />
                        <p className="text-xs text-[#9aa1a6] max-w-sm mx-auto">
                          {isAr
                            ? "لم يتم تسجيل التقييم الفني بعد. سيقوم المدرب المقيّم برصد الدرجة والتوصية الفنية بعد انتهاء جلسة التجربة."
                            : "Technical assessment has not yet been recorded. The evaluating coach will score rubric metrics upon session attendance."}
                        </p>
                        {canReview && (
                          <Button
                            onClick={() => {
                              setActiveTrial(selectedTrial);
                              setShowEvalModal(true);
                            }}
                            className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
                          >
                            {isAr ? "تسجيل التقييم الآن" : "Record Technical Evaluation"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Timeline */}
                {activeTab === "history" && (
                  <div className="pt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "موعد جلسة التجربة" : "Scheduled Session Date"}</span>
                      <span className="font-bold text-white">{selectedTrial.scheduledDate} {selectedTrial.scheduledTime || ""}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "تاريخ التقييم الفني" : "Technical Evaluation Date"}</span>
                      <span className="font-bold text-white">
                        {selectedTrial.evaluatedAt ? new Date(selectedTrial.evaluatedAt).toLocaleString() : (isAr ? "قيد الانتظار" : "Pending")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "تاريخ اعتماد القرار الإداري" : "Administrative Decision Date"}</span>
                      <span className="font-bold text-white">
                        {selectedTrial.decidedAt ? new Date(selectedTrial.decidedAt).toLocaleString() : (isAr ? "قيد الانتظار" : "Pending")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Entity Metadata */}
                {activeTab === "profile" && (
                  <div className="pt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "معرّف الرياضي" : "Athlete Party ID"}</span>
                      <span className="font-mono text-white text-[11px]">{selectedTrial.athleteId}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "معرّف العرض التدريبي" : "Offering ID"}</span>
                      <span className="font-mono text-white text-[11px]">{selectedTrial.offeringId}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#14171a] border border-[#222629]">
                      <span className="text-[#9aa1a6]">{isAr ? "معرّف سجل التجربة" : "Trial Entity ID"}</span>
                      <span className="font-mono text-white text-[11px]">{selectedTrial.id}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL 1: Schedule Trial Intake */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "حجز جلسة تجربة أداء جديدة" : "New Trial Intake Request"}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الرياضي" : "Athlete"}</label>
                <GenericSelect
                  value={athleteId}
                  options={athleteOptions}
                  onChange={(val) => setAthleteId(val)}
                  placeholder={isAr ? "اختر الرياضي..." : "Select athlete..."}
                  disabled={loadingSelectors}
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "العرض التدريبي المطلوب" : "Target Offering"}</label>
                <GenericSelect
                  value={offeringId}
                  options={offeringOptions}
                  onChange={(val) => setOfferingId(val)}
                  placeholder={isAr ? "اختر البرنامج / العرض..." : "Select offering..."}
                  disabled={loadingSelectors}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "تاريخ التجربة" : "Trial Date"}</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الوقت" : "Scheduled Time"}</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleScheduleSubmit}
                disabled={!athleteId || !offeringId || !scheduledDate || vm.loading}
                className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {vm.loading ? (isAr ? "جاري الحفظ..." : "Scheduling...") : (isAr ? "تأكيد الحجز" : "Confirm Trial")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Submit Technical Evaluation */}
      {showEvalModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "تسجيل التقييم الفني للمدرب" : "Technical Evaluation Rubric"}
              </h3>
              <button onClick={() => setShowEvalModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الدرجة الفنية (1 - 10)" : "Technical Score (1 - 10)"}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={techScore}
                    onChange={(e) => setTechScore(Number(e.target.value))}
                    className="flex-1 accent-[#c8ff05]"
                  />
                  <span className="text-lg font-black text-[#c8ff05] w-8 text-center">{techScore}</span>
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "المستوى الفني الموصى به" : "Recommended Placement Level"}</label>
                <select
                  value={recLevel}
                  onChange={(e) => setRecLevel(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                >
                  <option value="Beginner">Beginner (مبتدئ)</option>
                  <option value="Intermediate">Intermediate (متوسط)</option>
                  <option value="Advanced">Advanced (متقدم)</option>
                  <option value="Elite">Elite (نخبة)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "التوصية الفنية" : "Technical Recommendation"}</label>
                <input
                  type="text"
                  value={techRec}
                  onChange={(e) => setTechRec(e.target.value)}
                  placeholder={isAr ? "مثال: يوصى بضمه للفريق الأساسي" : "e.g. Recommend enrollment into Squad Alpha"}
                  className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات المدرب التفصيلية" : "Technical Remarks"}</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  rows={3}
                  placeholder={isAr ? "سجل الملاحظات الفنية والبدنية للرياضي..." : "Detailed physical and technical remarks..."}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <Button
                variant="outline"
                onClick={() => setShowEvalModal(false)}
                className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleEvalSubmit}
                disabled={!techRec || vm.loading}
                className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {vm.loading ? (isAr ? "جاري الحفظ..." : "Submitting...") : (isAr ? "حفظ التقييم" : "Submit Evaluation")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Administrative Decision */}
      {showDecideModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "تسجيل القرار الإداري للتجربة" : "Record Administrative Decision"}
              </h3>
              <button onClick={() => setShowDecideModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "نوع القرار" : "Admission Decision"}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType("Approved")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Approved"
                        ? "bg-[#c8ff05] text-black shadow-md shadow-[#c8ff05]/20"
                        : "bg-[#14171a] border border-[#2a3033] text-white"
                    }`}
                  >
                    {isAr ? "قبول (Approve)" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Waitlisted")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Waitlisted"
                        ? "bg-[#f59e0b] text-black"
                        : "bg-[#14171a] border border-[#2a3033] text-white"
                    }`}
                  >
                    {isAr ? "انتظار (Waitlist)" : "Waitlist"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Rejected")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Rejected"
                        ? "bg-[#ef4444] text-white"
                        : "bg-[#14171a] border border-[#2a3033] text-white"
                    }`}
                  >
                    {isAr ? "رفض (Reject)" : "Reject"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات القرار الإداري" : "Decision Notes"}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder={isAr ? "أسباب أو توجيهات إدارية بشأن القبول أو الرسوم..." : "Administrative reasoning or placement conditions..."}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <Button
                variant="outline"
                onClick={() => setShowDecideModal(false)}
                className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleDecideSubmit}
                disabled={vm.loading}
                className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {vm.loading ? (isAr ? "جاري الاعتماد..." : "Submitting...") : (isAr ? "اعتماد القرار" : "Confirm Decision")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''

target_path = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\trials\src\presentation\views\AcademyTrialsView.tsx"
with open(target_path, "w", encoding="utf-8") as f:
    f.write(trials_view_code)

print("AcademyTrialsView.tsx updated successfully without fabricated fixtures.")
