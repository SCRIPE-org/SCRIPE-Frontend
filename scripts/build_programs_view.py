import os

programs_view_code = '''"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyProgramsViewModel } from "../viewmodels/useAcademyProgramsViewModel";
import type { ProgramLevel, GenderCriteria, ProgramStatus } from "../../domain/entities/AcademyProgram";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Button } from "@core/ui/button";
import {
  Layers,
  Plus,
  Upload,
  BarChart2,
  Search,
  ChevronDown,
  ArrowRight,
  Users,
  User,
  Calendar,
  MoreVertical,
  Activity,
  Dumbbell,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  Check,
  Award,
  ExternalLink
} from "lucide-react";

function getProgramImage(sportCode?: string): string {
  const code = (sportCode || "").toUpperCase();
  if (code.includes("SWIM")) return "/images/academy/program_swimming.png";
  if (code.includes("PADEL")) return "/images/academy/program_padel.png";
  if (code.includes("BASKET")) return "/images/academy/program_basketball.png";
  if (code.includes("GYM")) return "/images/academy/program_gymnastics.png";
  return "/images/academy/program_football.png";
}

export function AcademyProgramsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_CREATE);
  const canPublish = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_UPDATE);

  const locator = useAcademyServiceLocator();
  const {
    state,
    setFilterSport,
    openCreateDialog,
    closeCreateDialog,
    createProgram,
    publishProgram,
    reload,
  } = useAcademyProgramsViewModel(locator.programsRepository);

  // Filter state
  const [selectedSportTab, setSelectedSportTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [sportId, setSportId] = useState("");
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [minAge, setMinAge] = useState(6);
  const [maxAge, setMaxAge] = useState(16);
  const [level, setLevel] = useState<ProgramLevel>("Beginner");
  const [genderCriteria, setGenderCriteria] = useState<GenderCriteria>("Mixed");

  const isFormValid = Boolean(sportId && code.trim() && nameEn.trim() && nameAr.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportId || !code || !nameEn || !nameAr) return;

    const ok = await createProgram({
      sportId,
      code,
      nameEn,
      nameAr,
      descriptionEn: descriptionEn || null,
      descriptionAr: descriptionAr || null,
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      level,
      genderCriteria,
    });

    if (ok) {
      setCode("");
      setNameEn("");
      setNameAr("");
      setDescriptionEn("");
      setDescriptionAr("");
    }
  };

  // Real KPIs derived directly from ViewModel state
  const totalProgramsCount = state.programs.length;
  const publishedCount = useMemo(() => state.programs.filter(p => p.status === "Published").length, [state.programs]);
  const draftCount = useMemo(() => state.programs.filter(p => p.status === "Draft").length, [state.programs]);
  const activeSportsCount = useMemo(() => state.sports.filter(s => s.isActive).length, [state.sports]);

  // Dynamic Sport Tabs derived from backend sports
  const sportTabs = useMemo(() => {
    return [
      { id: "all", label: isAr ? "جميع الرياضات" : "All Sports" },
      ...state.sports.map(s => ({
        id: s.id,
        label: isAr && s.nameAr ? s.nameAr : s.nameEn
      }))
    ];
  }, [state.sports, isAr]);

  // Filter programs based on sport tab, search query, and status
  const filteredPrograms = useMemo(() => {
    return state.programs.filter(p => {
      // Tab filter
      if (selectedSportTab !== "all" && p.sportId !== selectedSportTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitleEn = p.nameEn.toLowerCase().includes(q);
        const matchesTitleAr = p.nameAr.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesDesc = (p.descriptionEn?.toLowerCase() || "").includes(q) || (p.descriptionAr?.toLowerCase() || "").includes(q);
        if (!matchesTitleEn && !matchesTitleAr && !matchesCode && !matchesDesc) return false;
      }
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [state.programs, selectedSportTab, searchQuery, statusFilter]);

  if (!canView) {
    return (
      <div className="p-8 max-w-xl mx-auto" dir={dir}>
        <div className="rounded-xl border border-red-500/30 bg-[#160d0e] p-6 text-red-300 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-bold text-white">{isAr ? "غير مصرح" : "Access Restricted"}</h2>
          </div>
          <p className="text-xs text-red-300/80">
            {isAr ? "ليس لديك صلاحية لعرض برامج وعروض الأكاديمية." : "You do not have permission to view Academy Programs."}
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
        {/* Header with Title, Breadcrumbs & Actions */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2a3033] bg-gradient-to-r from-[#101315] via-[#121619] to-[#0c0f11] p-6 shadow-2xl">
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
                  <span>{isAr ? "تقديم التدريب" : "Training Delivery"}</span>
                  <span>›</span>
                  <span className="text-white font-medium">{isAr ? "البرامج والعروض" : "Programs & Offerings"}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {isAr ? "البرامج والعروض" : "Programs & Offerings"}
                </h1>
                <p className="text-xs md:text-sm text-[#9aa1a6] mt-0.5">
                  {isAr
                    ? "تحديد البرامج الرياضية، تكوين العروض التدريبية، وإدارة السعة الاستيعابية والجداول الزمنية."
                    : "Define sports programs, configure offerings, and manage enrollment capacity and schedules."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                disabled
                title={isAr ? "استيراد ملفات CSV متاح في إصدار المؤسسات" : "Batch CSV Import available in Academy Enterprise"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#222629] bg-[#101214] opacity-50 cursor-not-allowed text-xs font-semibold text-[#9aa1a6]"
              >
                <Upload className="h-4 w-4" />
                <span>{isAr ? "استيراد" : "Import"}</span>
              </button>

              <Link
                href="/academy/reports"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#343b40] bg-[#121619] hover:bg-[#1a1f23] text-xs font-bold text-white transition-colors"
              >
                <BarChart2 className="h-4 w-4 text-[#c8ff05]" />
                <span>{isAr ? "التحليلات" : "Analytics"}</span>
              </Link>

              {canCreate && (
                <button
                  onClick={openCreateDialog}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8ff05] hover:bg-[#d4ff33] text-[#131600] font-extrabold text-sm shadow-[0_0_24px_rgba(200,255,5,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAr ? "+ إنشاء برنامج" : "+ Create Program"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Real KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Programs */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{totalProgramsCount}</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "إجمالي البرامج" : "Total Programs"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              {isAr ? "مسجل" : "Registered"}
            </span>
          </div>

          {/* Card 2: Published Programs */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{publishedCount}</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "البرامج المنشورة" : "Published Programs"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#4ade80] bg-[#122815] px-2.5 py-1 rounded-full border border-[#22c55e]/30">
              {isAr ? "نشط" : "Live"}
            </span>
          </div>

          {/* Card 3: Draft Programs */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ffd24d]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{draftCount}</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "قيد الإعداد (مسودة)" : "Draft Programs"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#ffd24d] bg-[#372b09] px-2.5 py-1 rounded-full border border-[#715a12]">
              {isAr ? "مسودة" : "Draft"}
            </span>
          </div>

          {/* Card 4: Sports Disciplines */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{activeSportsCount}</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "الرياضات المعتمدة" : "Active Sports"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              {isAr ? "معتمد" : "Accredited"}
            </span>
          </div>
        </div>

        {/* Dynamic Sport Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {sportTabs.map((tab) => {
            const isActive = selectedSportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSportTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#c8ff05] text-[#131600] shadow-[0_0_16px_rgba(200,255,5,0.25)]"
                    : "bg-[#101315] border border-[#222629] text-[#9aa1a6] hover:text-white hover:border-[#353d42]"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#101315] border border-[#222629] p-3 rounded-2xl">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "البحث بالاسم، الرمز، أو الوصف..." : "Search programs by title, code, or description..."}
                className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-[#14171a] border border-[#222629] text-white placeholder-[#9aa1a6] focus:outline-none focus:border-[#c8ff05] transition-colors rtl:pl-3.5 rtl:pr-9"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3.5 pr-8 rounded-full bg-[#14171a] border border-[#222629] text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c8ff05] rtl:pr-3.5 rtl:pl-8"
              >
                <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                <option value="Published">{isAr ? "منشور (Published)" : "Published"}</option>
                <option value="Draft">{isAr ? "مسودة (Draft)" : "Draft"}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => reload()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#222629] bg-[#14171a] text-[#9aa1a6] hover:text-white transition-colors cursor-pointer"
              title={isAr ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${state.stage === "loading" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Programs Grid */}
        {state.stage === "loading" ? (
          <div className="py-20 text-center">
            <LoadingSpinner />
            <p className="text-xs text-[#9aa1a6] mt-2">{isAr ? "جاري تحميل البرامج والعروض..." : "Loading programs and curriculum tracks..."}</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-[#222629] bg-[#101315] p-8 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2a3033] bg-[#14171a] text-[#c8ff05]">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">{isAr ? "لا توجد برامج مسجلة" : "No Programs Found"}</h3>
            <p className="text-xs text-[#9aa1a6] max-w-sm mx-auto">
              {isAr
                ? "لم يتم العثور على برامج تطابق معايير التصفية المحددة. يمكنك إضافة برنامج رياضي جديد الآن."
                : "No sports curriculum tracks match the active filter criteria. Define a new program to configure offerings."}
            </p>
            {canCreate && (
              <Button
                onClick={openCreateDialog}
                className="h-9 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
              >
                {isAr ? "+ إنشاء برنامج جديد" : "+ Create Program"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((program) => {
              const sport = state.sports.find(s => s.id === program.sportId);
              const sportName = isAr && sport?.nameAr ? sport.nameAr : (sport?.nameEn || "Multi-Sport");
              const bgImage = getProgramImage(sport?.code || program.code);

              return (
                <div
                  key={program.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#222629] bg-[#101315] hover:border-[#c8ff05]/50 transition-all duration-300 shadow-xl"
                >
                  {/* Card Image Header with atmospheric sports photography */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#14171a]">
                    <Image
                      src={bgImage}
                      alt={program.nameEn}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101315] via-[#101315]/40 to-transparent" />

                    {/* Status & Code Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
                        {sportName}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                          program.status === "Published"
                            ? "bg-[#122815]/90 text-[#4ade80] border-[#22c55e]/40"
                            : "bg-[#2a1d08]/90 text-[#fbbf24] border-[#f59e0b]/40"
                        }`}
                      >
                        {program.status === "Published" ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft")}
                      </span>
                    </div>

                    {/* Code Chip */}
                    <div className="absolute bottom-3 left-4 rtl:left-auto rtl:right-4">
                      <span className="font-mono text-[11px] font-bold text-[#c8ff05] bg-black/60 px-2 py-0.5 rounded border border-[#c8ff05]/30">
                        {program.code}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-[#c8ff05] transition-colors leading-snug">
                        {isAr ? program.nameAr : program.nameEn}
                      </h3>
                      <p className="text-xs text-[#9aa1a6] mt-1.5 line-clamp-2 leading-relaxed">
                        {isAr
                          ? (program.descriptionAr || program.descriptionEn || "مسار تدريبي معتمد.")
                          : (program.descriptionEn || program.descriptionAr || "Accredited developmental curriculum track.")}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#222629] text-[11px]">
                      <div className="p-2 rounded-lg bg-[#14171a] border border-[#222629]/70 text-center">
                        <span className="text-[#9aa1a6] block text-[10px]">{isAr ? "العمر" : "Age"}</span>
                        <span className="font-bold text-white mt-0.5 block">{program.minAge}–{program.maxAge} {isAr ? "سنة" : "yrs"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#14171a] border border-[#222629]/70 text-center">
                        <span className="text-[#9aa1a6] block text-[10px]">{isAr ? "المستوى" : "Level"}</span>
                        <span className="font-bold text-white mt-0.5 block truncate">{program.level}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#14171a] border border-[#222629]/70 text-center">
                        <span className="text-[#9aa1a6] block text-[10px]">{isAr ? "الفئة" : "Gender"}</span>
                        <span className="font-bold text-white mt-0.5 block truncate">{program.genderCriteria}</span>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-mono text-[#9aa1a6]">
                        v{program.version || 1}
                      </span>

                      {program.status === "Draft" && canPublish ? (
                        <Button
                          onClick={() => publishProgram(program.id)}
                          className="h-8 px-3 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold flex items-center gap-1.5"
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>{isAr ? "نشر البرنامج" : "Publish Program"}</span>
                        </Button>
                      ) : (
                        <Link
                          href="/academy/programs"
                          className="h-8 px-3 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1f2428] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <span>{isAr ? "عرض العروض" : "View Offerings"}</span>
                          <ArrowRight className="h-3 w-3 rtl:rotate-180 text-[#c8ff05]" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE PROGRAM DIALOG */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#101214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222629]">
              <h3 className="text-base font-bold text-white">
                {isAr ? "إنشاء برنامج رياضي جديد" : "Define New Sports Program"}
              </h3>
              <button onClick={closeCreateDialog} className="text-[#9aa1a6] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الرياضة" : "Sport"}</label>
                  <select
                    value={sportId}
                    onChange={(e) => setSportId(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  >
                    <option value="">{isAr ? "اختر الرياضة..." : "Select sport..."}</option>
                    {state.sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {isAr && s.nameAr ? s.nameAr : s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "رمز البرنامج" : "Program Code"}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QA-FB-01"
                    required
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الاسم (بالإنجليزية)" : "Name (English)"}</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الاسم (بالعربية)" : "Name (Arabic)"}</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    required
                    dir="rtl"
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "المستوى" : "Level"}</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ProgramLevel)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الجنس" : "Gender Criteria"}</label>
                  <select
                    value={genderCriteria}
                    onChange={(e) => setGenderCriteria(e.target.value as GenderCriteria)}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  >
                    <option value="Mixed">Mixed (مختلط)</option>
                    <option value="BoysOnly">Boys Only (بنين)</option>
                    <option value="GirlsOnly">Girls Only (بنات)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الحد الأدنى للعمر" : "Min Age"}</label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الحد الأقصى للعمر" : "Max Age"}</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الوصف (بالإنجليزية)" : "Description (English)"}</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#9aa1a6] mb-1 font-semibold">{isAr ? "الوصف (بالعربية)" : "Description (Arabic)"}</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={2}
                  dir="rtl"
                  className="w-full p-2.5 rounded-lg bg-[#14171a] border border-[#2a3033] text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222629]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateDialog}
                  className="h-8 px-3 text-xs border-[#2a3033] text-[#9aa1a6] hover:text-white"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || state.submitting}
                  className="h-8 px-4 text-xs bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold"
                >
                  {state.submitting ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء البرنامج" : "Create Program")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'''

target_path = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\programs\src\presentation\views\AcademyProgramsView.tsx"
with open(target_path, "w", encoding="utf-8") as f:
    f.write(programs_view_code)

print("AcademyProgramsView.tsx updated successfully without fabricated fixtures.")
