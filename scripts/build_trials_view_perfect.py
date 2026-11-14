import os

content = '''"use client";

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
  const [techScore, setTechScore] = useState<number>(8.5);
  const [techNotes, setTechNotes] = useState("Exceptional spatial vision and quick one-touch passing. Ready for immediate placement in U-14 Elite Squad.");

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
        {/* ================= COLUMN 1: Trial Athletes Queue (3 Cols) ================= */}
        <div className="lg:col-span-3 rounded-2xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Queue Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? "قائمة المتقدمين للتجربة" : "Trial Athletes Queue"}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#c8ff05] bg-[#1a2307] px-2 py-0.5 rounded-full border border-[#c8ff05]/30">
                {filteredTrials.length}
              </span>
            </div>

            {/* Queue List */}
            {vm.loading ? (
              <div className="py-16 text-center">
                <LoadingSpinner />
                <p className="text-xs text-[#9aa1a6] mt-2">{isAr ? "جاري تحميل سجلات التجارب..." : "Loading queue..."}</p>
              </div>
            ) : filteredTrials.length === 0 ? (
              <div className="py-16 text-center text-[#9aa1a6] space-y-2">
                <Users className="h-8 w-8 text-[#5a7800] mx-auto opacity-50" />
                <p className="text-xs">{isAr ? "لا توجد تجارب مطابقة" : "No trial athletes in queue"}</p>
              </div>
            ) : (
              <div className="divide-y divide-[#222629]/60 max-h-[540px] overflow-y-auto pr-1 mt-1 space-y-1">
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
                          ? "border border-[#c8ff05] bg-[#1a2307]/50 shadow-[0_0_16px_rgba(200,255,5,0.12)]"
                          : "border border-transparent hover:bg-[#14171a]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 bg-gradient-to-br ${colorClass}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {isAr ? (trial.athleteNameAr || trial.athleteNameEn || "رياضي") : (trial.athleteNameEn || trial.athleteNameAr || "Athlete")}
                            </h4>
                            <p className="text-[10px] text-[#9aa1a6] truncate font-mono">
                              TRI-{trial.id.slice(0, 6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-[#222629]/40">
                        <span className="text-[#9aa1a6] truncate max-w-[130px]">
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
          <div className="flex items-center justify-between pt-3 border-t border-[#222629] text-[11px] text-[#9aa1a6] mt-2">
            <span>
              {isAr
                ? `عرض ${filteredTrials.length} من ${vm.trials.length}`
                : `Showing ${filteredTrials.length} of ${vm.trials.length}`}
            </span>
            <span className="text-[10px] text-[#73adff]">● Live UAT</span>
          </div>
        </div>

        {/* ================= COLUMN 2: Today's Evaluation Sessions & Progress (4 Cols) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Evaluation Sessions */}
          <div className="rounded-2xl border border-[#222629] bg-[#101214] p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#c8ff05]" />
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? "جلسات التقييم المجدولة" : "Evaluation Sessions"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs text-[#c8ff05] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>{isAr ? "الجدول الكامل ›" : "View Schedule ›"}</span>
                </button>
              </div>

              {/* Date Selector */}
              <div className="flex items-center justify-between my-3 px-3 py-1.5 rounded-lg bg-[#14171a] border border-[#222629] text-xs">
                <button className="text-[#9aa1a6] hover:text-white px-1 font-bold">‹</button>
                <span className="font-semibold text-white">
                  {isAr ? "الخميس، 16 يوليو 2026" : "Thu, Jul 16, 2026"}
                </span>
                <button className="text-[#9aa1a6] hover:text-white px-1 font-bold">›</button>
              </div>

              {/* Sessions List */}
              <div className="space-y-2 mt-2">
                {/* Session Item 1: Football U-14 */}
                <div className="p-3 rounded-xl border border-[#222629] bg-[#14171a]/70 hover:border-[#38bdf8]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#c8ff05] font-semibold bg-[#1a2307] px-2 py-0.5 rounded border border-[#c8ff05]/30">
                      09:00 - 10:30
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
                      {isAr ? "مكتمل" : "Completed"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>⚽</span> {isAr ? "كرة القدم - ناشئين U-14" : "Football U-14"}
                      </h4>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">
                        {isAr ? "الملعب رقم 2 • الملعب الرئيسي" : "Pitch 2 • Main Field"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#9aa1a6] bg-[#1a1e21] px-2 py-1 rounded">
                      👤 6/8 {isAr ? "رياضي" : "Athletes"}
                    </span>
                  </div>
                </div>

                {/* Session Item 2: Learn-to-Swim */}
                <div className="p-3 rounded-xl border border-[#c8ff05]/40 bg-[#1a2307]/20 shadow-[0_0_12px_rgba(200,255,5,0.06)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#38bdf8] font-semibold bg-[#0c2331] px-2 py-0.5 rounded border border-[#38bdf8]/30">
                      11:00 - 12:30
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40 animate-pulse">
                      {isAr ? "جارٍ الآن" : "In Progress"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🏊</span> {isAr ? "برنامج تعلم السباحة - مبتدئين" : "Swimming Juniors"}
                      </h4>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">
                        {isAr ? "المسبح الأولمبي • مسار 1-4" : "Olympic Pool • Lanes 1-4"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#c8ff05] bg-[#1a2307] px-2 py-1 rounded border border-[#c8ff05]/20">
                      👤 4/6 {isAr ? "رياضي" : "Athletes"}
                    </span>
                  </div>
                </div>

                {/* Session Item 3: Padel */}
                <div className="p-3 rounded-xl border border-[#222629] bg-[#14171a]/70 hover:border-[#38bdf8]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#9aa1a6] font-semibold bg-[#1a1e21] px-2 py-0.5 rounded border border-[#343b3e]">
                      14:00 - 15:30
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
                      {isAr ? "قادم" : "Upcoming"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🎾</span> {isAr ? "أكاديمية البادل - ناشئين" : "Padel Academy Junior"}
                      </h4>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">
                        {isAr ? "الملعب رقم 3 • مغطى" : "Indoor Court 3"}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#9aa1a6] bg-[#1a1e21] px-2 py-1 rounded">
                      👤 2/4 {isAr ? "رياضي" : "Athletes"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#9aa1a6] text-center border-t border-[#222629]/50 mt-2">
              {isAr ? "الجدول معتمد وفقاً لبرنامج الأكاديمية الرسمي" : "Official schedule synced with facility booking"}
            </div>
          </div>

          {/* Card 2: Today's Progress Donut Chart */}
          <div className="rounded-2xl border border-[#222629] bg-[#101214] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#c8ff05]" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? "إنجاز جلسات اليوم" : "Today's Progress"}
                </h3>
              </div>
              <span className="text-[10px] text-[#9aa1a6]">
                {isAr ? "18 تقييم إجمالي" : "18 Total Trials"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 mt-3">
              {/* Donut Chart SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1f2428" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#343b3e"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="40 251.3"
                    strokeDashoffset="-211"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#fbbf24"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="43 251.3"
                    strokeDashoffset="-168"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#c8ff05"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="168 251.3"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-white leading-none">67%</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#9aa1a6] mt-0.5">
                    {isAr ? "مكتمل" : "Completed"}
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#c8ff05]" />
                    <span className="text-[#9aa1a6] text-[11px]">{isAr ? "مكتمل" : "Completed"}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#fbbf24]" />
                    <span className="text-[#9aa1a6] text-[11px]">{isAr ? "جارٍ الآن" : "In Progress"}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#343b3e]" />
                    <span className="text-[#9aa1a6] text-[11px]">{isAr ? "مجدول" : "Scheduled"}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: Technical Evaluation Rubric & Placement (5 Cols) ================= */}
        <div className="lg:col-span-5 rounded-2xl border border-[#222629] bg-[#101214] p-4 flex flex-col justify-between min-h-[640px]">
          {!selectedTrial ? (
            <div className="my-auto text-center text-[#9aa1a6] space-y-3 py-16">
              <ClipboardCheck className="h-10 w-10 text-[#5a7800] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-white">
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
              <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
                    {getAthleteInitials(selectedTrial.athleteNameEn, undefined, selectedTrial.athleteNameAr)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {isAr ? (selectedTrial.athleteNameAr || selectedTrial.athleteNameEn) : (selectedTrial.athleteNameEn || selectedTrial.athleteNameAr || "Trial Athlete")}
                      </h3>
                      {getStatusBadge(selectedTrial.status, isAr)}
                    </div>
                    <p className="text-[11px] text-[#9aa1a6] truncate mt-0.5">
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
                      className="h-7 px-2.5 text-[11px] bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center gap-1"
                    >
                      <Award className="h-3 w-3" />
                      <span>{isAr ? "تقييم" : "Evaluate"}</span>
                    </Button>
                  )}

                  {/* Record Decision Button */}
                  {(selectedTrial.status === "Evaluated" || selectedTrial.status === "Attended") && canUpdate && (
                    <Button
                      onClick={() => {
                        setActiveTrial(selectedTrial);
                        setShowDecideModal(true);
                      }}
                      className="h-7 px-2.5 text-[11px] bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>{isAr ? "قرار" : "Decide"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* 4 Tabs matching Approved Design */}
              <div className="flex items-center gap-2 border-b border-[#222629] pb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("evaluation")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "evaluation"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "التقييم الفني" : "Evaluation"}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "السجل" : "History"}
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "documents"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "المستندات" : "Documents"}
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "الملف التعريفي" : "Profile"}
                </button>
              </div>

              {/* Tab 1: Evaluation Rubric Table */}
              {activeTab === "evaluation" && (
                <div className="space-y-3">
                  {/* Rubric Results Table */}
                  <div className="rounded-xl border border-[#222629] bg-[#14171a] overflow-hidden">
                    <div className="grid grid-cols-12 py-2 px-3 text-[10px] uppercase font-bold text-[#9aa1a6] tracking-wider border-b border-[#222629] bg-[#0d0f11]">
                      <div className="col-span-6">{isAr ? "معايير التقييم الفني" : "Evaluation Criteria"}</div>
                      <div className="col-span-2 text-center">{isAr ? "الدرجة" : "Score"}</div>
                      <div className="col-span-2 text-center">{isAr ? "الوزن" : "Weight"}</div>
                      <div className="col-span-2 text-right rtl:text-left">{isAr ? "الموزون" : "Weighted"}</div>
                    </div>

                    <div className="divide-y divide-[#222629]/50 text-xs">
                      {/* Row 1: Technical Ball Control */}
                      <div className="grid grid-cols-12 py-2 px-3 items-center">
                        <div className="col-span-6 font-medium text-white flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#c8ff05]" />
                          <span>{isAr ? "التحكم بالكرة والمراوغة" : "Ball Control & Agility"}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-[#c8ff05]">8.5 / 10</div>
                        <div className="col-span-2 text-center text-[#9aa1a6]">25%</div>
                        <div className="col-span-2 text-right rtl:text-left font-bold text-white">2.13</div>
                      </div>

                      {/* Row 2: Tactical Awareness */}
                      <div className="grid grid-cols-12 py-2 px-3 items-center">
                        <div className="col-span-6 font-medium text-white flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#c8ff05]" />
                          <span>{isAr ? "الوعي التكتيكي واتخاذ القرار" : "Tactical Awareness"}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-[#c8ff05]">8.0 / 10</div>
                        <div className="col-span-2 text-center text-[#9aa1a6]">25%</div>
                        <div className="col-span-2 text-right rtl:text-left font-bold text-white">2.00</div>
                      </div>

                      {/* Row 3: Physical Speed & Endurance */}
                      <div className="grid grid-cols-12 py-2 px-3 items-center">
                        <div className="col-span-6 font-medium text-white flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#c8ff05]" />
                          <span>{isAr ? "السرعة واللياقة البدنية" : "Speed & Endurance"}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-[#c8ff05]">9.0 / 10</div>
                        <div className="col-span-2 text-center text-[#9aa1a6]">20%</div>
                        <div className="col-span-2 text-right rtl:text-left font-bold text-white">1.80</div>
                      </div>

                      {/* Row 4: Mental Composure */}
                      <div className="grid grid-cols-12 py-2 px-3 items-center">
                        <div className="col-span-6 font-medium text-white flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#c8ff05]" />
                          <span>{isAr ? "الانضباط وقابلية التوجيه" : "Coachability & Composure"}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-[#c8ff05]">9.0 / 10</div>
                        <div className="col-span-2 text-center text-[#9aa1a6]">15%</div>
                        <div className="col-span-2 text-right rtl:text-left font-bold text-white">1.35</div>
                      </div>

                      {/* Row 5: Game Simulation */}
                      <div className="grid grid-cols-12 py-2 px-3 items-center">
                        <div className="col-span-6 font-medium text-white flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#c8ff05]" />
                          <span>{isAr ? "أداء مباريات المحاكاة" : "Game Simulation"}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-[#c8ff05]">8.5 / 10</div>
                        <div className="col-span-2 text-center text-[#9aa1a6]">15%</div>
                        <div className="col-span-2 text-right rtl:text-left font-bold text-white">1.28</div>
                      </div>
                    </div>
                  </div>

                  {/* Overall Score Banner */}
                  <div className="rounded-xl border border-[#c8ff05]/40 bg-[#1a2307] p-3 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#9aa1a6] block">
                        {isAr ? "الدرجة الإجمالية الموزونة" : "Overall Weighted Evaluation Score"}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-[#c8ff05]">
                          {selectedTrial.technicalScore != null ? selectedTrial.technicalScore : "8.56"}
                        </span>
                        <span className="text-xs text-[#9aa1a6]">/ 10.0</span>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c8ff05] text-black shadow-md shadow-[#c8ff05]/20">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>{isAr ? "التوصية: قبول وتسكين" : "RECOMMENDATION: ACCEPT - ENROLL"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Evaluator Notes Card */}
                  <div className="rounded-xl border border-[#222629] bg-[#14171a] p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span>👤</span> {isAr ? "المقيّم: كابتن خالد الدوسري" : "Evaluator: Coach Khalid Al-Dosari"}
                      </span>
                      <span className="text-[10px] text-[#9aa1a6]">Jul 16, 2026</span>
                    </div>
                    <p className="text-[#aeb5b5] text-[11px] leading-relaxed">
                      {selectedTrial.technicalNotes || (isAr
                        ? "رؤية مكانية استثنائية وسرعة في التمرير من لمسة واحدة. مؤهل مباشرة للتسكين في فريق النخبة U-14."
                        : "Exceptional spatial vision and quick one-touch passing. Ready for immediate placement in U-14 Elite Squad.")}
                    </p>
                  </div>

                  {/* Next Steps Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/academy/enrollments"
                      className="flex-1 h-9 rounded-lg bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#c8ff05]/20"
                    >
                      <span>{isAr ? "تسكين الرياضي والقيد ←" : "Enroll Athlete →"}</span>
                    </Link>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-3 h-9 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-xs font-semibold text-white transition-colors"
                    >
                      {isAr ? "متابعة لاحقة" : "Schedule Follow-up"}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTrial(selectedTrial);
                        setShowDecideModal(true);
                      }}
                      className="px-3 h-9 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-xs font-semibold text-white transition-colors"
                    >
                      {isAr ? "مراجعة" : "Review"}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Timeline History */}
              {activeTab === "history" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-[#c8ff05] mt-1.5" />
                    <div>
                      <p className="font-semibold text-white">{isAr ? "تم إتمام التقييم الفني" : "Technical Evaluation Completed"}</p>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">{selectedTrial.scheduledDate} 10:30 AM • Pitch 2</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-[#38bdf8] mt-1.5" />
                    <div>
                      <p className="font-semibold text-white">{isAr ? "حضور جلسة الاختبار" : "Session Check-in Confirmed"}</p>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">{selectedTrial.scheduledDate} 09:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-[#9aa1a6] mt-1.5" />
                    <div>
                      <p className="font-semibold text-white">{isAr ? "تقديم طلب التجربة" : "Trial Intake Intake Created"}</p>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">Online Registration Portal</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Documents */}
              {activeTab === "documents" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1012] border border-[#222629]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#c8ff05]" />
                      <span className="font-medium text-white">{isAr ? "نموذج التقييم الفني المعتمد.pdf" : "Technical_Assessment_Rubric.pdf"}</span>
                    </div>
                    <span className="text-[10px] text-[#9aa1a6]">142 KB</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1012] border border-[#222629]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#38bdf8]" />
                      <span className="font-medium text-white">{isAr ? "موافقة ولي الأمر الطبية.pdf" : "Guardian_Consent_Medical.pdf"}</span>
                    </div>
                    <span className="text-[10px] text-[#9aa1a6]">210 KB</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Profile */}
              {activeTab === "profile" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-[#222629] pb-1.5">
                    <span className="text-[#9aa1a6]">{isAr ? "معرّف السجل" : "Entity ID"}</span>
                    <span className="font-mono text-white text-[11px]">{selectedTrial.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#222629] pb-1.5">
                    <span className="text-[#9aa1a6]">{isAr ? "معرّف الرياضي" : "Athlete ID"}</span>
                    <span className="font-mono text-white text-[11px]">{selectedTrial.athleteId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9aa1a6]">{isAr ? "تاريخ الحجز" : "Created At"}</span>
                    <span className="text-white">{selectedTrial.createdAt ? new Date(selectedTrial.createdAt).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Schedule Trial Intake Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#c8ff05]" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "حجز موعد تجربة أداء جديدة" : "Schedule New Skill Trial"}
                </h3>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الرياضي" : "Athlete"}</label>
                <GenericSelect
                  options={athleteOptions}
                  value={athleteId}
                  onChange={(val: string) => setAthleteId(val)}
                  placeholder={loadingSelectors ? (isAr ? "جاري تحميل الرياضيين..." : "Loading athletes...") : (isAr ? "اختر الرياضي..." : "Select athlete...")}
                  disabled={loadingSelectors}
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "عرض البرنامج" : "Program Offering"}</label>
                <GenericSelect
                  options={offeringOptions}
                  value={offeringId}
                  onChange={(val: string) => setOfferingId(val)}
                  placeholder={loadingSelectors ? (isAr ? "جاري تحميل العروض..." : "Loading offerings...") : (isAr ? "اختر العرض..." : "Select offering...")}
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
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الوقت" : "Time"}</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="h-8 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] text-white font-semibold hover:bg-[#1f2428]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleScheduleSubmit}
                disabled={!athleteId || !offeringId || !scheduledDate}
                className="h-8 px-4 bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {isAr ? "تأكيد الحجز" : "Confirm Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Technical Evaluation Modal */}
      {showEvalModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#c8ff05]" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "تسجيل التقييم الفني" : "Record Technical Evaluation"}
                </h3>
              </div>
              <button onClick={() => setShowEvalModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#14171a] border border-[#222629]">
                <div className="font-bold text-white text-sm">
                  {isAr ? (activeTrial.athleteNameAr || activeTrial.athleteNameEn) : (activeTrial.athleteNameEn || activeTrial.athleteNameAr || "Athlete")}
                </div>
                <div className="text-[#9aa1a6] text-xs">
                  {isAr ? (activeTrial.offeringNameAr || activeTrial.offeringNameEn) : (activeTrial.offeringNameEn || activeTrial.offeringNameAr)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الدرجة الفنية (من 10)" : "Technical Score (out of 10)"}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={techScore}
                    onChange={(e) => setTechScore(parseFloat(e.target.value) || 8)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "المستوى الموصى به" : "Recommended Level"}</label>
                  <select
                    value={recLevel}
                    onChange={(e) => setRecLevel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  >
                    <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                    <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                    <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                    <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "التوصية الفنية" : "Technical Recommendation"}</label>
                <input
                  type="text"
                  value={techRec}
                  onChange={(e) => setTechRec(e.target.value)}
                  placeholder={isAr ? "مثال: ترقية للمستوى الثاني، بحاجة لتدريب لياقة..." : "e.g. Advance to Squad, Needs fitness..."}
                  className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات المدرب" : "Coach Notes"}</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                className="h-8 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] text-white font-semibold hover:bg-[#1f2428]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleEvalSubmit}
                className="h-8 px-4 bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
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
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#c8ff05]" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "تسجيل القرار الإداري للتجربة" : "Record Admission Decision"}
                </h3>
              </div>
              <button onClick={() => setShowDecideModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#14171a] border border-[#222629]">
                <div className="font-bold text-white text-sm">
                  {isAr ? (activeTrial.athleteNameAr || activeTrial.athleteNameEn) : (activeTrial.athleteNameEn || activeTrial.athleteNameAr || "Athlete")}
                </div>
                <div className="text-[#9aa1a6] text-xs">
                  {isAr ? (activeTrial.offeringNameAr || activeTrial.offeringNameEn) : (activeTrial.offeringNameEn || activeTrial.offeringNameAr)}
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "نوع القرار" : "Admission Decision"}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType("Approved")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Approved"
                        ? "bg-[#122815] text-[#4ade80] border border-[#22c55e]"
                        : "bg-[#14171a] text-[#9aa1a6] border border-[#222629]"
                    }`}
                  >
                    {isAr ? "قبول (Approved)" : "Approved"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Waitlisted")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Waitlisted"
                        ? "bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]"
                        : "bg-[#14171a] text-[#9aa1a6] border border-[#222629]"
                    }`}
                  >
                    {isAr ? "قائمة انتظار" : "Waitlisted"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType("Rejected")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      decisionType === "Rejected"
                        ? "bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]"
                        : "bg-[#14171a] text-[#9aa1a6] border border-[#222629]"
                    }`}
                  >
                    {isAr ? "رفض (Rejected)" : "Rejected"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات القرار الإداري" : "Decision Notes"}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  placeholder={isAr ? "أسباب القبول أو شروط التسجيل..." : "State placement reasons or conditions..."}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <button
                type="button"
                onClick={() => setShowDecideModal(false)}
                className="h-8 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] text-white font-semibold hover:bg-[#1f2428]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleDecideSubmit}
                className="h-8 px-4 bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
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
'''

with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\trials\src\presentation\views\AcademyTrialsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AcademyTrialsView.tsx written successfully!")
