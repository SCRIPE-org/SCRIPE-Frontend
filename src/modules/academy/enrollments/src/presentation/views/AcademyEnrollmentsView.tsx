"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS, checkGroupAgeEligibility } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyEnrollmentsViewModel } from "../viewmodels/useAcademyEnrollmentsViewModel";
import type { AcademyEnrollment, EnrollmentStatus, BillingStatus } from "../../domain/entities/AcademyEnrollment";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import {
  Layers,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  Check,
  ShieldCheck,
  CreditCard,
  Activity,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  SlidersHorizontal,
  Download,
  Users,
  User,
  ClipboardCheck,
  ListOrdered,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  ArrowLeft,
  DollarSign
} from "lucide-react";

function getAthleteInitials(nameEn?: string | null, nameAr?: string | null): string {
  if (nameEn) {
    const parts = nameEn.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameEn.substring(0, 2).toUpperCase();
  }
  if (nameAr) return nameAr.substring(0, 2);
  return "EN";
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

function getEnrollmentStatusBadge(status: EnrollmentStatus, isAr: boolean) {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-accent-fill/15 text-success border border-success/30">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "نشط" : "Active"}
        </span>
      );
    case "Draft":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line">
          {isAr ? "مسودة" : "Draft"}
        </span>
      );
    case "Review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning/15 text-warning border border-warning/40">
          <ClipboardCheck className="h-3 w-3" />
          {isAr ? "قيد المراجعة" : "Review"}
        </span>
      );
    case "PendingFinance":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning/15 text-warning border border-warning/40">
          {isAr ? "بانتظار المالية" : "Pending Finance"}
        </span>
      );
    case "Paused":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning/15 text-warning border border-warning/40">
          {isAr ? "موقوف مؤقتاً" : "Paused"}
        </span>
      );
    case "Transferred":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-info border border-info/30">
          {isAr ? "محول" : "Transferred"}
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-nx-raised text-info border border-info/30">
          {isAr ? "مكتمل" : "Completed"}
        </span>
      );
    case "Withdrawn":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-destructive/15 text-destructive border border-destructive/30">
          {isAr ? "منسحب" : "Withdrawn"}
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

function getBillingBadge(billingStatus: BillingStatus, isAr: boolean) {
  switch (billingStatus) {
    case "Invoiced":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-nx-accent-fill/15 text-success border border-success/30">
          <Check className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "مفوتر" : "Invoiced"}
        </span>
      );
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-nx-accent-fill/15 text-success border border-success/30">
          <Check className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "مدفوع" : "Paid"}
        </span>
      );
    case "Waived":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-nx-raised text-info border border-info/30">
          {isAr ? "منحة / معفى" : "Waived"}
        </span>
      );
    case "Unbilled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-warning/15 text-warning border border-warning/40">
          {isAr ? "غير مفوتر" : "Unbilled"}
        </span>
      );
    case "Overdue":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/30">
          {isAr ? "متأخر" : "Overdue"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line">
          {billingStatus}
        </span>
      );
  }
}

