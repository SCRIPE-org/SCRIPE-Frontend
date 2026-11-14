import os

enrollments_view_code = '''"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyEnrollmentsViewModel } from "../viewmodels/useAcademyEnrollmentsViewModel";
import type { AcademyEnrollment, EnrollmentStatus, BillingStatus } from "../../domain/entities/AcademyEnrollment";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Button } from "@core/ui/button";
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
  DollarSign
} from "lucide-react";

function getAthleteInitials(firstNameEn?: string | null, lastNameEn?: string | null, firstNameAr?: string | null): string {
  if (firstNameEn && lastNameEn) {
    return `${firstNameEn.charAt(0)}${lastNameEn.charAt(0)}`.toUpperCase();
  }
  if (firstNameEn) return firstNameEn.substring(0, 2).toUpperCase();
  if (firstNameAr) return firstNameAr.substring(0, 2);
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

function getEnrollmentStatusBadge(status: EnrollmentStatus | string, isAr: boolean) {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "نشط" : "Active"}
        </span>
      );
    case "Review":
    case "Draft":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2a1d08] text-[#fbbf24] border border-[#f59e0b]/40">
          <ClipboardCheck className="h-3 w-3" />
          {isAr ? "قيد المراجعة" : "Pending Review"}
        </span>
      );
    case "PendingFinance":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]/30">
          <CreditCard className="h-3 w-3" />
          {isAr ? "بانتظار المالية" : "Pending Finance"}
        </span>
      );
    case "Paused":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#9aa1a6] border border-[#343b3e]">
          {isAr ? "موقف مؤقتاً" : "Paused"}
        </span>
      );
    case "Transferred":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          {isAr ? "محول" : "Transferred"}
        </span>
      );
    case "Withdrawn":
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#6b7280] border border-[#374151]">
          <LogOut className="h-3 w-3" />
          {isAr ? "منسحب" : "Withdrawn"}
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#c8ff05] border border-[#c8ff05]/40">
          {isAr ? "مكتمل" : "Completed"}
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

function getBillingBadge(billing: BillingStatus | string, isAr: boolean) {
  switch (billing) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#122815] text-[#4ade80] border border-[#22c55e]/30">
          <Check className="h-3 w-3 stroke-[2.5]" />
          {isAr ? "مدفوع" : "Paid"}
        </span>
      );
    case "Invoiced":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#141b22] text-[#93c5fd] border border-[#3b82f6]/30">
          {isAr ? "تمت الفوترة" : "Invoiced"}
        </span>
      );
    case "Overdue":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2b1114] text-[#ff8290] border border-[#f43f5e]/30">
          {isAr ? "متأخر" : "Overdue"}
        </span>
      );
    case "Waived":
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a2307] text-[#c8ff05] border border-[#c8ff05]/40">
          {isAr ? "معفى" : "Waived"}
        </span>
      );
    case "Unbilled":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#1a1e21] text-[#9aa1a6] border border-[#343b3e]">
          {isAr ? "غير مفوتر" : "Unbilled"}
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

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState<AcademyEnrollment | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [selectedDetailTab, setSelectedDetailTab] = useState<"overview" | "payments" | "metadata">("overview");

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Selectors State for Modal
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
          locator.offeringsRepository.fetchOfferings().catch(() => [])
        ]);
        if (!mounted) return;
        setAthleteOptions(
          athletes.map((a: any) => ({
            value: a.id,
            label: isAr && a.firstNameAr ? `${a.firstNameAr} ${a.lastNameAr || ""}`.trim() : `${a.firstNameEn} ${a.lastNameEn}`.trim(),
            description: a.primarySportCode ? `Sport: ${a.primarySportCode}` : undefined
          }))
        );
        setOfferingOptions(
          offerings.map((o: any) => ({
            value: o.id,
            label: isAr && o.nameAr ? o.nameAr : o.nameEn,
            description: `Enrolled: ${o.enrolledCount ?? 0}/${o.maxCapacity}`
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

  // Form Fields
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [priceAmount, setPriceAmount] = useState<number>(500);
  const [priceCurrency, setPriceCurrency] = useState("SAR");
  const [notes, setNotes] = useState("");
  const [financeNotes, setFinanceNotes] = useState("");

  const handleCreateSubmit = async () => {
    if (!athleteId || !offeringId || priceAmount <= 0) return;
    try {
      await vm.createEnrollment({
        athleteId,
        offeringId,
        priceAmount,
        priceCurrency,
        notes: notes || null
      });
      setShowCreateModal(false);
      setAthleteId("");
      setOfferingId("");
      setNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleFinanceSubmit = async () => {
    if (!targetEnrollment) return;
    try {
      await vm.handoffToFinance(targetEnrollment.id, {
        notes: financeNotes || null
      });
      setShowFinanceModal(false);
      setTargetEnrollment(null);
      setFinanceNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  // Real KPIs derived directly from ViewModel enrollments
  const activeCount = useMemo(() => vm.enrollments.filter(e => e.status === "Active").length, [vm.enrollments]);
  const pendingReviewCount = useMemo(() => vm.enrollments.filter(e => e.status === "Draft" || e.status === "Review").length, [vm.enrollments]);
  const pendingPaymentCount = useMemo(() => vm.enrollments.filter(e => e.status === "PendingFinance" || e.billingStatus === "Unbilled" || e.billingStatus === "Invoiced").length, [vm.enrollments]);
  const pausedOrTransferredCount = useMemo(() => vm.enrollments.filter(e => e.status === "Paused" || e.status === "Transferred").length, [vm.enrollments]);
  const withdrawnOrCompletedCount = useMemo(() => vm.enrollments.filter(e => e.status === "Withdrawn" || e.status === "Cancelled" || e.status === "Completed").length, [vm.enrollments]);

  // Filtered rows strictly from backend domain data
  const filteredRows = useMemo(() => {
    return vm.enrollments.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.athleteNameEn?.toLowerCase() || "").includes(q) || (r.athleteNameAr?.toLowerCase() || "").includes(q);
        const matchesOffering = (r.offeringNameEn?.toLowerCase() || "").includes(q) || (r.offeringNameAr?.toLowerCase() || "").includes(q);
        const matchesRef = (r.financeInvoiceReference?.toLowerCase() || "").includes(q);
        const matchesId = r.id.toLowerCase().includes(q);
        if (!matchesName && !matchesOffering && !matchesRef && !matchesId) return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      if (billingFilter !== "all" && r.billingStatus !== billingFilter) {
        return false;
      }
      return true;
    });
  }, [vm.enrollments, searchQuery, statusFilter, billingFilter]);

  // Selected Enrollment (authoritative)
  const selectedItem = useMemo(() => {
    if (selectedId) {
      const found = filteredRows.find(r => r.id === selectedId);
      if (found) return found;
    }
    return filteredRows.length > 0 ? filteredRows[0] : null;
  }, [filteredRows, selectedId]);

  if (!canView) {
    return (
      <div className="p-8 max-w-xl mx-auto" dir={dir}>
        <div className="rounded-xl border border-red-500/30 bg-[#160d0e] p-6 text-red-300 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-bold text-white">{isAr ? "غير مصرح" : "Access Restricted"}</h2>
          </div>
          <p className="text-xs text-red-300/80">
            {isAr ? "ليس لديك صلاحية لعرض سجلات التسجيل وإدارة السعة المالية للأكاديمية." : "You do not have permission to view Academy enrollments and capacity management."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#f5f7f8] selection:bg-[#c8ff05] selection:text-[#080a0b]"
      style={{
        background: "radial-gradient(ellipse 900px 320px at 85% 0%, rgba(200, 255, 5, 0.055), transparent 75%), #080a0b"
      }}
      dir={dir}
    >
      <div className="max-w-[1640px] mx-auto px-6 py-6 space-y-6">
        {/* Header with Title & Watermark */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2a3033] bg-gradient-to-r from-[#101315] via-[#121619] to-[#0c0f11] p-6 shadow-2xl">
          {/* SCRIPE Branded Neon Watermark */}
          <div className="pointer-events-none absolute right-24 -top-6 bottom-0 w-[420px] opacity-25 mix-blend-screen select-none overflow-hidden">
            <Image
              src="/images/academy/scripe_neon_watermark.png"
              alt=""
              width={420}
              height={180}
              unoptimized
              className="object-contain object-right"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#353d3c] bg-gradient-to-br from-[#222923] to-[#0d1110] text-[#c8ff05] shadow-[0_0_24px_rgba(200,255,5,0.12)]">
                <Layers className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#9aa1a6] mb-1">
                  <Link href="/academy" className="hover:text-[#c8ff05] transition-colors">
                    {isAr ? "عمليات الأكاديمية" : "Academy Operations"}
                  </Link>
                  <span>›</span>
                  <span>{isAr ? "الرياضيون والقبول" : "Athletes & Admissions"}</span>
                  <span>›</span>
                  <span className="text-white font-medium">{isAr ? "التسجيلات" : "Enrollments"}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {isAr ? "التسجيلات" : "Enrollments"}
                </h1>
                <p className="text-xs md:text-sm text-[#9aa1a6] mt-0.5">
                  {isAr
                    ? "إدارة تسجيلات البرامج، الفوترة، الأهلية، الطاقة الاستيعابية، ومشاركات الرياضيين عبر المواسم."
                    : "Manage program enrollments, billing status, capacity, and athlete participation across seasons."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canCreate && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8ff05] hover:bg-[#d4ff33] text-[#131600] font-extrabold text-sm shadow-[0_0_24px_rgba(200,255,5,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isAr ? "+ إنشاء تسجيل جديد" : "+ Create Enrollment"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5 Real KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Active Enrollments (Glowing Signal Lime Highlight) */}
          <div className="relative rounded-2xl border-2 border-[#c8ff05] bg-[#12160d] p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Users className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2 py-0.5 rounded-full border border-[#5a7800]">
                {isAr ? "نشط" : "Active Roster"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white">{activeCount}</div>
              <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "التسجيلات النشطة" : "Active Enrollments"}</div>
            </div>
          </div>

          {/* Card 2: Pending Review */}
          <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ffd24d]">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#ffd24d] bg-[#372b09] px-2 py-0.5 rounded-full border border-[#715a12]">
                {isAr ? "قيد المراجعة" : "Under Review"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white">{pendingReviewCount}</div>
              <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "قيد المراجعة" : "Pending Review"}</div>
            </div>
          </div>

          {/* Card 3: Pending Payment / Finance */}
          <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ff8290]">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#ff8290] bg-[#3b1c20] px-2 py-0.5 rounded-full border border-[#7a343e]">
                {isAr ? "مستحق الفوترة" : "Receivable"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white">{pendingPaymentCount}</div>
              <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "في انتظار الفوترة / السداد" : "Pending Payment"}</div>
            </div>
          </div>

          {/* Card 4: Paused / Transfer */}
          <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#c8ff05]">
                <ListOrdered className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2 py-0.5 rounded-full border border-[#5a7800]">
                {isAr ? "موقف / محول" : "Paused / Transfer"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white">{pausedOrTransferredCount}</div>
              <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "تعديلات القيد" : "Paused / Transferred"}</div>
            </div>
          </div>

          {/* Card 5: Withdrawn / Completed */}
          <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#9aa1a6]">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#9aa1a6] bg-[#14171a] px-2 py-0.5 rounded-full border border-[#2a3033]">
                {isAr ? "منتهي / منسحب" : "Archived"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-white">{withdrawnOrCompletedCount}</div>
              <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "المنسحبون والمكتملون" : "Withdrawn / Completed"}</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#101315] border border-[#222629] p-3 rounded-2xl">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "البحث بالاسم، المعرّف، الفاتورة..." : "Search by athlete, offering, or invoice..."}
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
                <option value="PendingFinance">{isAr ? "بانتظار المالية (Pending Finance)" : "Pending Finance"}</option>
                <option value="Paused">{isAr ? "موقف مؤقتاً (Paused)" : "Paused"}</option>
                <option value="Transferred">{isAr ? "محول (Transferred)" : "Transferred"}</option>
                <option value="Withdrawn">{isAr ? "منسحب (Withdrawn)" : "Withdrawn"}</option>
                <option value="Completed">{isAr ? "مكتمل (Completed)" : "Completed"}</option>
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
                <option value="all">{isAr ? "حالة السداد: الكل" : "Payment: All"}</option>
                <option value="Paid">Paid (مدفوع)</option>
                <option value="Invoiced">Invoiced (تمت الفوترة)</option>
                <option value="Unbilled">Unbilled (غير مفوتر)</option>
                <option value="Waived">Waived (معفى)</option>
                <option value="Overdue">Overdue (متأخر)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3" />
            </div>
          </div>

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

        {/* 2-Column Operational Workspace matching 04_Enrollments.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Table Panel (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-[#222629] bg-[#101315] p-5 flex flex-col justify-between min-h-[580px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#c8ff05]" />
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? `سجلات التسجيل (${filteredRows.length})` : `Enrollment Records (${filteredRows.length})`}
                  </h3>
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 py-2 text-[10px] uppercase font-bold text-[#9aa1a6] tracking-wider border-b border-[#222629]">
                <div className="col-span-5">{isAr ? "الرياضي" : "Athlete"}</div>
                <div className="col-span-3">{isAr ? "البرنامج والعرض" : "Program Offering"}</div>
                <div className="col-span-2">{isAr ? "حالة التسجيل" : "Status"}</div>
                <div className="col-span-2 text-right rtl:text-left">{isAr ? "الرسوم / الفاتورة" : "Fee / Billing"}</div>
              </div>

              {/* Rows */}
              {vm.loading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner />
                  <p className="text-xs text-[#9aa1a6] mt-2">{isAr ? "جاري تحميل سجلات التسجيل..." : "Loading enrollments..."}</p>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a3033] bg-[#14171a] text-[#9aa1a6]">
                    <Layers className="h-6 w-6 text-[#c8ff05]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{isAr ? "لا توجد تسجيلات مطابقة" : "No Enrollments Found"}</h4>
                    <p className="text-xs text-[#9aa1a6] mt-1 max-w-xs mx-auto">
                      {isAr
                        ? "لم يتم العثور على أي تسجيلات نشطة أو بانتظار المراجعة تطابق البحث."
                        : "No enrollment records currently match your search and filter parameters."}
                    </p>
                  </div>
                  {canCreate && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
                    >
                      {isAr ? "+ تسجيل رياضي جديد" : "+ Create Enrollment"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#222629]/50">
                  {filteredRows.map((row) => {
                    const isSelected = selectedItem?.id === row.id;
                    const initials = getAthleteInitials(row.athleteNameEn, undefined, row.athleteNameAr);
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
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          {/* Deterministic Initials Badge */}
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border bg-gradient-to-br ${colorClass}`}>
                            {initials}
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="text-xs font-bold text-white truncate">
                              {isAr ? (row.athleteNameAr || row.athleteNameEn || "رياضي") : (row.athleteNameEn || row.athleteNameAr || "Athlete")}
                            </div>
                            <div className="text-[10px] text-[#9aa1a6]">
                              ID: {row.id.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 text-xs text-white truncate">
                          <div>{isAr ? (row.offeringNameAr || row.offeringNameEn || "—") : (row.offeringNameEn || row.offeringNameAr || "—")}</div>
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

            <div className="flex items-center justify-between pt-3 border-t border-[#222629] text-xs text-[#9aa1a6] mt-2">
              <span>
                {isAr
                  ? `عرض ${filteredRows.length} من إجمالي ${vm.enrollments.length} تسجيل`
                  : `Showing ${filteredRows.length} of ${vm.enrollments.length} enrollments`}
              </span>
            </div>
          </div>

          {/* Right Detail Panel (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-[#222629] bg-[#101315] p-5 space-y-4">
            {!selectedItem ? (
              <div className="py-16 text-center text-[#9aa1a6] space-y-3">
                <Layers className="h-10 w-10 text-[#5a7800] mx-auto" />
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
              <>
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#222629]">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
                    {getAthleteInitials(selectedItem.athleteNameEn, undefined, selectedItem.athleteNameAr)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">
                      {isAr ? (selectedItem.athleteNameAr || selectedItem.athleteNameEn) : (selectedItem.athleteNameEn || selectedItem.athleteNameAr || "Athlete")}
                    </h3>
                    <p className="text-xs text-[#9aa1a6] truncate">
                      {isAr ? (selectedItem.offeringNameAr || selectedItem.offeringNameEn) : (selectedItem.offeringNameEn || selectedItem.offeringNameAr)}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#14171a] border border-[#222629]">
                  <span className="text-xs text-[#9aa1a6]">{isAr ? "حالة القيد والفوترة" : "Status & Billing"}</span>
                  <div className="flex items-center gap-1.5">
                    {getEnrollmentStatusBadge(selectedItem.status, isAr)}
                    {getBillingBadge(selectedItem.billingStatus, isAr)}
                  </div>
                </div>

                {/* Financial Snapshot */}
                <div className="rounded-xl border border-[#2a3033] bg-[#14171a] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9aa1a6]">{isAr ? "قيمة الرسوم المقررة" : "Enrollment Price"}</span>
                    <span className="text-lg font-black text-[#c8ff05]">
                      {selectedItem.priceAmount} {selectedItem.priceCurrency || "SAR"}
                    </span>
                  </div>

                  <div className="border-t border-[#222629] pt-2 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa1a6]">{isAr ? "رقم الفاتورة المالية" : "Invoice Reference"}</span>
                      <span className="font-mono text-white text-[11px]">
                        {selectedItem.financeInvoiceReference || (isAr ? "غير مفوتر" : "Pending Handoff")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa1a6]">{isAr ? "تاريخ التسجيل" : "Enrollment Date"}</span>
                      <span className="text-white">{selectedItem.enrollmentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedItem.notes && (
                  <div className="rounded-xl border border-[#222629] bg-[#14171a] p-3 text-xs space-y-1">
                    <span className="text-[#9aa1a6] font-semibold">{isAr ? "ملاحظات القيد" : "Enrollment Notes"}</span>
                    <p className="text-white text-xs">{selectedItem.notes}</p>
                  </div>
                )}

                {/* Finance Boundary Notice & Actions */}
                <div className="space-y-2 pt-2 border-t border-[#222629]">
                  {/* Action 1: Handoff to Finance */}
                  {selectedItem.billingStatus === "Unbilled" && canUpdate && (
                    <Button
                      onClick={() => {
                        setTargetEnrollment(selectedItem);
                        setShowFinanceModal(true);
                      }}
                      className="w-full h-9 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isAr ? "إحالة للفواتير والمالية" : "Handoff to Finance"}</span>
                    </Button>
                  )}

                  {/* Action 2: Activate Enrollment */}
                  {(selectedItem.status === "Review" || selectedItem.status === "Draft") && canUpdate && (
                    <Button
                      onClick={() => vm.activateEnrollment(selectedItem.id)}
                      disabled={vm.loading}
                      className="w-full h-9 text-xs bg-[#122815] hover:bg-[#1b3d20] border border-[#22c55e]/40 text-[#4ade80] font-bold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isAr ? "تنشيط التسجيل رسمياً" : "Activate Enrollment"}</span>
                    </Button>
                  )}

                  <div className="p-3 rounded-lg bg-[#14171a] border border-[#222629] text-[11px] text-[#9aa1a6] space-y-1">
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#c8ff05]" />
                      <span>{isAr ? "حوكمة التحصيل المالي" : "Finance Governance"}</span>
                    </div>
                    <p>
                      {isAr
                        ? "يتم تسوية وتأكيد التحصيل المالي حصرياً عبر وحدة المالية والمستحقات."
                        : "Invoice settlement and payment collection are strictly managed in the Finance module."}
                    </p>
                    <Link href="/academy/fees-receivables" className="text-[#c8ff05] hover:underline flex items-center gap-1 mt-1 font-semibold">
                      <span>{isAr ? "عرض المستحقات والفواتير" : "View Receivables Ledger"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CREATE ENROLLMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "تسجيل رياضي في برنامج تدريبي" : "Create Program Enrollment"}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الرياضي" : "Athlete"}</label>
                <GenericSelect
                  value={athleteId}
                  options={athleteOptions}
                  onChange={(val: string) => setAthleteId(val)}
                  placeholder={isAr ? "اختر الرياضي..." : "Select athlete..."}
                  disabled={loadingSelectors}
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "العرض التدريبي" : "Program Offering"}</label>
                <GenericSelect
                  value={offeringId}
                  options={offeringOptions}
                  onChange={(val: string) => setOfferingId(val)}
                  placeholder={isAr ? "اختر البرنامج / العرض..." : "Select offering..."}
                  disabled={loadingSelectors}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "رسوم الاشتراك" : "Price Amount"}</label>
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "العملة" : "Currency"}</label>
                  <input
                    type="text"
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات إدارية" : "Administrative Notes"}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isAr ? "أي شروط أو استثناءات خاصة بالتسجيل..." : "Terms or exemptions..."}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={!athleteId || !offeringId || priceAmount <= 0 || vm.loading}
                className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {vm.loading ? (isAr ? "جاري التسجيل..." : "Creating...") : (isAr ? "تأكيد التسجيل" : "Confirm Enrollment")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE HANDOFF MODAL */}
      {showFinanceModal && targetEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "إحالة التسجيل للفوترة المالية" : "Handoff Enrollment to Finance"}
              </h3>
              <button onClick={() => setShowFinanceModal(false)} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#14171a] border border-[#222629] space-y-1">
                <div className="text-white font-bold">
                  {isAr ? targetEnrollment.athleteNameAr || targetEnrollment.athleteNameEn : targetEnrollment.athleteNameEn}
                </div>
                <div className="text-[#9aa1a6]">
                  {isAr ? targetEnrollment.offeringNameAr || targetEnrollment.offeringNameEn : targetEnrollment.offeringNameEn} • {targetEnrollment.priceAmount} {targetEnrollment.priceCurrency}
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "ملاحظات الفاتورة لمسؤول المالية" : "Invoice Instructions for Finance"}</label>
                <textarea
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  rows={3}
                  placeholder={isAr ? "تعليمات الخصم، الدفعات، أو تاريخ الاستحقاق..." : "Installment or waiver notes..."}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
              <Button
                variant="outline"
                onClick={() => setShowFinanceModal(false)}
                className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleFinanceSubmit}
                disabled={vm.loading}
                className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {vm.loading ? (isAr ? "جاري الإحالة..." : "Issuing...") : (isAr ? "إصدار الفاتورة" : "Issue Invoice")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''

target_path = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\enrollments\src\presentation\views\AcademyEnrollmentsView.tsx"
with open(target_path, "w", encoding="utf-8") as f:
    f.write(enrollments_view_code)

print("AcademyEnrollmentsView.tsx updated successfully without fabricated fixtures.")
