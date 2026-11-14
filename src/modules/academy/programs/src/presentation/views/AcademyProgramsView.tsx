"use client";

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
  ExternalLink,
  ArrowLeft,
  Download
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
        <div className="rounded-xl border border-red-500/30 bg-destructive/15 p-6 text-red-300 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            <h2 className="text-lg font-bold text-nx-ink">{isAr ? "غير مصرح" : "Access Restricted"}</h2>
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
      className="min-h-screen text-nx-ink p-5 sm:p-7 space-y-4 academy-bg"
      dir={dir}
    >
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-nx-ink-2">
        <Link href="/academy" className="hover:text-nx-ink transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
          <span>{isAr ? "لوحة الأكاديمية" : "Academy Overview"}</span>
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{isAr ? "البرامج والعروض" : "Programs & Offerings"}</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-raised text-nx-accent shadow-nx-glow shrink-0">
            <Layers className="h-6 w-6 text-nx-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isAr ? "البرامج والمسارات التدريبية" : "Programs & Offerings"}
            </h1>
            <p className="text-xs text-nx-ink-2 mt-0.5">
              {isAr
                ? "تحديد البرامج الرياضية، تكوين المسارات التدريبية، وإدارة السعة الاستيعابية."
                : "Curriculum tracks, multi-sport pathways, and age-band developmental programs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Code,Name,Level,MinAge,MaxAge,Status", ...state.programs.map(p => `${p.id},${p.code},${p.nameEn},${p.level},${p.minAge},${p.maxAge},${p.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `academy_programs_${new Date().toISOString().slice(0,10)}.csv`);
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
              onClick={openCreateDialog}
              className="h-9 px-4 rounded-lg bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c6ff00]/20 cursor-pointer border-none"
            >
              <Plus className="h-3.5 w-3.5 text-black stroke-[3]" />
              <span>{isAr ? "+ إنشاء برنامج جديد" : "+ New Program"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. 4 Real KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Programs */}
        <div className="rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-nx-ink">{totalProgramsCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "إجمالي البرامج" : "Total Programs"}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2.5 py-1 rounded-full border border-nx-accent-fill/40">
            {isAr ? "معتمد" : "Registered"}
          </span>
        </div>

        {/* Card 2: Published Programs */}
        <div className="rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-nx-ink">{publishedCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "البرامج المنشورة" : "Published Programs"}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-success bg-nx-accent-fill/15 px-2.5 py-1 rounded-full border border-success/30">
            {isAr ? "نشط" : "Live"}
          </span>
        </div>

        {/* Card 3: Draft Programs */}
        <div className="rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nx-raised border border-nx-line text-warning">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-nx-ink">{draftCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "قيد الإعداد (مسودة)" : "Draft Programs"}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-warning bg-warning/15 px-2.5 py-1 rounded-full border border-warning/30">
            {isAr ? "مسودة" : "Draft"}
          </span>
        </div>

        {/* Card 4: Sports Disciplines */}
        <div className="rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nx-accent-fill/15 border border-nx-accent-fill/40 text-nx-accent">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-nx-ink">{activeSportsCount}</div>
              <div className="text-xs text-nx-ink-2 mt-0.5">{isAr ? "الرياضات المعتمدة" : "Active Sports"}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-nx-accent bg-nx-accent-fill/15 px-2.5 py-1 rounded-full border border-nx-accent-fill/40">
            {isAr ? "معتمد" : "Accredited"}
          </span>
        </div>
      </div>

      {/* 4. Dynamic Sport Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {sportTabs.map((tab) => {
          const isActive = selectedSportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSportTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-nx-accent-fill text-nx-on-fill shadow-nx-glow"
                  : "bg-nx-surface border border-nx-line text-nx-ink-2 hover:text-nx-ink hover:border-nx-line-hi"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-nx-surface border border-nx-line p-3 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nx-ink-2 pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، الرمز، أو الوصف..." : "Search programs by title, code, or description..."}
              className="w-full h-9 pl-9 pr-3.5 text-xs rounded-full bg-nx-raised border border-nx-line text-white placeholder:text-nx-ink-3 focus:outline-none focus:border-nx-accent transition-colors rtl:pl-3.5 rtl:pr-9"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3.5 pr-8 rounded-full bg-nx-raised border border-nx-line text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-nx-accent rtl:pr-3.5 rtl:pl-8"
            >
              <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
              <option value="Published">{isAr ? "منشور (Published)" : "Published"}</option>
              <option value="Draft">{isAr ? "مسودة (Draft)" : "Draft"}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-nx-ink-2 pointer-events-none rtl:right-auto rtl:left-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => reload()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state.stage === "loading" ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 6. Programs 2-Column Horizontal Cards Grid matching 05_Programs_and_Offerings.png */}
      {state.stage === "loading" ? (
        <div className="py-20 text-center">
          <LoadingSpinner />
          <p className="text-xs text-nx-ink-2 mt-2">{isAr ? "جاري تحميل البرامج والعروض..." : "Loading programs and curriculum tracks..."}</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-nx-line bg-nx-surface p-8 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-nx-line bg-nx-raised text-nx-accent">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-nx-ink">{isAr ? "لا توجد برامج مسجلة" : "No Programs Found"}</h3>
          <p className="text-xs text-nx-ink-2 max-w-sm mx-auto">
            {isAr
              ? "لم يتم العثور على برامج تطابق معايير التصفية المحددة. يمكنك إضافة برنامج رياضي جديد الآن."
              : "No sports curriculum tracks match the active filter criteria. Define a new program to configure offerings."}
          </p>
          {canCreate && (
            <Button
              onClick={openCreateDialog}
              className="h-9 px-4 text-xs bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold"
            >
              {isAr ? "+ إنشاء برنامج جديد" : "+ Create Program"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredPrograms.map((program) => {
            const sport = state.sports.find(s => s.id === program.sportId);
            const sportName = isAr && sport?.nameAr ? sport.nameAr : (sport?.nameEn || "Multi-Sport");
            const bgImage = getProgramImage(sport?.code || program.code);

            return (
              <div
                key={program.id}
                className="group relative flex flex-col sm:flex-row rounded-2xl border border-nx-line bg-nx-surface hover:border-nx-accent/50 transition-all duration-300 shadow-xl overflow-hidden min-h-[200px]"
              >
                {/* Left Side: Sport Photo with Diagonal Lime Corner Accent Slice */}
                <div className="w-full sm:w-[190px] h-[160px] sm:h-auto shrink-0 relative overflow-hidden bg-nx-raised">
                  <Image
                    src={bgImage}
                    alt={program.nameEn}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent" />

                  {/* Sport Code Pill on top left */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                    <span className="font-mono text-[10px] font-bold text-nx-accent bg-black/70 px-2 py-0.5 rounded border border-nx-accent-fill/30">
                      {program.code}
                    </span>
                  </div>

                  {/* Authentic Diagonal Signal Lime Corner Accent Streak */}
                  <div
                    className="absolute bottom-0 right-0 w-12 h-12 bg-nx-accent-fill pointer-events-none"
                    style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                  />
                </div>

                {/* Right Side: Program Details & Operational Controls */}
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    {/* Header Row: Sport Pill, Status Chip */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 border border-white/10 text-white">
                        {sportName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          program.status === "Published"
                            ? "bg-nx-accent-fill/15 text-success border-success/30"
                            : "bg-warning/15 text-warning border-warning/40"
                        }`}
                      >
                        {program.status === "Published" ? (isAr ? "● منشور" : "● Published") : (isAr ? "مسودة" : "Draft")}
                      </span>
                    </div>

                    {/* Program Title */}
                    <h3 className="text-base font-black text-nx-ink group-hover:text-nx-accent transition-colors leading-snug truncate">
                      {isAr ? program.nameAr : program.nameEn}
                    </h3>

                    {/* Version & Description */}
                    <p className="text-xs text-nx-ink-2 line-clamp-2 leading-relaxed mt-1">
                      {isAr
                        ? (program.descriptionAr || program.descriptionEn || "مسار تدريبي معتمد وفق المعايير الأكاديمية.")
                        : (program.descriptionEn || program.descriptionAr || "Accredited developmental curriculum track.")}
                    </p>
                  </div>

                  {/* 3 Metrics Row */}
                  <div className="flex items-center gap-3 text-[11px] text-nx-ink-2 pt-2 border-t border-nx-line/60">
                    <span className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{isAr ? "العمر:" : "Age:"} <b className="text-white">{program.minAge}–{program.maxAge}</b></span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>👥</span>
                      <span className="text-white font-medium">{program.level}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span className="text-white font-medium">{program.genderCriteria}</span>
                    </span>
                  </div>

                  {/* Bottom Operational Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-nx-ink-2">
                      v{program.version || 1} • {program.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {program.status === "Draft" && canPublish && (
                        <Button
                          onClick={() => publishProgram(program.id)}
                          className="h-7 px-3 text-[11px] bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold flex items-center gap-1"
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>{isAr ? "نشر" : "Publish"}</span>
                        </Button>
                      )}

                      <Link
                        href="/academy/programs"
                        className="h-7 px-3.5 rounded-full border border-nx-accent-fill text-nx-accent hover:bg-nx-accent-fill hover:text-black font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <span>{isAr ? "إدارة ←" : "Manage →"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Program Modal */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-nx-accent" />
                <h3 className="text-base font-bold text-nx-ink">
                  {isAr ? "إنشاء برنامج رياضي جديد" : "Create Sports Program"}
                </h3>
              </div>
              <button onClick={closeCreateDialog} className="text-nx-ink-2 hover:text-nx-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الرياضة" : "Sport"}</label>
                  <select
                    value={sportId}
                    onChange={(e) => setSportId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
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
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "رمز البرنامج" : "Program Code"}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. YOUTH-FB"
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs font-mono uppercase focus:outline-none focus:border-nx-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الاسم (EN)" : "Name (EN)"}</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Youth Football"
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  />
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الاسم (AR)" : "Name (AR)"}</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: كرة القدم للناشئين"
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "المستوى" : "Level"}</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ProgramLevel)}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الفئة" : "Gender Criteria"}</label>
                  <select
                    value={genderCriteria}
                    onChange={(e) => setGenderCriteria(e.target.value as GenderCriteria)}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="BoysOnly">Boys Only</option>
                    <option value="GirlsOnly">Girls Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الحد الأدنى للعمر" : "Min Age"}</label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  />
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الحد الأقصى للعمر" : "Max Age"}</label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">{isAr ? "الوصف" : "Description"}</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-nx-raised border border-nx-line text-white text-xs focus:outline-none focus:border-nx-accent"
                  placeholder="Program overview and training methodology..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-nx-line">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="h-8 px-4 rounded-lg border border-nx-line bg-nx-raised text-white font-semibold hover:bg-nx-raised"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <Button
                  type="submit"
                  disabled={!isFormValid || state.stage === "loading"}
                  className="h-8 px-4 bg-nx-accent-fill hover:bg-nx-accent-fill text-black font-bold"
                >
                  {isAr ? "إنشاء البرنامج" : "Create Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
