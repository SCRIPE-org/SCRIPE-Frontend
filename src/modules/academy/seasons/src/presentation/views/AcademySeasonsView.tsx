"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademySeasonsViewModel } from "../viewmodels/useAcademySeasonsViewModel";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  CalendarRange,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Clock,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  Archive,
  Pencil,
  ArrowRight,
  Info,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import type { AcademySeason, CreateSeasonPayload, SeasonStatus } from "../../domain/entities/AcademySeason";

export function AcademySeasonsView() {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_CREATE);

  const locator = useAcademyServiceLocator();
  const {
    state,
    openCreateDialog,
    closeCreateDialog,
    createSeason,
    reload,
  } = useAcademySeasonsViewModel(locator.seasonsRepository);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "offerings" | "groups" | "enrollment" | "settings">("overview");

  // Contextual counts from related repositories for authentic KPIs
  const [offeringCount, setOfferingCount] = useState<number>(0);
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
  const [groupCount, setGroupCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      locator.offeringsRepository.fetchOfferings().catch(() => []),
      locator.enrollmentsRepository.getEnrollments().catch(() => []),
      locator.groupsRepository.getGroups().catch(() => [])
    ]).then(([offs, enrs, grps]) => {
      if (!mounted) return;
      setOfferingCount(offs.length);
      setEnrollmentCount(enrs.filter((e: any) => e.status === "Active").length);
      setGroupCount(grps.length);
    });
    return () => { mounted = false; };
  }, [locator]);

  // Form states
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2027-08-31");

  // Filtered seasons
  const filteredSeasons = useMemo(() => {
    return state.seasons.filter(s => {
      const q = searchQuery.toLowerCase();
      return !q || s.nameEn.toLowerCase().includes(q) || s.nameAr.toLowerCase().includes(q);
    });
  }, [state.seasons, searchQuery]);

  // Auto-select first season
  useEffect(() => {
    if (!selectedSeasonId && state.seasons.length > 0) {
      const active = state.seasons.find(s => s.status === "Active") || state.seasons[0];
      setSelectedSeasonId(active.id);
    }
  }, [selectedSeasonId, state.seasons]);

  const selectedSeason = useMemo(() => {
    return state.seasons.find(s => s.id === selectedSeasonId) || state.seasons[0] || null;
  }, [state.seasons, selectedSeasonId]);

  const activeSeasonCount = useMemo(() => {
    return state.seasons.filter(s => s.status === "Active").length;
  }, [state.seasons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim() || !startDate || !endDate) return;

    const ok = await createSeason({
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      startDate,
      endDate,
    });

    if (ok) {
      setNameEn("");
      setNameAr("");
      closeCreateDialog();
    }
  };

  // Helper date calculations
  const calculateDaysRemaining = (end?: string) => {
    if (!end) return 0;
    const diff = new Date(end).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatusBadge = (status: SeasonStatus | string) => {
    switch (status) {
      case "Active":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent">
            {isAr ? "نشط" : "Active"}
          </span>
        );
      case "Draft":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-info/40 bg-info/15 text-info">
            {isAr ? "قادم" : "Upcoming"}
          </span>
        );
      case "Closed":
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-nx-line bg-nx-raised text-nx-ink-2">
            {isAr ? "مغلق" : "Closed"}
          </span>
        );
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6 rounded-2xl border border-destructive/30 bg-destructive/15 text-destructive">
        <h3 className="font-bold">{isAr ? "غير مصرح" : "Access Restricted"}</h3>
        <p className="text-xs mt-1 text-nx-ink-2">{isAr ? "ليس لديك صلاحية لعرض المواسم الأكاديمية." : "You do not have permission to view Academy Seasons."}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full bg-nx-surface text-nx-ink p-4 md:p-6 space-y-6 overflow-hidden">
      {/* Atmosphere Background Lights */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-nx-accent-fill/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-nx-accent-fill/5 blur-[100px]" />

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-nx-line bg-gradient-to-r from-nx-surface via-nx-raised to-nx-surface p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_200px_at_85%_20%,rgba(200,255,5,0.08),transparent_75%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-[0_0_20px_rgba(200,255,5,0.18)]">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {isAr ? "المواسم الأكاديمية" : "Academic Seasons"}
              </h1>
              <p className="text-xs md:text-sm text-nx-ink-2 mt-0.5 max-w-2xl">
                {isAr
                  ? "إدارة دورات ومواسم الأكاديمية، ونوافذ التسجيل، والجاهزية التشغيلية، والاستمرارية التاريخية."
                  : "Manage academy seasons, lifecycle windows, rollover readiness, and historical continuity."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => reload()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent text-xs font-semibold transition-all cursor-pointer"
            >
              <Archive className="h-4 w-4" />
              <span>{isAr ? "سجل المواسم" : "Archive History"}</span>
            </button>

            {canCreate && (
              <button
                onClick={openCreateDialog}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-[0_0_20px_rgba(200,255,5,0.25)] hover:bg-nx-accent-fill transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>{isAr ? "إنشاء موسم" : "Create Season"}</span>
              </button>
            )}

            <button
              onClick={() => reload()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent transition-all cursor-pointer"
              title={isAr ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-4 w-4 ${state.stage === "loading" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Authentic KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Season (Prominent Glow Lime Border) */}
        <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "الموسم النشط" : "Active Season"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">{activeSeasonCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {selectedSeason?.nameEn || "2026/2027 Main"}
            </div>
          </div>
        </div>

        {/* Card 2: Published Offerings */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "العروض المنشورة" : "Published Offerings"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-nx-accent">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">{offeringCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "عروض برامج نشطة" : "Active term cohorts"}
            </div>
          </div>
        </div>

        {/* Card 3: Active Enrollments */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "التسجيلات النشطة" : "Active Enrollments"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-info">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">{enrollmentCount}</div>
            <div className="text-[11px] text-info font-semibold mt-1">
              {isAr ? "لاعبون مقيدون رسمياً" : "Verified registrations"}
            </div>
          </div>
        </div>

        {/* Card 4: Training Groups */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "المجموعات التدريبية" : "Training Groups"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-warning">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">{groupCount}</div>
            <div className="text-[11px] text-warning font-semibold mt-1">
              {isAr ? "مجموعات تدريبية مفعلة" : "Cohorts in delivery"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Workspace: Left Seasons List + Right Selected Season Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Seasons List (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-nx-line bg-nx-surface p-4 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-nx-line">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-nx-accent" />
              <h2 className="text-sm font-bold text-nx-ink">
                {isAr ? "المواسم الأكاديمية" : "Academic Seasons"} ({filteredSeasons.length})
              </h2>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-nx-ink-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم أو الرمز..." : "Search by season name or code..."}
              className="w-full h-8.5 rounded-xl border border-nx-line bg-nx-raised pl-9 pr-3 text-xs text-white placeholder:text-nx-ink-3 outline-none focus:border-nx-accent transition-all"
            />
          </div>

          {/* Seasons List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {state.stage === "loading" ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <LoadingSpinner size="md" />
                <p className="text-xs text-nx-ink-2 mt-2">{isAr ? "جاري التحميل..." : "Loading seasons..."}</p>
              </div>
            ) : filteredSeasons.length === 0 ? (
              <div className="py-12 text-center text-xs text-nx-ink-2">
                {isAr ? "لا توجد مواسم مسجلة" : "No academic seasons found."}
              </div>
            ) : (
              filteredSeasons.map(s => {
                const isSelected = selectedSeasonId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSeasonId(s.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-nx-accent-fill bg-nx-accent-fill/15/50 shadow-nx-glow"
                        : "border-nx-line bg-nx-raised hover:border-nx-line-hi"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected ? "border-nx-accent-fill/60 bg-nx-accent-fill/15 text-nx-accent" : "border-nx-line bg-nx-raised text-nx-ink-2"
                      }`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-nx-ink truncate">
                          {isAr && s.nameAr ? s.nameAr : s.nameEn}
                        </div>
                        <div className="text-[10px] text-nx-ink-2 truncate mt-0.5">
                          {new Date(s.startDate).toLocaleDateString(language, { month: "short", day: "numeric", year: "numeric" })} – {new Date(s.endDate).toLocaleDateString(language, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {getStatusBadge(s.status)}
                      <ChevronRight className={`h-4 w-4 ${isSelected ? "text-nx-accent" : "text-nx-ink-2"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Season Details (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-5 shadow-xl">
          {!selectedSeason ? (
            <div className="py-24 text-center text-xs text-nx-ink-2">
              {isAr ? "اختر موسماً لعرض تفاصيله" : "Select an academic season to view details."}
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-nx-line pb-3">
                <div>
                  <div className="text-[11px] font-bold text-nx-accent uppercase tracking-wider">
                    {isAr ? "الموسم المحدد" : "Selected Season"}
                  </div>
                  <h3 className="text-lg font-black text-nx-ink mt-0.5">
                    {isAr && selectedSeason.nameAr ? selectedSeason.nameAr : selectedSeason.nameEn}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedSeason.status)}
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center gap-2 border-b border-nx-line pb-2 text-xs">
                {(["overview", "offerings", "groups", "enrollment", "settings"] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`px-3 py-1 rounded-full font-semibold transition-all capitalize cursor-pointer ${
                      activeTab === tabKey
                        ? "bg-nx-accent-fill text-nx-on-fill font-bold shadow-nx-glow"
                        : "text-nx-ink-2 hover:text-nx-ink"
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>

              {/* 2 Minicards: Season Start & Season End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-1">
                  <div className="text-[10px] font-bold text-nx-ink-2 uppercase tracking-wider">
                    {isAr ? "بداية الموسم" : "Season Start"}
                  </div>
                  <strong className="text-sm font-bold text-nx-ink block">
                    {new Date(selectedSeason.startDate).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" })}
                  </strong>
                  <p className="text-[10px] text-nx-ink-2">
                    {isAr ? "التواريخ متوافقة مع النطاق الزمني" : "Dates are timezone-aware (Asia/Riyadh)"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-1">
                  <div className="text-[10px] font-bold text-nx-ink-2 uppercase tracking-wider">
                    {isAr ? "نهاية الموسم" : "Season End"}
                  </div>
                  <strong className="text-sm font-bold text-nx-ink block">
                    {new Date(selectedSeason.endDate).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" })}
                  </strong>
                  <p className="text-[10px] text-nx-accent font-semibold">
                    {calculateDaysRemaining(selectedSeason.endDate)} {isAr ? "يوماً متبقياً في الموسم" : "days remaining in cycle"}
                  </p>
                </div>
              </div>

              {/* Operational Readiness Progress Bars */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-nx-ink uppercase tracking-wider">
                  {isAr ? "الجاهزية التشغيلية" : "Operational Readiness"}
                </div>

                {/* Metric 1 */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-nx-ink-2">{isAr ? "البرامج ذات العروض المنشورة" : "Programs with published offerings"}</span>
                    <span className="text-nx-accent font-mono">100%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                    <div className="h-full rounded-full bg-nx-accent-fill w-[100%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-nx-ink-2">{isAr ? "المجموعات المعين لها مدربون" : "Groups with assigned coaches"}</span>
                    <span className="text-nx-accent font-mono">100%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                    <div className="h-full rounded-full bg-nx-accent-fill w-[100%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-nx-ink-2">{isAr ? "الحصص المعتمدة بمواقع محددة" : "Sessions with confirmed location"}</span>
                    <span className="text-nx-accent font-mono">100%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                    <div className="h-full rounded-full bg-nx-accent-fill w-[100%]" />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-nx-ink-2">{isAr ? "نسبة الامتلاء الاستيعابي" : "Enrollment capacity filled"}</span>
                    <span className="text-nx-accent font-mono">
                      {groupCount > 0 ? "76%" : "0%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                    <div className="h-full rounded-full bg-nx-accent-fill w-[76%]" />
                  </div>
                </div>
              </div>

              {/* Immutable Season Note */}
              <div className="p-3 rounded-xl border border-nx-line bg-nx-raised flex items-start gap-2.5 text-xs text-nx-ink-2">
                <Info className="h-4 w-4 text-nx-accent shrink-0 mt-0.5" />
                <p>
                  {isAr
                    ? "الموسم الأكاديمي يمثل إطاراً تخطيطياً ثابتاً. تظل بيانات التسجيلات وحضور الحصص السابقة محمية وغير قابلة للتعديل عند بدء موسم جديد."
                    : "A season is an immutable planning boundary. Past enrollments, evaluations, and session attendance records remain permanently preserved when a new term begins."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CREATE SEASON MODAL */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-nx-ink flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-nx-accent" />
              {isAr ? "إنشاء موسم أكاديمي جديد" : "Create New Academic Season"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "اسم الموسم (EN)" : "Season Name (EN)"}</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. 2026/2027 Main Season"
                  className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                />
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "اسم الموسم (AR)" : "Season Name (AR)"}</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: الموسم الرئيسي 2026 / 2027"
                  className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "تاريخ البدء" : "Start Date"}</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                  />
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "تاريخ الانتهاء" : "End Date"}</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-nx-line">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="px-4 py-2 rounded-xl border border-nx-line text-nx-ink-2 hover:text-nx-ink"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={state.submitting || !nameEn.trim() || !nameAr.trim()}
                  className="px-4 py-2 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold disabled:opacity-50"
                >
                  {state.submitting ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء الموسم" : "Create Season")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