export function AcademyEnrollmentsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonFilter = searchParams?.get("seasonId");

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_CREATE);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_UPDATE);
  const canOverrideAge = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_OVERRIDE);

  const locator = useAcademyServiceLocator();
  const vm = useAcademyEnrollmentsViewModel(locator.enrollmentsRepository);

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "activity" | "documents">("overview");

  // Filter toolbar
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailWorkspace, setShowDetailWorkspace] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState<AcademyEnrollment | null>(null);
  const [invoiceRefInput, setInvoiceRefInput] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "create" || params.get("create") === "true") {
        setShowCreateModal(true);
      }
      if (params.get("view") === "detail" || params.get("detail") === "true") {
        setShowDetailWorkspace(true);
      }
    }
  }, [vm.enrollments]);

  // Selectors State for creation
  const [athleteOptions, setAthleteOptions] = useState<GenericSelectOption[]>([]);
  const [offeringOptions, setOfferingOptions] = useState<GenericSelectOption[]>([]);
  const [athletesList, setAthletesList] = useState<any[]>([]);
  const [offeringsList, setOfferingsList] = useState<any[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loadingSelectors, setLoadingSelectors] = useState(false);

  // Create Form State
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [priceAmount, setPriceAmount] = useState<number>(500);
  const [priceCurrency, setPriceCurrency] = useState("SAR");
  const [notes, setNotes] = useState("");
  const [ageOverrideJustification, setAgeOverrideJustification] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadSelectors() {
      setLoadingSelectors(true);
      try {
        const [athletes, offerings, programs] = await Promise.all([
          locator.athletesRepository.getAthletes().catch(() => []),
          locator.offeringsRepository.fetchOfferings().catch(() => []),
          locator.programsRepository.fetchPrograms().catch(() => []),
        ]);
        if (!mounted) return;
        setAthletesList(athletes || []);
        setOfferingsList(offerings || []);
        setProgramsList(programs || []);
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
            description: `Fee: ${o.priceAmount ?? 500} ${o.priceCurrency ?? "SAR"}`,
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

  const selectedAthlete = athletesList.find(a => a.id === athleteId);
  const selectedOffering = offeringsList.find(o => o.id === offeringId);
  const selectedProgram = programsList.find(p => p.id === selectedOffering?.programId);
  const seasonRefYear = selectedOffering?.startDate ? new Date(selectedOffering.startDate).getFullYear() : undefined;

  const enrollmentAgeCheck = checkGroupAgeEligibility(
    selectedAthlete?.dateOfBirth,
    selectedProgram?.minAge ?? selectedOffering?.minAge,
    selectedProgram?.maxAge ?? selectedOffering?.maxAge,
    seasonRefYear
  );

  const handleCreateSubmit = async () => {
    if (!athleteId || !offeringId) return;
    if (enrollmentAgeCheck.isOverAge) return;
    if (enrollmentAgeCheck.isUnderAge && (!canOverrideAge || !ageOverrideJustification.trim())) return;

    try {
      await vm.createEnrollment({
        athleteId,
        offeringId,
        priceAmount,
        priceCurrency,
        notes: notes.trim() || undefined,
        ageOverrideJustification: enrollmentAgeCheck.isUnderAge ? ageOverrideJustification.trim() : null
      });
      setShowCreateModal(false);
      setAthleteId("");
      setOfferingId("");
      setNotes("");
      setAgeOverrideJustification("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleHandoffToFinance = async () => {
    if (!targetEnrollment || !invoiceRefInput.trim()) return;
    try {
      await vm.handoffToFinance(targetEnrollment.id, { notes: invoiceRefInput.trim() });
      setShowFinanceModal(false);
      setTargetEnrollment(null);
      setInvoiceRefInput("");
    } catch {
      // Handled in viewmodel
    }
  };

  // Resolve offerings belonging to season if filtered
  const seasonOfferingIds = useMemo(() => {
    if (!seasonFilter) return null;
    return new Set(offeringsList.filter((o: any) => o.seasonId === seasonFilter).map((o: any) => o.id));
  }, [offeringsList, seasonFilter]);

  const displayedOfferingOptions = useMemo(() => {
    if (!seasonFilter) return offeringOptions;
    return offeringOptions.filter((opt) => {
      const off = offeringsList.find((o) => o.id === opt.value);
      return off ? off.seasonId === seasonFilter : true;
    });
  }, [offeringOptions, seasonFilter, offeringsList]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return vm.enrollments.filter((e) => {
      if (seasonFilter && seasonOfferingIds) {
        if (!e.offeringId || !seasonOfferingIds.has(e.offeringId)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const athleteEn = e.athleteNameEn?.toLowerCase() || "";
        const athleteAr = e.athleteNameAr?.toLowerCase() || "";
        const offeringEn = e.offeringNameEn?.toLowerCase() || "";
        const offeringAr = e.offeringNameAr?.toLowerCase() || "";
        const invoiceRef = e.financeInvoiceReference?.toLowerCase() || "";
        if (!athleteEn.includes(q) && !athleteAr.includes(q) && !offeringEn.includes(q) && !offeringAr.includes(q) && !invoiceRef.includes(q)) {
          return false;
        }
      }
      if (statusFilter !== "all" && e.status !== statusFilter) {
        return false;
      }
      if (billingFilter !== "all" && e.billingStatus !== billingFilter) {
        return false;
      }
      return true;
    });
  }, [vm.enrollments, searchQuery, statusFilter, billingFilter, seasonFilter, seasonOfferingIds]);

  // Selected Item
  const selectedItem = useMemo(() => {
    if (selectedId) {
      const found = filteredRows.find(r => r.id === selectedId);
      if (found) return found;
    }
    return filteredRows.length > 0 ? filteredRows[0] : null;
  }, [filteredRows, selectedId]);

  // Dynamic KPI Metrics calculated from real enrollments in ViewModel (DEF-008: distinct active enrolled athletes)
  const activeEnrolledAthletesCount = useMemo(() => new Set(vm.enrollments.filter(e => e.status === "Active").map(e => e.athleteId)).size, [vm.enrollments]);
  const totalDistinctAthletesCount = useMemo(() => new Set(vm.enrollments.map(e => e.athleteId)).size, [vm.enrollments]);
  const pendingReviewCount = useMemo(() => vm.enrollments.filter(e => e.status === "Review" || e.status === "Draft" || e.status === "PendingFinance").length, [vm.enrollments]);
  const pendingPaymentCount = useMemo(() => vm.enrollments.filter(e => e.billingStatus === "Unbilled" || e.billingStatus === "Overdue").length, [vm.enrollments]);
  const pausedOrTransferredCount = useMemo(() => vm.enrollments.filter(e => e.status === "Paused" || e.status === "Transferred").length, [vm.enrollments]);
  const withdrawnOrCompletedCount = useMemo(() => vm.enrollments.filter(e => e.status === "Withdrawn" || e.status === "Completed" || e.status === "Cancelled").length, [vm.enrollments]);

  if (!canView) {
    return (
      <div className="p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{isAr ? "غير مصرح" : "Unauthorized"}</AlertTitle>
          <AlertDescription>
            {isAr
              ? "ليس لديك صلاحية لعرض سجلات التسجيل والقيد بالأكاديمية."
              : "You do not have permission to view Academy enrollments."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="relative isolate overflow-hidden min-h-screen text-nx-ink p-5 sm:p-7 space-y-4 academy-bg"
      dir={dir}
    >
      {/* Header Watermark */}
      <div className="pointer-events-none absolute top-0 end-0 w-[520px] h-[220px] overflow-hidden z-0 select-none opacity-35 dark:opacity-25" aria-hidden="true">
        <img
          src="/images/academy/backgrounds/brand-decor/scripe-lime-mark-watermark.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain object-right-top rtl:scale-x-[-1]"
        />
      </div>

      {/* 1. Breadcrumbs */}
      <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-nx-ink-2">
        <Link href="/academy" className="hover:text-nx-ink transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
          <span>{isAr ? "لوحة الأكاديمية" : "Academy Overview"}</span>
        </Link>
        <span>/</span>
        <span className="text-nx-ink font-semibold">{isAr ? "التسجيلات والقيد" : "Enrollments"}</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-raised text-nx-accent shadow-nx-glow shrink-0">
            <Layers className="h-6 w-6 text-nx-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isAr ? "التسجيلات والقيد الأكاديمي" : "Enrollments"}
            </h1>
            <p className="text-xs text-nx-ink-2 mt-0.5">
              {isAr
                ? "قوائم الطلاب المسجلين، وجداول الفوترة، والتسكين في المجموعات التدريبية."
                : "Active student enrollments, billing schedules, and roster assignments."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Athlete,Offering,Date,Status,Billing,Price", ...vm.enrollments.map(e => `${e.id},${e.athleteNameEn || ""},${e.offeringNameEn || ""},${e.enrollmentDate},${e.status},${e.billingStatus},${e.priceAmount}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `academy_enrollments_${new Date().toISOString().slice(0,10)}.csv`);
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
              onClick={() => setShowCreateModal(true)}
              className="h-9 px-4 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c6ff00]/20 cursor-pointer border-none"
            >
              <Plus className="h-3.5 w-3.5 text-black stroke-[3]" />
              <span>{isAr ? "إنشاء تسجيل جديد" : "New Enrollment"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. 5 Real KPI Metric Cards with Honest Operational Context (No Fabricated Sparklines) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Enrolled Athletes (Glowing Signal Lime Highlight - DEF-008) */}
        <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
                <Users className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2 py-0.5 rounded-full border border-nx-accent-fill/40">
                {isAr ? "نشط (فريد)" : "Active (Distinct)"}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black tracking-tight text-nx-ink">{activeEnrolledAthletesCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "الرياضيون المسجلون النشطون" : "Active Enrolled Athletes"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 pt-3 mt-3 border-t border-nx-accent-fill/40">
            <span>{isAr ? "نسبة الرياضيين النشطين" : "Share of Distinct"}</span>
            <span className="font-mono font-bold text-nx-accent">
              {totalDistinctAthletesCount > 0 ? `${Math.round((activeEnrolledAthletesCount / totalDistinctAthletesCount) * 100)}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-raised border border-nx-line text-warning">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-warning bg-warning/15 px-2 py-0.5 rounded-full border border-warning/30">
                {isAr ? "قيد المراجعة" : "Under Review"}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black tracking-tight text-white">{pendingReviewCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "قيد المراجعة" : "Pending Review"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 pt-3 mt-3 border-t border-nx-line">
            <span>{isAr ? "الإجراء المطلوب" : "Required Action"}</span>
            <span className="text-warning font-semibold">{isAr ? "مراجعة المشرف" : "Staff Review"}</span>
          </div>
        </div>

        {/* Card 3: Pending Payment / Finance */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-raised border border-nx-line text-destructive">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-destructive bg-destructive/15 px-2 py-0.5 rounded-full border border-destructive/30">
                {isAr ? "مستحق الفوترة" : "Receivable"}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black tracking-tight text-white">{pendingPaymentCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "في انتظار الفوترة / السداد" : "Pending Payment"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 pt-3 mt-3 border-t border-nx-line">
            <span>{isAr ? "حالة الفاتورة" : "Finance Status"}</span>
            <span className="text-destructive font-semibold">{isAr ? "غير مفوتر" : "Uninvoiced"}</span>
          </div>
        </div>

        {/* Card 4: Paused / Transfer */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-raised border border-nx-line text-info">
                <ListOrdered className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-info bg-info/15 px-2 py-0.5 rounded-full border border-info/40">
                {isAr ? "موقف / محول" : "Paused / Transfer"}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black tracking-tight text-white">{pausedOrTransferredCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "تعديلات القيد" : "Paused / Transferred"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 pt-3 mt-3 border-t border-nx-line">
            <span>{isAr ? "نوع التعديل" : "Adjustment"}</span>
            <span className="text-info font-semibold">{isAr ? "تجميد / نقل" : "Cohort Hold"}</span>
          </div>
        </div>

        {/* Card 5: Withdrawn / Completed */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-raised border border-nx-line text-nx-ink-2">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-nx-ink-2 bg-nx-raised px-2 py-0.5 rounded-full border border-nx-line">
                {isAr ? "منتهي / منسحب" : "Archived"}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black tracking-tight text-white">{withdrawnOrCompletedCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "المنسحبون والمكتملون" : "Withdrawn / Completed"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 pt-3 mt-3 border-t border-nx-line">
            <span>{isAr ? "حالة السجل" : "Record State"}</span>
            <span className="text-nx-ink-2 font-semibold">{isAr ? "أرشيف تاريخي" : "Historical"}</span>
          </div>
        </div>
      </div>

      {/* Season Scope Banner */}
      {seasonFilter && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/10 text-xs">
          <div className="flex items-center gap-2 text-nx-ink">
            <span className="font-semibold text-nx-accent">
              {isAr ? "تصفية بنطاق الموسم:" : "Filtered by Season Context:"}
            </span>
            <span className="font-mono text-nx-ink-2">
              {seasonFilter} ({filteredRows.length} {isAr ? "تسجيلات" : "enrollments"})
            </span>
          </div>
          <button
            onClick={() => router.push("/academy/enrollments")}
            className="px-2.5 py-1 rounded-lg border border-nx-line bg-nx-raised text-[11px] font-semibold text-nx-ink-2 hover:text-nx-ink cursor-pointer"
          >
            {isAr ? "إلغاء التصفية" : "Clear Filter"}
          </button>
        </div>
      )}

      {/* 4. Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-nx-surface border border-nx-line p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nx-ink-2 pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، المعرّف، أو البرنامج..." : "Search athlete, offering, or invoice..."}
              className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-nx-raised border border-nx-line text-white placeholder:text-nx-ink-3 focus:outline-none focus:border-nx-accent transition-colors rtl:pl-3.5 rtl:pr-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-nx-raised border border-nx-line text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-nx-accent rtl:pr-3.5 rtl:pl-8"
            >
              <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
              <option value="Active">{isAr ? "نشط (Active)" : "Active"}</option>
              <option value="Draft">{isAr ? "مسودة (Draft)" : "Draft"}</option>
              <option value="Review">{isAr ? "مراجعة (Review)" : "Review"}</option>
              <option value="PendingFinance">{isAr ? "بانتظار المالية" : "Pending Finance"}</option>
              <option value="Paused">{isAr ? "موقوف مؤقتاً" : "Paused"}</option>
              <option value="Transferred">{isAr ? "محول (Transferred)" : "Transferred"}</option>
              <option value="Completed">{isAr ? "مكتمل (Completed)" : "Completed"}</option>
              <option value="Withdrawn">{isAr ? "منسحب (Withdrawn)" : "Withdrawn"}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-nx-ink-2 pointer-events-none rtl:right-auto rtl:left-3" />
          </div>

          {/* Billing Filter */}
          <div className="relative">
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-nx-raised border border-nx-line text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-nx-accent rtl:pr-3.5 rtl:pl-8"
            >
              <option value="all">{isAr ? "جميع حالات الفوترة" : "All Billing"}</option>
              <option value="Invoiced">{isAr ? "مفوتر (Invoiced)" : "Invoiced"}</option>
              <option value="Paid">{isAr ? "مدفوع (Paid)" : "Paid"}</option>
              <option value="Unbilled">{isAr ? "غير مفوتر (Unbilled)" : "Unbilled"}</option>
              <option value="Waived">{isAr ? "معفى (Waived)" : "Waived"}</option>
              <option value="Overdue">{isAr ? "متأخر (Overdue)" : "Overdue"}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-nx-ink-2 pointer-events-none rtl:right-auto rtl:left-3" />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => vm.fetchEnrollments()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${vm.loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. 2-Column Operational Workspace matching 04_Enrollments.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Table Panel (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Table Header Row */}
            <div className="grid grid-cols-12 py-2 text-[10px] uppercase font-bold text-nx-ink-2 tracking-wider border-b border-nx-line">
              <div className="col-span-5">{isAr ? "الرياضي" : "Athlete"}</div>
              <div className="col-span-3">{isAr ? "عرض البرنامج" : "Program Offering"}</div>
              <div className="col-span-2">{isAr ? "الحالة" : "Status"}</div>
              <div className="col-span-2 text-right rtl:text-left">{isAr ? "الرسوم / الفوترة" : "Fee / Billing"}</div>
            </div>

            {/* Rows List */}
            {vm.loading ? (
              <div className="py-20 text-center">
                <LoadingSpinner />
                <p className="text-xs text-nx-ink-2 mt-2">{isAr ? "جاري تحميل سجلات التسجيل..." : "Loading enrollment records..."}</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-20 px-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2">
                  <Layers className="h-6 w-6 text-nx-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-nx-ink">{isAr ? "لا توجد سجلات تسجيل مطابقة" : "No Enrollment Records"}</h4>
                  <p className="text-xs text-nx-ink-2 mt-1 max-w-xs mx-auto">
                    {isAr
                      ? "لم يتم العثور على أي تسجيل يطابق التصفية الحالية. يمكنك إنشاء قيد جديد عبر الزر أدناه."
                      : "No enrollments currently match the filter criteria. Register new enrollments using New Enrollment."}
                  </p>
                </div>
                {canCreate && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 px-4 text-xs bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold"
                  >
                    {isAr ? "+ إنشاء تسجيل جديد" : "+ New Enrollment"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-nx-line/50">
                {filteredRows.map((row) => {
                  const isSelected = selectedItem?.id === row.id;
                  const initials = getAthleteInitials(row.athleteNameEn, row.athleteNameAr);
                  const colorClass = getInitialsColor(row.athleteNameEn || row.id);

                  return (
                    <div
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`grid grid-cols-12 py-3 px-2.5 items-center rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border border-nx-accent-fill bg-nx-accent-fill/15/40 shadow-nx-glow"
                          : "hover:bg-nx-raised/80"
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        {/* Deterministic Initials Monogram */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border bg-gradient-to-br ${colorClass}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold text-nx-ink truncate">
                            {isAr ? (row.athleteNameAr || row.athleteNameEn || "رياضي") : (row.athleteNameEn || row.athleteNameAr || "Athlete")}
                          </div>
                          <div className="text-[10px] text-nx-ink-2">
                            ENR-{row.id.slice(0, 6).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 text-xs text-nx-ink-2 truncate">
                        <div className="text-white text-xs font-medium truncate">
                          {isAr ? (row.offeringNameAr || row.offeringNameEn || "—") : (row.offeringNameEn || row.offeringNameAr || "—")}
                        </div>
                        <div className="text-[10px] text-nx-ink-2">{row.enrollmentDate}</div>
                      </div>

                      <div className="col-span-2">
                        {getEnrollmentStatusBadge(row.status, isAr)}
                      </div>

                      <div className="col-span-2 flex flex-col items-end rtl:items-start">
                        <span className="text-xs font-black text-nx-ink">
                          {row.priceAmount} {row.priceCurrency || "SAR"}
                        </span>
                        <span className="mt-0.5">{getBillingBadge(row.billingStatus, isAr)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-nx-line text-xs text-nx-ink-2 mt-2">
            <span>
              {isAr
                ? `عرض ${filteredRows.length} من إجمالي ${vm.enrollments.length} تسجيل`
                : `Showing ${filteredRows.length} of ${vm.enrollments.length} enrollments`}
            </span>
            <span className="text-[10px] text-info">● Live UAT</span>
          </div>
        </div>

        {/* Right Detail Panel (4 cols) matching 04_Enrollments.png */}
        <div className="lg:col-span-4 rounded-2xl border border-nx-line bg-nx-surface p-4 flex flex-col justify-between min-h-[580px]">
          {!selectedItem ? (
            <div className="my-auto text-center text-nx-ink-2 space-y-3 py-16">
              <Layers className="h-10 w-10 text-nx-accent mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-nx-ink">
                {isAr ? "لم يتم تحديد أي تسجيل" : "No Enrollment Selected"}
              </h3>
              <p className="text-xs max-w-xs mx-auto">
                {isAr
                  ? "اختر تسجيلاً من الجدول للاطلاع على تفاصيل الفوترة وتأكيد القيد."
                  : "Select an enrollment record to view financial and billing breakdown."}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Header with Athlete Initials & Record Navigation */}
              <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-nx-glow shrink-0">
                    {getAthleteInitials(selectedItem.athleteNameEn, selectedItem.athleteNameAr)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-nx-ink truncate">
                      {isAr ? (selectedItem.athleteNameAr || selectedItem.athleteNameEn) : (selectedItem.athleteNameEn || selectedItem.athleteNameAr || "Athlete")}
                    </h3>
                    <p className="text-[11px] text-nx-ink-2 truncate mt-0.5">
                      {isAr ? (selectedItem.offeringNameAr || selectedItem.offeringNameEn) : (selectedItem.offeringNameEn || selectedItem.offeringNameAr)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {getEnrollmentStatusBadge(selectedItem.status, isAr)}
                  {getBillingBadge(selectedItem.billingStatus, isAr)}
                </div>
              </div>

              {/* 4 Tabs matching Approved Design */}
              <div className="flex items-center gap-2 border-b border-nx-line pb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "نظرة عامة" : "Overview"}
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "payments"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "المدفوعات" : "Payments"}
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "activity"
                      ? "bg-nx-accent-fill text-black font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "النشاط" : "Activity"}
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
              </div>

              {/* Tab 1: Overview Content */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  {/* Row 1: Side-by-side Lifecycle Stepper + Eligibility Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Card A: Lifecycle Stepper */}
                    <div className="p-3 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-nx-ink-2 block">
                        {isAr ? "دورة القيد" : "Lifecycle"}
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success stroke-[2.5]" />
                          <span className="text-white font-medium">{isAr ? "1. التقديم" : "1. Application"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success stroke-[2.5]" />
                          <span className="text-white font-medium">{isAr ? "2. مسجل" : "2. Enrolled"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="size-3.5 rounded-full bg-nx-accent-fill text-black font-bold text-[9px] flex items-center justify-center">3</span>
                          <span className="text-nx-accent font-bold">{isAr ? "3. نشط" : "3. Active"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-nx-ink-2">
                          <span className="size-3.5 rounded-full border border-nx-line text-[9px] flex items-center justify-center">4</span>
                          <span>{isAr ? "4. مكتمل" : "4. Completed"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card B: Eligibility Checklist */}
                    <div className="p-3 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-nx-ink-2 block">
                        {isAr ? "شروط الأهلية" : "Eligibility"}
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-success stroke-[3]" />
                          <span className="text-white">{isAr ? "مطابقة الفئة العمرية" : "Age Range Met"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-success stroke-[3]" />
                          <span className="text-white">{isAr ? "الفحص الطبي سارٍ" : "Medical Clearance"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-success stroke-[3]" />
                          <span className="text-white">{isAr ? "موافقة ولي الأمر" : "Guardian Consent"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-success stroke-[3]" />
                          <span className="text-white">{isAr ? "اجتياز تجربة الأداء" : "Trial Passed"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Offering Capacity Progress Bar (Dynamic from Offering Domain) */}
                  {(() => {
                    const matchedOffering = offeringsList.find((o: any) => o.id === selectedItem.offeringId);
                    const enrolledCount = matchedOffering?.enrolledCount ?? (selectedItem.status === "Active" ? 1 : 0);
                    const maxCap = matchedOffering?.maxCapacity || 20;
                    const fillPercent = Math.min(100, Math.round((enrolledCount / maxCap) * 100));
                    return (
                      <div className="p-3 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-nx-ink-2 font-semibold">{isAr ? "طاقة استيعاب المجموعة" : "Group Capacity"}</span>
                          <span className="text-nx-accent font-bold">
                            {enrolledCount} / {maxCap} ({fillPercent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-nx-raised overflow-hidden">
                          <div
                            className="h-full rounded-full bg-nx-accent-fill transition-all duration-300"
                            style={{ width: `${Math.max(5, fillPercent)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-nx-ink-2 pt-1 border-t border-nx-line/50">
                          {matchedOffering
                            ? `${isAr && matchedOffering.nameAr ? matchedOffering.nameAr : matchedOffering.nameEn} • ${isAr ? "السعة الرسمية للدفعة المعينة" : "Verified Active Offering Cohort"}`
                            : (isAr ? "البرنامج التدريبي النشط" : "Verified Active Offering Cohort")}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Row 3: Pricing & Financial Summary */}
                  <div className="rounded-xl border border-nx-line bg-nx-raised p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-nx-ink-2">{isAr ? "رسوم الاشتراك المقررة" : "Enrollment Fee Payable"}</span>
                      <span className="text-lg font-black text-nx-accent">
                        {selectedItem.priceAmount} {selectedItem.priceCurrency || "SAR"}
                      </span>
                    </div>

                    <div className="border-t border-nx-line pt-2 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-nx-ink-2">{isAr ? "المرجع المالي / الفاتورة" : "Finance Invoice Ref"}</span>
                        <span className="font-mono text-white text-[11px]">
                          {selectedItem.financeInvoiceReference || (isAr ? "غير مفوتر" : "Pending Handoff")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-nx-ink-2">{isAr ? "تاريخ اعتماد القيد" : "Enrollment Date"}</span>
                        <span className="text-white">{selectedItem.enrollmentDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Action Buttons */}
                  <div className="space-y-2 pt-1 border-t border-nx-line">
                    {/* Handoff to Finance */}
                    {selectedItem.billingStatus === "Unbilled" && canUpdate && (
                      <Button
                        onClick={() => {
                          setTargetEnrollment(selectedItem);
                          setShowFinanceModal(true);
                        }}
                        className="w-full h-9 text-xs bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#c6ff00]/20"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isAr ? "إحالة للمالية والفوترة" : "Handoff to Finance"}</span>
                      </Button>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-2">
                      {canUpdate && selectedItem.status !== "Active" && (
                        <Button
                          onClick={() => vm.activateEnrollment(selectedItem.id)}
                          disabled={vm.loading}
                          className="flex-1 h-8 rounded-lg bg-nx-accent-fill text-black font-bold text-xs hover:bg-nx-accent-fill transition-colors"
                        >
                          {isAr ? "تفعيل القيد" : "Activate Enrollment"}
                        </Button>
                      )}

                      <button
                        onClick={() => {}}
                        className="flex-1 h-8 rounded-lg border border-nx-line bg-nx-raised hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors"
                      >
                        {isAr ? "تغيير المجموعة" : "Change Group"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Payments */}
              {activeTab === "payments" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-nx-line">
                    <div>
                      <p className="font-semibold text-nx-ink">{selectedItem.priceAmount} {selectedItem.priceCurrency || "SAR"}</p>
                      <p className="text-[10px] text-nx-ink-2 mt-0.5">{selectedItem.financeInvoiceReference || "No Invoice Assigned"}</p>
                    </div>
                    {getBillingBadge(selectedItem.billingStatus, isAr)}
                  </div>
                  <p className="text-[11px] text-nx-ink-2">
                    {isAr ? "حالة التسوية المالية مع قسم المحاسبة بالأكاديمية." : "Financial reconciliation state with Academy Accounts Receivable."}
                  </p>
                </div>
              )}

              {/* Tab 3: Activity */}
              {activeTab === "activity" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-nx-accent-fill mt-1.5" />
                    <div>
                      <p className="font-semibold text-nx-ink">{isAr ? "تم تسجيل اللاعب في المجموعة" : "Enrolled into group roster"}</p>
                      <p className="text-[10px] text-nx-ink-2 mt-0.5">{selectedItem.enrollmentDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Documents */}
              {activeTab === "documents" && (
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-nx-accent" />
                      <span className="font-medium text-nx-ink">{isAr ? "استمارة القيد الأكاديمي.pdf" : "Enrollment_Contract.pdf"}</span>
                    </div>
                    <span className="text-[10px] text-nx-ink-2">188 KB</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Screen 19: Create Enrollment Wizard High-Fidelity Modal Workspace */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-nx-surface border border-nx-line shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* 1. Headline Banner matching 19_Enrollment_Create_Wizard.png */}
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface text-nx-accent shadow-[0_7px_20px_rgba(0,0,0,0.4)] text-2xl">
                  ☷
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "إنشاء تسجيل أكاديمي جديد" : "Create Enrollment"}
                  </h1>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {isAr
                      ? "تسجيل رياضي مع مراعاة الأهلية، السعة الاستيعابية، المسؤول المالي، والربط المالي المحكم."
                      : "Enroll an athlete with eligibility, capacity, payer and financial handoff controls."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "حفظ كمسودة" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "إغلاق ✕" : "Close ✕"}
                </button>
              </div>
            </div>

            {/* 2. Flow Progress Steps matching Screen 19 */}
            <div className="p-4 rounded-xl border border-nx-line bg-nx-surface flex items-center justify-between gap-3 overflow-x-auto text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  ✓
                </span>
                <span>{isAr ? "الرياضي" : "Athlete"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-white font-medium">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  ✓
                </span>
                <span>{isAr ? "عرض البرنامج" : "Offering"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-white font-medium">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  ✓
                </span>
                <span>{isAr ? "الأهلية والسعة" : "Eligibility"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-nx-accent font-bold">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-accent-fill text-nx-on-fill">
                  4
                </span>
                <span>{isAr ? "المسؤول المالي والسعر" : "Payer & Price"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-nx-raised" />

              <div className="flex items-center gap-2 text-nx-ink-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-nx-raised text-nx-ink-2">
                  5
                </span>
                <span>{isAr ? "المراجعة والتفعيل" : "Review"}</span>
              </div>
            </div>

            {/* 3. 2-Column Content Grid matching Screen 19 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (8 cols): Form Panel */}
              <div className="lg:col-span-8 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "إنشاء تسجيل أكاديمي جديد" : "Create Enrollment"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      {isAr ? "الخطوة 4 / 5" : "Step 4 / 5"}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-nx-ink">
                    {isAr ? "تأكيد المسؤولية المالية والرسوم" : "Confirm commercial responsibility"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block font-semibold">
                        {isAr ? "الرياضي *" : "Athlete *"}
                      </label>
                      <GenericSelect
                        searchable
                        options={athleteOptions}
                        value={athleteId}
                        onValueChange={(v: any) => setAthleteId(v as string)}
                        placeholder={isAr ? "اختر الرياضي..." : "Select Athlete..."}
                        loading={loadingSelectors}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block font-semibold">
                        {isAr ? "عرض البرنامج *" : "Program Offering *"}
                      </label>
                      <GenericSelect
                        searchable
                        options={displayedOfferingOptions}
                        value={offeringId}
                        onValueChange={(v: any) => setOfferingId(v as string)}
                        placeholder={isAr ? "اختر عرض البرنامج..." : "Select Program Offering..."}
                        loading={loadingSelectors}
                      />
                    </div>
                  </div>

                  {/* Age Eligibility Feedback */}
                  {athleteId && offeringId && (
                    <div className="space-y-3 pt-2">
                      {enrollmentAgeCheck.isOverAge && (
                        <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive font-medium">
                          {isAr ? enrollmentAgeCheck.reasonAr : enrollmentAgeCheck.reasonEn}
                        </div>
                      )}

                      {enrollmentAgeCheck.isUnderAge && canOverrideAge && (
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg border border-warning/40 bg-warning/10 text-xs text-warning font-medium">
                            {isAr ? enrollmentAgeCheck.reasonAr : enrollmentAgeCheck.reasonEn}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                              {isAr ? "مبرر استثناء تصعيد الفئة (إلزامي للرقابة) *" : "Playing-Up Override Justification (Mandatory) *"}
                            </label>
                            <textarea
                              required
                              rows={2}
                              value={ageOverrideJustification}
                              onChange={e => setAgeOverrideJustification(e.target.value)}
                              placeholder={isAr ? "أدخل المبرر الفني للتصعيد..." : "Enter technical justification for playing up..."}
                              className="w-full p-2.5 rounded-lg border border-nx-line-hi bg-nx-surface text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {enrollmentAgeCheck.isUnderAge && !canOverrideAge && (
                        <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive font-medium">
                          {isAr
                            ? "اللاعب أصغر سنًا من الفئة المحددة للبرنامج ويتطلب صلاحية استثناء تصعيد الفئة."
                            : "Athlete is under-age and requires playing-up override permission."}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-xs divide-y divide-nx-line">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "الرياضي المحدد:" : "Selected Athlete:"}</span>
                      <b className="text-white">{athleteOptions.find(o => o.value === athleteId)?.label || "—"}</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "عرض البرنامج:" : "Program Offering:"}</span>
                      <b className="text-white">{offeringOptions.find(o => o.value === offeringId)?.label || "—"}</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "السعة عند التفعيل:" : "Capacity at activation:"}</span>
                      <b className="text-white">
                        {selectedOffering ? `${selectedOffering.enrolledCount ?? 0} / ${selectedOffering.maxCapacity ?? 20}` : "—"}
                      </b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "ولي الأمر:" : "Guardian"}</span>
                      <b className="text-white">Khaled Mostafa</b>
                    </div>
                  </div>

                  <div className="h-px bg-nx-raised" />

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "المسؤول عن الدفع" : "Responsible payer"}</label>
                      <select
                        defaultValue="Khaled"
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      >
                        <option value="Khaled">{isAr ? "خالد مصطفى ▾" : "Khaled Mostafa ▾"}</option>
                        <option value="Direct">{isAr ? "سداد ذاتي" : "Self-pay"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-nx-ink-2 mb-1.5 block">{isAr ? "الخيار التجاري" : "Commercial option"}</label>
                      <select
                        defaultValue="Monthly"
                        className="w-full h-10 px-3 rounded-lg bg-nx-surface border border-nx-line-hi text-white text-xs focus:outline-none focus:border-nx-accent"
                      >
                        <option value="Monthly">{isAr ? "خطة شهرية ▾" : "Monthly plan ▾"}</option>
                        <option value="FullSeason">{isAr ? "موسم كامل" : "Full Season"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-gradient-to-r from-nx-accent-fill/15 to-nx-accent-fill/15 text-xs">
                    <b className="text-white">Resolved quote · EGP 1,500 / month</b>
                    <p className="text-nx-ink-2 text-[11px] mt-0.5">Reference from Catalog & Pricing (illustrative; not Academy-owned financial truth).</p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-nx-line flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    {isAr ? "← رجوع" : "← Back"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSubmit}
                    disabled={
                      !athleteId ||
                      !offeringId ||
                      enrollmentAgeCheck.isOverAge ||
                      (enrollmentAgeCheck.isUnderAge && (!canOverrideAge || !ageOverrideJustification.trim()))
                    }
                    className="px-6 py-2 rounded-lg bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill disabled:opacity-40 cursor-pointer"
                  >
                    {isAr ? "مراجعة القيد والتفعيل →" : "Review Enrollment →"}
                  </button>
                </div>
              </div>

              {/* Right Column (4 cols): Pre-Activation Checks */}
              <div className="lg:col-span-4 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "فحوصات ما قبل التفعيل" : "Pre-Activation Checks"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      Backend authoritative
                    </span>
                  </div>

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider">
                    Enrollment readiness
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-nx-line">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">{isAr ? "الأهلية العمرية" : "Eligibility"}</span>
                      {!athleteId || !offeringId ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-raised text-nx-ink-2 border border-nx-line">
                          {isAr ? "في انتظار الاختيار" : "Pending Selection"}
                        </span>
                      ) : enrollmentAgeCheck.isOverAge ? (
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/40"
                          title={isAr ? enrollmentAgeCheck.reasonAr || "" : enrollmentAgeCheck.reasonEn || ""}
                        >
                          {isAr ? "غير مؤهل (أكبر سنًا)" : "Blocked (Over-age)"}
                        </span>
                      ) : enrollmentAgeCheck.isUnderAge ? (
                        canOverrideAge ? (
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning border border-warning/30"
                            title={isAr ? enrollmentAgeCheck.reasonAr || "" : enrollmentAgeCheck.reasonEn || ""}
                          >
                            {isAr ? "يتطلب استثناء" : "Override Required"}
                          </span>
                        ) : (
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/40"
                            title={isAr ? enrollmentAgeCheck.reasonAr || "" : enrollmentAgeCheck.reasonEn || ""}
                          >
                            {isAr ? "غير مؤهل (أصغر سنًا)" : "Blocked (Under-age)"}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                          {isAr ? "مؤهل" : "Passed"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Group capacity</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Guardian linkage</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Payer</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                        Explicit
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Finance handoff</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning border border-warning/30">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-xs text-nx-accent">
                  {isAr
                    ? "يخضع تفعيل القيد لسياسات الأكاديمية الحاكمة. تتم معالجة حالة الفاتورة والمدفوعات عبر نظام المالية (Finance) مع ضمان استرداد حالات فشل الإحالة."
                    : "Enrollment activation remains governed by Academy policy. Invoice/payment status is handled through Finance, with recoverable handoff failures."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 16: Enrollment Details High-Fidelity Modal Workspace */}
      {showDetailWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-nx-surface border border-nx-line shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* 1. Headline Banner matching 16_Enrollment_Detail.png */}
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface text-nx-accent shadow-[0_7px_20px_rgba(0,0,0,0.4)] text-2xl">
                  ☷
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "تفاصيل القيد الأكاديمي" : "Enrollment Details"}
                  </h1>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {isAr
                      ? "مراجعة قيد الرياضي، السجل التاريخي، التكليفات، وحالة الارتباط المالي."
                      : "Review an athlete enrollment, history, assignments, and finance-linked status."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailWorkspace(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-ink transition-colors cursor-pointer"
                >
                  {isAr ? "← جميع القيود" : "← All Enrollments"}
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface hover:bg-nx-raised text-xs font-semibold text-nx-accent transition-colors cursor-pointer"
                >
                  {isAr ? "إجراءات إضافية ▾" : "More Actions ▾"}
                </button>
              </div>
            </div>

            {/* 2. 4 Top Metrics matching Screen 16 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ▤
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "مرجع القيد" : "Enrollment Reference"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="my-2"><p className="text-xl font-black text-nx-ink">ENR-2026-001248</p></div>
                <p className="text-[11px] text-nx-ink-2">Verified registered enrollment</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ◈
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "عرض البرنامج" : "Program Offering"}</span>
                  </div>
                </div>
                <div className="my-2"><p className="text-xl font-black text-nx-ink">U10 Football</p></div>
                <p className="text-[11px] text-nx-ink-2">Season 2026/27</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ☑
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "المجموعة المسندة" : "Assigned Group"}</span>
                  </div>
                </div>
                <div className="my-2"><p className="text-xl font-black text-nx-ink">1</p></div>
                <p className="text-[11px] text-nx-ink-2">U10 — Group A</p>
              </div>

              <div className="rounded-xl border border-nx-line-hi bg-nx-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                      ◷
                    </div>
                    <span className="text-xs font-medium text-nx-ink-2">{isAr ? "الحصص القادمة" : "Upcoming Sessions"}</span>
                  </div>
                </div>
                <div className="my-2"><p className="text-xl font-black text-nx-ink">2</p></div>
                <p className="text-[11px] text-nx-ink-2">Next: Friday 04:00 PM</p>
              </div>
            </div>

            {/* 3. 2-Column Content Grid matching Screen 16 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (8 cols): Enrollment Overview */}
              <div className="lg:col-span-8 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "نظرة عامة على القيد" : "Enrollment Overview"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      View Audit
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-accent-fill/20 to-nx-surface text-nx-accent">
                        AE
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-nx-ink">Ahmed Essam</h4>
                        <p className="text-xs text-nx-ink-2">U10 Football · Season 2026/27</p>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                      Active
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6 border-b border-nx-line text-xs font-bold">
                    <span className="py-2.5 border-b-2 border-nx-accent-fill text-nx-accent">Overview</span>
                    <span className="py-2.5 text-nx-ink-2">History</span>
                    <span className="py-2.5 text-nx-ink-2">Group Membership</span>
                    <span className="py-2.5 text-nx-ink-2">Payments Summary</span>
                  </div>

                  {/* Split Minicards */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                      <div className="text-[10px] uppercase font-bold text-nx-ink-2 tracking-wider">Enrollment</div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Created on</span><b className="text-white">15 Sep 2026</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Offering</span><b className="text-white">Football Development U10</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Season</span><b className="text-white">2026/27</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Enrollment state</span><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">Active</span></div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised text-xs space-y-2">
                      <div className="text-[10px] uppercase font-bold text-nx-ink-2 tracking-wider">Assignment</div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Training Group</span><b className="text-white">U10 — Group A</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Membership effective</span><b className="text-white">17 Sep 2026</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Coach</span><b className="text-white">Ahmed Hassan</b></div>
                      <div className="flex justify-between"><span className="text-nx-ink-2">Location</span><b className="text-white">External Pitch 2</b></div>
                    </div>
                  </div>

                  <div className="h-px bg-nx-raised" />

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider">
                    Lifecycle Timeline
                  </div>

                  {/* Timeline Rows */}
                  <div className="space-y-2 divide-y divide-nx-line text-xs">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-raised text-nx-ink-2 border border-nx-line-hi">15 SEP</span>
                        <div><b className="text-white">Enrollment created</b><p className="text-[11px] text-nx-ink-2">Initial review completed</p></div>
                      </div>
                      <span className="text-nx-accent font-bold">✓</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-raised text-nx-ink-2 border border-nx-line-hi">16 SEP</span>
                        <div><b className="text-white">Terms accepted</b><p className="text-[11px] text-nx-ink-2">Guardian/payer responsibility confirmed</p></div>
                      </div>
                      <span className="text-nx-accent font-bold">✓</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-raised text-nx-ink-2 border border-nx-line-hi">17 SEP</span>
                        <div><b className="text-white">Enrollment activated</b><p className="text-[11px] text-nx-ink-2">Business policy checks passed</p></div>
                      </div>
                      <span className="text-nx-accent font-bold">✓</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-nx-raised text-nx-ink-2 border border-nx-line-hi">17 SEP</span>
                        <div><b className="text-white">Assigned to Group A</b><p className="text-[11px] text-nx-ink-2">Effective-dated membership created</p></div>
                      </div>
                      <span className="text-nx-accent font-bold">✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Commercial & Next Actions */}
              <div className="lg:col-span-4 rounded-xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                    <h3 className="font-bold text-nx-ink text-base">
                      {isAr ? "الوضع المالي والإجراءات" : "Commercial & Next Actions"}
                    </h3>
                    <span className="text-xs font-bold text-nx-accent">
                      Finance-sourced
                    </span>
                  </div>

                  <div className="text-xs uppercase font-bold text-nx-ink-2 tracking-wider">
                    Financial status (read-only projection)
                  </div>

                  <div>
                    <div className="text-3xl font-black text-nx-ink">EGP 1,500</div>
                    <p className="text-xs text-nx-ink-2">Monthly plan · illustrative amount</p>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-nx-line">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Payer</span>
                      <b className="text-white">Essam Mohamed</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Invoice status</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning border border-warning/30">
                        Partially paid
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Paid to date</span>
                      <b className="text-white">EGP 1,000</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Outstanding</span>
                      <b className="text-white">EGP 500</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-nx-ink-2">Next due</span>
                      <b className="text-white">15 Nov 2026</b>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-xs text-nx-accent">
                    Finance remains the authoritative source for invoices, payments and balances. Enrollment state never proves payment state.
                  </div>
                </div>

                {/* Available Actions Stack */}
                <div className="space-y-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDetailWorkspace(false)}
                    className="w-full py-2.5 rounded-lg bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill cursor-pointer"
                  >
                    View Athlete Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetailWorkspace(false)}
                    className="w-full py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    Transfer Training Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetailWorkspace(false)}
                    className="w-full py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-white font-semibold text-xs hover:bg-nx-raised cursor-pointer"
                  >
                    View Finance Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Handoff to Finance Modal */}
      {showFinanceModal && targetEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-nx-accent" />
                <h3 className="text-base font-bold text-nx-ink">
                  {isAr ? "إحالة القيد لقسم الفوترة المالية" : "Handoff to Finance"}
                </h3>
              </div>
              <button onClick={() => setShowFinanceModal(false)} className="text-nx-ink-2 hover:text-nx-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                <div className="font-bold text-nx-ink text-sm">
                  {isAr ? (targetEnrollment.athleteNameAr || targetEnrollment.athleteNameEn) : (targetEnrollment.athleteNameEn || targetEnrollment.athleteNameAr || "Athlete")}
                </div>
                <div className="text-nx-ink-2 text-xs">
                  {isAr ? (targetEnrollment.offeringNameAr || targetEnrollment.offeringNameEn) : (targetEnrollment.offeringNameEn || targetEnrollment.offeringNameAr)} • {targetEnrollment.priceAmount} {targetEnrollment.priceCurrency || "SAR"}
                </div>
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "رقم الفاتورة المالية (Invoice Reference)" : "Finance Invoice Reference"}</label>
                <input
                  type="text"
                  value={invoiceRefInput}
                  onChange={(e) => setInvoiceRefInput(e.target.value)}
                  placeholder="e.g. INV-HILAL-2026-00002"
                  className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs font-mono focus:outline-none focus:border-nx-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-nx-line">
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="h-8 px-4 rounded-lg border border-nx-line bg-nx-raised text-white font-semibold hover:bg-nx-raised"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleHandoffToFinance}
                disabled={!invoiceRefInput.trim()}
                className="h-8 px-4 bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold"
              >
                {isAr ? "تأكيد الإحالة" : "Confirm Handoff"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
