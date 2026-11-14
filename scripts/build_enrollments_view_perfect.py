import os

content = '''"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
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
    "from-lime-500/20 to-emerald-500/20 text-[#c8ff05] border-[#c8ff05]/40",
    "from-blue-500/20 to-cyan-500/20 text-[#38bdf8] border-[#38bdf8]/40",
    "from-amber-500/20 to-orange-500/20 text-[#fbbf24] border-[#fbbf24]/40",
    "from-purple-500/20 to-indigo-500/20 text-[#c084fc] border-[#c084fc]/40"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getEnrollmentStatusBadge(status: EnrollmentStatus, isAr: boolean) {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "نشط" : "Active"}
        </span>
      );
    case "Draft":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#9aa1a6] border border-[#343b3e]">
          {isAr ? "مسودة" : "Draft"}
        </span>
      );
    case "Review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          <ClipboardCheck className="h-3 w-3" />
          {isAr ? "قيد المراجعة" : "Review"}
        </span>
      );
    case "PendingFinance":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          {isAr ? "بانتظار المالية" : "Pending Finance"}
        </span>
      );
    case "Paused":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          {isAr ? "موقوف مؤقتاً" : "Paused"}
        </span>
      );
    case "Transferred":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          {isAr ? "محول" : "Transferred"}
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          {isAr ? "مكتمل" : "Completed"}
        </span>
      );
    case "Withdrawn":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]/30">
          {isAr ? "منسحب" : "Withdrawn"}
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

function getBillingBadge(billingStatus: BillingStatus, isAr: boolean) {
  switch (billingStatus) {
    case "Invoiced":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <Check className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "مفوتر" : "Invoiced"}
        </span>
      );
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <Check className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "مدفوع" : "Paid"}
        </span>
      );
    case "Waived":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          {isAr ? "منحة / معفى" : "Waived"}
        </span>
      );
    case "Unbilled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          {isAr ? "غير مفوتر" : "Unbilled"}
        </span>
      );
    case "Overdue":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]/30">
          {isAr ? "متأخر" : "Overdue"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#14171a] text-[#9aa1a6] border border-[#2a3033]">
          {billingStatus}
        </span>
      );
  }
}

export function AcademyEnrollmentsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_CREATE);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_UPDATE);

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
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState<AcademyEnrollment | null>(null);
  const [invoiceRefInput, setInvoiceRefInput] = useState("");

  // Selectors State for creation
  const [athleteOptions, setAthleteOptions] = useState<GenericSelectOption[]>([]);
  const [offeringOptions, setOfferingOptions] = useState<GenericSelectOption[]>([]);
  const [loadingSelectors, setLoadingSelectors] = useState(false);

  // Create Form State
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [priceAmount, setPriceAmount] = useState<number>(500);
  const [priceCurrency, setPriceCurrency] = useState("SAR");
  const [notes, setNotes] = useState("");

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

  const handleCreateSubmit = async () => {
    if (!athleteId || !offeringId) return;
    try {
      await vm.createEnrollment({
        athleteId,
        offeringId,
        priceAmount,
        priceCurrency,
        notes: notes.trim() || undefined
      });
      setShowCreateModal(false);
      setAthleteId("");
      setOfferingId("");
      setNotes("");
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

  // Filtered rows
  const filteredRows = useMemo(() => {
    return vm.enrollments.filter((e) => {
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
  }, [vm.enrollments, searchQuery, statusFilter, billingFilter]);

  // Selected Item
  const selectedItem = useMemo(() => {
    if (selectedId) {
      const found = filteredRows.find(r => r.id === selectedId);
      if (found) return found;
    }
    return filteredRows.length > 0 ? filteredRows[0] : null;
  }, [filteredRows, selectedId]);

  // Dynamic KPI Metrics calculated from real enrollments in ViewModel
  const activeCount = useMemo(() => vm.enrollments.filter(e => e.status === "Active").length, [vm.enrollments]);
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
      className="min-h-screen text-[#f5f7f8] p-5 sm:p-7 space-y-4"
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
        <span className="text-white font-semibold">{isAr ? "التسجيلات والقيد" : "Enrollments"}</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8ff05]/40 bg-[#14171a] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
            <Layers className="h-6 w-6 text-[#c8ff05]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isAr ? "التسجيلات والقيد الأكاديمي" : "Enrollments"}
            </h1>
            <p className="text-xs text-[#9aa1a6] mt-0.5">
              {isAr
                ? "قوائم الطلاب المسجلين، وجداول الفوترة، والتسكين في المجموعات التدريبية."
                : "Active student enrollments, billing schedules, and roster assignments."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Athlete,Offering,Date,Status,Billing,Price", ...vm.enrollments.map(e => `${e.id},${e.athleteNameEn || ""},${e.offeringNameEn || ""},${e.enrollmentDate},${e.status},${e.billingStatus},${e.priceAmount}`)].join("\\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `academy_enrollments_${new Date().toISOString().slice(0,10)}.csv`);
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
              onClick={() => setShowCreateModal(true)}
              className="h-9 px-4 rounded-lg bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c8ff05]/20 cursor-pointer border-none"
            >
              <Plus className="h-3.5 w-3.5 text-black stroke-[3]" />
              <span>{isAr ? "إنشاء تسجيل جديد" : "New Enrollment"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. 5 Real KPI Metric Cards with Area Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Enrollments (Glowing Signal Lime Highlight) */}
        <div className="relative rounded-2xl border-2 border-[#c8ff05] bg-[#12160d] p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
              <Users className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2 py-0.5 rounded-full border border-[#5a7800]">
              {isAr ? "نشط" : "Active Roster"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black tracking-tight text-white">{activeCount}</div>
            <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "التسجيلات النشطة" : "Active Enrollments"}</div>
          </div>
          {/* Subtle SVG Sparkline */}
          <div className="h-6 w-full mt-2 opacity-60">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 20 Q 25 10, 50 14 T 100 4 L 100 24 L 0 24 Z" fill="rgba(200, 255, 5, 0.2)" />
              <path d="M0 20 Q 25 10, 50 14 T 100 4" fill="none" stroke="#c8ff05" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ffd24d]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#ffd24d] bg-[#372b09] px-2 py-0.5 rounded-full border border-[#715a12]">
              {isAr ? "قيد المراجعة" : "Under Review"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black tracking-tight text-white">{pendingReviewCount}</div>
            <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "قيد المراجعة" : "Pending Review"}</div>
          </div>
          <div className="h-6 w-full mt-2 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 16 Q 30 18, 60 10 T 100 12 L 100 24 L 0 24 Z" fill="rgba(251, 191, 36, 0.15)" />
              <path d="M0 16 Q 30 18, 60 10 T 100 12" fill="none" stroke="#fbbf24" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 3: Pending Payment / Finance */}
        <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ff8290]">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#ff8290] bg-[#3b1c20] px-2 py-0.5 rounded-full border border-[#7a343e]">
              {isAr ? "مستحق الفوترة" : "Receivable"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black tracking-tight text-white">{pendingPaymentCount}</div>
            <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "في انتظار الفوترة / السداد" : "Pending Payment"}</div>
          </div>
          <div className="h-6 w-full mt-2 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 10 Q 25 20, 50 12 T 100 18 L 100 24 L 0 24 Z" fill="rgba(255, 130, 144, 0.15)" />
              <path d="M0 10 Q 25 20, 50 12 T 100 18" fill="none" stroke="#ff8290" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 4: Paused / Transfer */}
        <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#38bdf8]">
              <ListOrdered className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#38bdf8] bg-[#0c2331] px-2 py-0.5 rounded-full border border-[#38bdf8]/40">
              {isAr ? "موقف / محول" : "Paused / Transfer"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black tracking-tight text-white">{pausedOrTransferredCount}</div>
            <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "تعديلات القيد" : "Paused / Transferred"}</div>
          </div>
          <div className="h-6 w-full mt-2 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 14 Q 30 6, 60 16 T 100 8 L 100 24 L 0 24 Z" fill="rgba(56, 189, 248, 0.15)" />
              <path d="M0 14 Q 30 6, 60 16 T 100 8" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 5: Withdrawn / Completed */}
        <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#9aa1a6]">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#9aa1a6] bg-[#14171a] px-2 py-0.5 rounded-full border border-[#2a3033]">
              {isAr ? "منتهي / منسحب" : "Archived"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black tracking-tight text-white">{withdrawnOrCompletedCount}</div>
            <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "المنسحبون والمكتملون" : "Withdrawn / Completed"}</div>
          </div>
          <div className="h-6 w-full mt-2 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 12 Q 35 18, 70 8 T 100 14 L 100 24 L 0 24 Z" fill="rgba(154, 161, 166, 0.15)" />
              <path d="M0 12 Q 35 18, 70 8 T 100 14" fill="none" stroke="#9aa1a6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#101315] border border-[#222629] p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، المعرّف، أو البرنامج..." : "Search athlete, offering, or invoice..."}
              className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-[#14171a] border border-[#222629] text-white placeholder-[#9aa1a6] focus:outline-none focus:border-[#c8ff05] transition-colors rtl:pl-3.5 rtl:pr-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-[#14171a] border border-[#222629] text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c8ff05] rtl:pr-3.5 rtl:pl-8"
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3" />
          </div>

          {/* Billing Filter */}
          <div className="relative">
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-[#14171a] border border-[#222629] text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c8ff05] rtl:pr-3.5 rtl:pl-8"
            >
              <option value="all">{isAr ? "جميع حالات الفوترة" : "All Billing"}</option>
              <option value="Invoiced">{isAr ? "مفوتر (Invoiced)" : "Invoiced"}</option>
              <option value="Paid">{isAr ? "مدفوع (Paid)" : "Paid"}</option>
              <option value="Unbilled">{isAr ? "غير مفوتر (Unbilled)" : "Unbilled"}</option>
              <option value="Waived">{isAr ? "معفى (Waived)" : "Waived"}</option>
              <option value="Overdue">{isAr ? "متأخر (Overdue)" : "Overdue"}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3" />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => vm.fetchEnrollments()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#222629] bg-[#14171a] text-[#9aa1a6] hover:text-white transition-colors cursor-pointer"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${vm.loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5. 2-Column Operational Workspace matching 04_Enrollments.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Table Panel (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#222629] bg-[#101315] p-4 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Table Header Row */}
            <div className="grid grid-cols-12 py-2 text-[10px] uppercase font-bold text-[#9aa1a6] tracking-wider border-b border-[#222629]">
              <div className="col-span-5">{isAr ? "الرياضي" : "Athlete"}</div>
              <div className="col-span-3">{isAr ? "عرض البرنامج" : "Program Offering"}</div>
              <div className="col-span-2">{isAr ? "الحالة" : "Status"}</div>
              <div className="col-span-2 text-right rtl:text-left">{isAr ? "الرسوم / الفوترة" : "Fee / Billing"}</div>
            </div>

            {/* Rows List */}
            {vm.loading ? (
              <div className="py-20 text-center">
                <LoadingSpinner />
                <p className="text-xs text-[#9aa1a6] mt-2">{isAr ? "جاري تحميل سجلات التسجيل..." : "Loading enrollment records..."}</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-20 px-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a3033] bg-[#14171a] text-[#9aa1a6]">
                  <Layers className="h-6 w-6 text-[#c8ff05]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isAr ? "لا توجد سجلات تسجيل مطابقة" : "No Enrollment Records"}</h4>
                  <p className="text-xs text-[#9aa1a6] mt-1 max-w-xs mx-auto">
                    {isAr
                      ? "لم يتم العثور على أي تسجيل يطابق التصفية الحالية. يمكنك إنشاء قيد جديد عبر الزر أدناه."
                      : "No enrollments currently match the filter criteria. Register new enrollments using New Enrollment."}
                  </p>
                </div>
                {canCreate && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
                  >
                    {isAr ? "+ إنشاء تسجيل جديد" : "+ New Enrollment"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#222629]/50">
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
                          ? "border border-[#c8ff05] bg-[#1a2307]/40 shadow-[0_0_16px_rgba(200,255,5,0.12)]"
                          : "hover:bg-[#14171a]/80"
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        {/* Deterministic Initials Monogram */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border bg-gradient-to-br ${colorClass}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold text-white truncate">
                            {isAr ? (row.athleteNameAr || row.athleteNameEn || "رياضي") : (row.athleteNameEn || row.athleteNameAr || "Athlete")}
                          </div>
                          <div className="text-[10px] text-[#9aa1a6]">
                            ENR-{row.id.slice(0, 6).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 text-xs text-[#9aa1a6] truncate">
                        <div className="text-white text-xs font-medium truncate">
                          {isAr ? (row.offeringNameAr || row.offeringNameEn || "—") : (row.offeringNameEn || row.offeringNameAr || "—")}
                        </div>
                        <div className="text-[10px] text-[#9aa1a6]">{row.enrollmentDate}</div>
                      </div>

                      <div className="col-span-2">
                        {getEnrollmentStatusBadge(row.status, isAr)}
                      </div>

                      <div className="col-span-2 flex flex-col items-end rtl:items-start">
                        <span className="text-xs font-black text-white">
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
          <div className="flex items-center justify-between pt-3 border-t border-[#222629] text-xs text-[#9aa1a6] mt-2">
            <span>
              {isAr
                ? `عرض ${filteredRows.length} من إجمالي ${vm.enrollments.length} تسجيل`
                : `Showing ${filteredRows.length} of ${vm.enrollments.length} enrollments`}
            </span>
            <span className="text-[10px] text-[#73adff]">● Live UAT</span>
          </div>
        </div>

        {/* Right Detail Panel (4 cols) matching 04_Enrollments.png */}
        <div className="lg:col-span-4 rounded-2xl border border-[#222629] bg-[#101315] p-4 flex flex-col justify-between min-h-[580px]">
          {!selectedItem ? (
            <div className="my-auto text-center text-[#9aa1a6] space-y-3 py-16">
              <Layers className="h-10 w-10 text-[#5a7800] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-white">
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
              <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
                    {getAthleteInitials(selectedItem.athleteNameEn, selectedItem.athleteNameAr)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {isAr ? (selectedItem.athleteNameAr || selectedItem.athleteNameEn) : (selectedItem.athleteNameEn || selectedItem.athleteNameAr || "Athlete")}
                    </h3>
                    <p className="text-[11px] text-[#9aa1a6] truncate mt-0.5">
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
              <div className="flex items-center gap-2 border-b border-[#222629] pb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "نظرة عامة" : "Overview"}
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "payments"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "المدفوعات" : "Payments"}
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "activity"
                      ? "bg-[#c8ff05] text-black font-bold shadow-[0_0_12px_rgba(200,255,5,0.2)]"
                      : "text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {isAr ? "النشاط" : "Activity"}
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
              </div>

              {/* Tab 1: Overview Content */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  {/* Row 1: Side-by-side Lifecycle Stepper + Eligibility Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Card A: Lifecycle Stepper */}
                    <div className="p-3 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#9aa1a6] block">
                        {isAr ? "دورة القيد" : "Lifecycle"}
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#4ade80] stroke-[2.5]" />
                          <span className="text-white font-medium">{isAr ? "1. التقديم" : "1. Application"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#4ade80] stroke-[2.5]" />
                          <span className="text-white font-medium">{isAr ? "2. مسجل" : "2. Enrolled"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="size-3.5 rounded-full bg-[#c8ff05] text-black font-bold text-[9px] flex items-center justify-center">3</span>
                          <span className="text-[#c8ff05] font-bold">{isAr ? "3. نشط" : "3. Active"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#9aa1a6]">
                          <span className="size-3.5 rounded-full border border-[#343b3e] text-[9px] flex items-center justify-center">4</span>
                          <span>{isAr ? "4. مكتمل" : "4. Completed"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card B: Eligibility Checklist */}
                    <div className="p-3 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#9aa1a6] block">
                        {isAr ? "شروط الأهلية" : "Eligibility"}
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#4ade80] stroke-[3]" />
                          <span className="text-white">{isAr ? "مطابقة الفئة العمرية" : "Age Range Met"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#4ade80] stroke-[3]" />
                          <span className="text-white">{isAr ? "الفحص الطبي سارٍ" : "Medical Clearance"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#4ade80] stroke-[3]" />
                          <span className="text-white">{isAr ? "موافقة ولي الأمر" : "Guardian Consent"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#4ade80] stroke-[3]" />
                          <span className="text-white">{isAr ? "اجتياز تجربة الأداء" : "Trial Passed"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Offering Capacity Progress Bar */}
                  <div className="p-3 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa1a6] font-semibold">{isAr ? "طاقة استيعاب المجموعة" : "Group Capacity"}</span>
                      <span className="text-[#c8ff05] font-bold">16 / 20 (80%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#1f2428] overflow-hidden">
                      <div className="h-full rounded-full bg-[#c8ff05] w-[80%]" />
                    </div>
                    <p className="text-[10px] text-[#9aa1a6] pt-1 border-t border-[#222629]/50">
                      {isAr ? "الأيام: الإثنين والأربعاء 16:30 • الملعب 2 • كابتن خالد الدوسري" : "Schedule: Mon, Wed 16:30 • Pitch 2 • Coach Al-Dosari"}
                    </p>
                  </div>

                  {/* Row 3: Pricing & Financial Summary */}
                  <div className="rounded-xl border border-[#2a3033] bg-[#14171a] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#9aa1a6]">{isAr ? "رسوم الاشتراك المقررة" : "Enrollment Fee Payable"}</span>
                      <span className="text-lg font-black text-[#c8ff05]">
                        {selectedItem.priceAmount} {selectedItem.priceCurrency || "SAR"}
                      </span>
                    </div>

                    <div className="border-t border-[#222629] pt-2 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#9aa1a6]">{isAr ? "المرجع المالي / الفاتورة" : "Finance Invoice Ref"}</span>
                        <span className="font-mono text-white text-[11px]">
                          {selectedItem.financeInvoiceReference || (isAr ? "غير مفوتر" : "Pending Handoff")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#9aa1a6]">{isAr ? "تاريخ اعتماد القيد" : "Enrollment Date"}</span>
                        <span className="text-white">{selectedItem.enrollmentDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Action Buttons */}
                  <div className="space-y-2 pt-1 border-t border-[#222629]">
                    {/* Handoff to Finance */}
                    {selectedItem.billingStatus === "Unbilled" && canUpdate && (
                      <Button
                        onClick={() => {
                          setTargetEnrollment(selectedItem);
                          setShowFinanceModal(true);
                        }}
                        className="w-full h-9 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#c8ff05]/20"
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
                          className="flex-1 h-8 rounded-lg bg-[#c8ff05] text-black font-bold text-xs hover:bg-[#b2e600] transition-colors"
                        >
                          {isAr ? "تفعيل القيد" : "Activate Enrollment"}
                        </Button>
                      )}

                      <button
                        onClick={() => {}}
                        className="flex-1 h-8 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-xs font-semibold text-white transition-colors"
                      >
                        {isAr ? "تغيير المجموعة" : "Change Group"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Payments */}
              {activeTab === "payments" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#222629]">
                    <div>
                      <p className="font-semibold text-white">{selectedItem.priceAmount} {selectedItem.priceCurrency || "SAR"}</p>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">{selectedItem.financeInvoiceReference || "No Invoice Assigned"}</p>
                    </div>
                    {getBillingBadge(selectedItem.billingStatus, isAr)}
                  </div>
                  <p className="text-[11px] text-[#9aa1a6]">
                    {isAr ? "حالة التسوية المالية مع قسم المحاسبة بالأكاديمية." : "Financial reconciliation state with Academy Accounts Receivable."}
                  </p>
                </div>
              )}

              {/* Tab 3: Activity */}
              {activeTab === "activity" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-[#c8ff05] mt-1.5" />
                    <div>
                      <p className="font-semibold text-white">{isAr ? "تم تسجيل اللاعب في المجموعة" : "Enrolled into group roster"}</p>
                      <p className="text-[10px] text-[#9aa1a6] mt-0.5">{selectedItem.enrollmentDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Documents */}
              {activeTab === "documents" && (
                <div className="p-4 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1012] border border-[#222629]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#c8ff05]" />
                      <span className="font-medium text-white">{isAr ? "استمارة القيد الأكاديمي.pdf" : "Enrollment_Contract.pdf"}</span>
                    </div>
                    <span className="text-[10px] text-[#9aa1a6]">188 KB</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Create Enrollment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#c8ff05]" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "إنشاء تسجيل أكاديمي جديد" : "Create New Academy Enrollment"}
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9aa1a6] hover:text-white">
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
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "قيمة الرسوم" : "Price Amount"}</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "العملة" : "Currency"}</label>
                  <input
                    type="text"
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات القيد والخصم" : "Enrollment Notes"}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                  placeholder={isAr ? "شروط المنحة، خصم الإخوة..." : "Scholarship, sibling discounts..."}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-8 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] text-white font-semibold hover:bg-[#1f2428]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleCreateSubmit}
                disabled={!athleteId || !offeringId}
                className="h-8 px-4 bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {isAr ? "تأكيد القيد" : "Confirm Enrollment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Handoff to Finance Modal */}
      {showFinanceModal && targetEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#c8ff05]" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? "إحالة القيد لقسم الفوترة المالية" : "Handoff to Finance"}
                </h3>
              </div>
              <button onClick={() => setShowFinanceModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#14171a] border border-[#222629]">
                <div className="font-bold text-white text-sm">
                  {isAr ? (targetEnrollment.athleteNameAr || targetEnrollment.athleteNameEn) : (targetEnrollment.athleteNameEn || targetEnrollment.athleteNameAr || "Athlete")}
                </div>
                <div className="text-[#9aa1a6] text-xs">
                  {isAr ? (targetEnrollment.offeringNameAr || targetEnrollment.offeringNameEn) : (targetEnrollment.offeringNameEn || targetEnrollment.offeringNameAr)} • {targetEnrollment.priceAmount} {targetEnrollment.priceCurrency || "SAR"}
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "رقم الفاتورة المالية (Invoice Reference)" : "Finance Invoice Reference"}</label>
                <input
                  type="text"
                  value={invoiceRefInput}
                  onChange={(e) => setInvoiceRefInput(e.target.value)}
                  placeholder="e.g. INV-HILAL-2026-00002"
                  className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#222629] text-white text-xs font-mono focus:outline-none focus:border-[#c8ff05]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="h-8 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] text-white font-semibold hover:bg-[#1f2428]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                onClick={handleHandoffToFinance}
                disabled={!invoiceRefInput.trim()}
                className="h-8 px-4 bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
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
'''

with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\enrollments\src\presentation\views\AcademyEnrollmentsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AcademyEnrollmentsView.tsx written successfully!")
