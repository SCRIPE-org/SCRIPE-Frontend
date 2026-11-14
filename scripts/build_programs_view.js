const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'modules', 'academy', 'programs', 'src', 'presentation', 'views', 'AcademyProgramsView.tsx');

const code = `"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyProgramsViewModel } from "../viewmodels/useAcademyProgramsViewModel";
import type { ProgramLevel, GenderCriteria } from "../../domain/entities/AcademyProgram";
import { LoadingSpinner } from "@core/ui/loading-spinner";
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
  CheckCircle2
} from "lucide-react";

interface RichProgramCard {
  id: string;
  sportId: string;
  sportCode: string;
  sportName: string;
  sportIcon: string;
  title: string;
  titleAr: string;
  code: string;
  version: number;
  description: string;
  descriptionAr: string;
  status: "Published" | "Draft";
  imageUrl: string;
  athletesCount: number;
  groupsCount: number;
  sessionsPerWeek: number;
  minAge: number;
  maxAge: number;
  level: string;
  genderCriteria: "Mixed" | "BoysOnly" | "GirlsOnly";
}

const DEFAULT_PROGRAMS: RichProgramCard[] = [
  {
    id: "prog-1",
    sportId: "sport-football",
    sportCode: "FOOTBALL",
    sportName: "Football (Soccer)",
    sportIcon: "⚽",
    title: "Junior Football Club",
    titleAr: "نادي كرة القدم للناشئين",
    code: "QA-GAMMA",
    version: 2,
    description: "Comprehensive development program for young football players.",
    descriptionAr: "برنامج تطوير شامل للاعبي كرة القدم الناشئين يركز على المهارات الأساسية والتكتيك.",
    status: "Published",
    imageUrl: "/images/academy/program_football.png",
    athletesCount: 512,
    groupsCount: 8,
    sessionsPerWeek: 24,
    minAge: 6,
    maxAge: 16,
    level: "Beginner – Advanced",
    genderCriteria: "Mixed"
  },
  {
    id: "prog-2",
    sportId: "sport-swimming",
    sportCode: "SWIMMING",
    sportName: "Swimming Development",
    sportIcon: "🏊",
    title: "Swimming Development",
    titleAr: "تطوير السباحة",
    code: "SWM-DEV",
    version: 1,
    description: "Technique, endurance and stroke mastery for all swim disciplines.",
    descriptionAr: "إتقان تقنيات وضربات السباحة وقوة التحمل عبر مختلف المسافات.",
    status: "Published",
    imageUrl: "/images/academy/program_swimming.png",
    athletesCount: 228,
    groupsCount: 4,
    sessionsPerWeek: 16,
    minAge: 7,
    maxAge: 18,
    level: "All Levels",
    genderCriteria: "Mixed"
  },
  {
    id: "prog-3",
    sportId: "sport-padel",
    sportCode: "PADEL",
    sportName: "Padel Junior Club",
    sportIcon: "🎾",
    title: "Padel Junior Club",
    titleAr: "نادي البادل للشباب",
    code: "PDL-JR",
    version: 1,
    description: "Fast-paced modern racket sport fundamentals, tactics, and match play.",
    descriptionAr: "أسس وتكتيكات لعبة البادل الحديثة مع تدريبات حية ومباريات تنافسية.",
    status: "Published",
    imageUrl: "/images/academy/program_padel.png",
    athletesCount: 96,
    groupsCount: 3,
    sessionsPerWeek: 12,
    minAge: 8,
    maxAge: 16,
    level: "Intermediate",
    genderCriteria: "Mixed"
  },
  {
    id: "prog-4",
    sportId: "sport-basketball",
    sportCode: "BASKETBALL",
    sportName: "Basketball Youth",
    sportIcon: "🏀",
    title: "Basketball Youth",
    titleAr: "أكاديمية كرة السلة للشباب",
    code: "BB-YOUTH",
    version: 2,
    description: "Ball handling, shooting fundamentals, physical conditioning, and game IQ.",
    descriptionAr: "التحكم بالكرة، التسديد، اللياقة البدنية والوعي الخططي داخل الملعب.",
    status: "Published",
    imageUrl: "/images/academy/program_basketball.png",
    athletesCount: 142,
    groupsCount: 4,
    sessionsPerWeek: 18,
    minAge: 8,
    maxAge: 17,
    level: "Beginner – Elite",
    genderCriteria: "Mixed"
  },
  {
    id: "prog-5",
    sportId: "sport-gymnastics",
    sportCode: "GYMNASTICS",
    sportName: "Gymnastics Foundation",
    sportIcon: "🤸",
    title: "Gymnastics Foundation",
    titleAr: "أساسيات الجمباز",
    code: "GYM-FND",
    version: 1,
    description: "Flexibility, core strength, balance, floor exercises, and apparatus training.",
    descriptionAr: "المرونة، القوة العضلية المركزية، التوازن، والتدريب على الأجهزة المتنوعة.",
    status: "Published",
    imageUrl: "/images/academy/program_gymnastics.png",
    athletesCount: 84,
    groupsCount: 2,
    sessionsPerWeek: 10,
    minAge: 5,
    maxAge: 14,
    level: "Beginner – Intermediate",
    genderCriteria: "GirlsOnly"
  },
  {
    id: "prog-6",
    sportId: "sport-football-elite",
    sportCode: "FOOTBALL",
    sportName: "Football (Soccer)",
    sportIcon: "⚽",
    title: "U12 Elite Football",
    titleAr: "منتخب النخبة تحت 12 سنة",
    code: "FB-U12-ELITE",
    version: 1,
    description: "Selective squad pathway for competitive regional tournament participation.",
    descriptionAr: "مسار النخبة التنافسي للمشاركة في البطولات الإقليمية والمباريات الرسمية.",
    status: "Draft",
    imageUrl: "/images/academy/program_u12_elite.png",
    athletesCount: 24,
    groupsCount: 1,
    sessionsPerWeek: 6,
    minAge: 11,
    maxAge: 12,
    level: "Elite",
    genderCriteria: "BoysOnly"
  }
];

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

  // Local Filter state
  const [selectedSportTab, setSelectedSportTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Combine backend programs with default rich cards
  const displayPrograms = useMemo(() => {
    if (state.programs && state.programs.length > 0) {
      const mapped = state.programs.map((p, idx) => {
        const sport = state.sports.find(s => s.id === p.sportId);
        return {
          id: p.id,
          sportId: p.sportId,
          sportCode: sport?.code || "SPORT",
          sportName: isAr && sport?.nameAr ? sport.nameAr : (sport?.nameEn || "Multi-Sport"),
          sportIcon: "🏆",
          title: isAr && p.nameAr ? p.nameAr : p.nameEn,
          titleAr: p.nameAr,
          code: p.code,
          version: p.version || 1,
          description: isAr && p.descriptionAr ? p.descriptionAr : (p.descriptionEn || "Structured sporting program curriculum."),
          descriptionAr: p.descriptionAr || "",
          status: p.status === "Published" ? ("Published" as const) : ("Draft" as const),
          imageUrl: DEFAULT_PROGRAMS[idx % DEFAULT_PROGRAMS.length].imageUrl,
          athletesCount: 120 + idx * 40,
          groupsCount: 4,
          sessionsPerWeek: 12,
          minAge: p.minAge || 6,
          maxAge: p.maxAge || 16,
          level: p.level || "All Levels",
          genderCriteria: p.genderCriteria || "Mixed"
        };
      });

      const combined = [...mapped];
      for (const d of DEFAULT_PROGRAMS) {
        if (!combined.some(c => c.code === d.code)) {
          combined.push(d);
        }
      }
      return combined;
    }
    return DEFAULT_PROGRAMS;
  }, [state.programs, state.sports, isAr]);

  // Filter programs based on sport tab, search query, and status
  const filteredPrograms = useMemo(() => {
    return displayPrograms.filter(p => {
      // Tab filter
      if (selectedSportTab !== "all") {
        if (selectedSportTab === "football" && !p.sportName.toLowerCase().includes("football")) return false;
        if (selectedSportTab === "swimming" && !p.sportName.toLowerCase().includes("swimming")) return false;
        if (selectedSportTab === "padel" && !p.sportName.toLowerCase().includes("padel")) return false;
        if (selectedSportTab === "basketball" && !p.sportName.toLowerCase().includes("basketball")) return false;
        if (selectedSportTab === "gymnastics" && !p.sportName.toLowerCase().includes("gymnastics")) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesDesc) return false;
      }
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [displayPrograms, selectedSportTab, searchQuery, statusFilter]);

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
                onClick={() => alert(isAr ? "تم استدعاء معالج الاستيراد" : "Import wizard triggered")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#343b40] bg-[#121619] hover:bg-[#1a1f23] text-xs font-bold text-white transition-colors"
              >
                <Upload className="h-4 w-4 text-[#c8ff05]" />
                <span>{isAr ? "استيراد" : "Import"}</span>
              </button>

              <button
                onClick={() => alert(isAr ? "عرض تحليلات البرامج" : "Program Analytics triggered")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#343b40] bg-[#121619] hover:bg-[#1a1f23] text-xs font-bold text-white transition-colors"
              >
                <BarChart2 className="h-4 w-4 text-[#c8ff05]" />
                <span>{isAr ? "التحليلات" : "Analytics"}</span>
              </button>

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

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Programs */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">12</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "إجمالي البرامج" : "Total Programs"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              ↑ +20%
            </span>
          </div>

          {/* Card 2: Active Offerings */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">18</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "العروض النشطة" : "Active Offerings"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              ↑ +12%
            </span>
          </div>

          {/* Card 3: Enrolled Athletes */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">842</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "الرياضيون المسجلون" : "Enrolled Athletes"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              ↑ +6.2%
            </span>
          </div>

          {/* Card 4: Weekly Sessions */}
          <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">104</div>
                <div className="text-xs text-[#aeb5b5] mt-0.5">{isAr ? "الحصص الأسبوعية" : "Weekly Sessions"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2.5 py-1 rounded-full border border-[#5a7800]">
              ↑ +4
            </span>
          </div>
        </div>

        {/* Sport Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSportTab("all")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "all"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{isAr ? "جميع البرامج (12)" : "All Programs (12)"}</span>
          </button>

          <button
            onClick={() => setSelectedSportTab("football")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "football"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <span>⚽</span>
            <span>{isAr ? "كرة القدم (4)" : "Football (4)"}</span>
          </button>

          <button
            onClick={() => setSelectedSportTab("swimming")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "swimming"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <span>🏊</span>
            <span>{isAr ? "السباحة (2)" : "Swimming (2)"}</span>
          </button>

          <button
            onClick={() => setSelectedSportTab("padel")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "padel"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <span>🎾</span>
            <span>{isAr ? "البادل (2)" : "Padel (2)"}</span>
          </button>

          <button
            onClick={() => setSelectedSportTab("basketball")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "basketball"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <span>🏀</span>
            <span>{isAr ? "كرة السلة (2)" : "Basketball (2)"}</span>
          </button>

          <button
            onClick={() => setSelectedSportTab("gymnastics")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              selectedSportTab === "gymnastics"
                ? "border-2 border-[#c8ff05] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.18)]"
                : "border border-[#2a3033] bg-[#101315] text-[#c5c9cb] hover:bg-[#161a1d]"
            }\`}
          >
            <span>🤸</span>
            <span>{isAr ? "الجمباز (1)" : "Gymnastics (1)"}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2a3033] bg-[#101315] text-xs font-bold text-[#9aa1a6] hover:text-white transition-colors">
            <span>{isAr ? "المزيد" : "More"}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Secondary Filter Bar */}
        <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#778084]" />
              <input
                type="text"
                placeholder={isAr ? "البحث في البرامج بالاسم أو الرمز..." : "Search programs by name or code..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#343b40] bg-[#0c1217] pl-10 pr-4 py-2 text-xs text-white placeholder-[#778084] focus:border-[#c8ff05] focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#343b40] bg-[#0e1114] px-3 py-2 text-xs text-[#c5c9cb] focus:border-[#c8ff05] focus:outline-none"
            >
              <option value="all">{isAr ? "الحالة: الكل" : "Status: All"}</option>
              <option value="Published">{isAr ? "منشور" : "Published"}</option>
              <option value="Draft">{isAr ? "مسودة" : "Draft"}</option>
            </select>

            {/* Age Filter */}
            <select
              value={ageFilter}
              onChange={e => setAgeFilter(e.target.value)}
              className="rounded-xl border border-[#343b40] bg-[#0e1114] px-3 py-2 text-xs text-[#c5c9cb] focus:border-[#c8ff05] focus:outline-none"
            >
              <option value="all">{isAr ? "الفئة العمرية: الكل" : "Age: All"}</option>
              <option value="u10">Under 10</option>
              <option value="u14">Under 14</option>
              <option value="u18">Under 18</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* List / Grid Toggle */}
            <div className="flex items-center rounded-xl border border-[#2a3033] bg-[#0c1012] p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={\`flex h-7 w-7 items-center justify-center rounded-lg transition-colors \${viewMode === "grid" ? "bg-[#293807] text-[#c8ff05] shadow-inner" : "text-[#778084] hover:text-white"}\`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={\`flex h-7 w-7 items-center justify-center rounded-lg transition-colors \${viewMode === "list" ? "bg-[#293807] text-[#c8ff05] shadow-inner" : "text-[#778084] hover:text-white"}\`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 6 Rich Program Cards (2x3 Grid) */}
        {state.stage === "loading" && state.programs.length === 0 ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPrograms.map(program => (
              <div
                key={program.id}
                className="group relative rounded-2xl border border-[#2a3033] bg-[#101315] hover:border-[#c8ff05]/60 p-4 shadow-xl transition-all duration-300 hover:shadow-[0_0_24px_rgba(200,255,5,0.08)] flex flex-col justify-between overflow-hidden"
              >
                <div className="flex gap-4">
                  {/* Left Photograph with Authentic SCRIPE Diagonal Signal Lime Streak */}
                  <div className="relative h-44 w-36 sm:w-40 rounded-2xl overflow-hidden shrink-0 border border-[#30363a] bg-[#080a0b] shadow-inner">
                    <Image
                      src={program.imageUrl}
                      alt={program.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Atmospheric diagonal Signal Lime brand streak */}
                    <div
                      className="absolute -bottom-3 -right-6 w-24 h-7 bg-[#c8ff05] shadow-[0_0_12px_#c8ff05] transform -rotate-45 pointer-events-none"
                    />
                  </div>

                  {/* Right Program Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Top Row: Sport pill, Status badge & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#343b40] bg-[#14181a] text-[#c5c9cb]">
                        <span>{program.sportName}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold \${
                            program.status === "Published"
                              ? "bg-[#1e2b09] text-[#b9fb30] border border-[#627b00]"
                              : "bg-[#372b09] text-[#ffd24d] border border-[#715a12]"
                          }\`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span>{program.status === "Published" ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft")}</span>
                        </span>

                        <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#1a1f23] text-[#778084] hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Program Title & Code */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#c8ff05] transition-colors truncate">
                        {program.title}
                      </h3>
                      <div className="text-[11px] text-[#778084] mt-0.5">
                        Code: {program.code} • v{program.version}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#9aa1a6] line-clamp-2 leading-relaxed">
                      {program.description}
                    </p>

                    {/* Metrics Row */}
                    <div className="flex items-center gap-4 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <User className="h-3.5 w-3.5 text-[#c8ff05]" />
                        <span>{program.athletesCount}</span>
                        <span className="text-[10px] font-normal text-[#778084]">{isAr ? "رياضي" : "Athletes"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Users className="h-3.5 w-3.5 text-[#c8ff05]" />
                        <span>{program.groupsCount}</span>
                        <span className="text-[10px] font-normal text-[#778084]">{isAr ? "مجموعات" : "Groups"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Calendar className="h-3.5 w-3.5 text-[#c8ff05]" />
                        <span>{program.sessionsPerWeek}</span>
                        <span className="text-[10px] font-normal text-[#778084]">{isAr ? "حصص / أسبوع" : "Sessions / Wk"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Line: Age, Level & Manage Button */}
                <div className="mt-4 pt-3 border-t border-[#232a2d] flex items-center justify-between text-xs text-[#9aa1a6]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#778084]" />
                      <span>{isAr ? \`الأعمار: \${program.minAge} – \${program.maxAge} سنة\` : \`Ages: \${program.minAge} – \${program.maxAge} yrs\`}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BarChart2 className="h-3.5 w-3.5 text-[#778084]" />
                      <span>Level: {program.level}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (program.status === "Draft" && canPublish) {
                        publishProgram(program.id);
                      } else {
                        alert(isAr ? \`إدارة برنامج: \${program.title}\` : \`Manage program: \${program.title}\`);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#c8ff05] bg-transparent hover:bg-[#c8ff05]/10 text-[#c8ff05] text-xs font-bold transition-all shadow-[0_0_12px_rgba(200,255,5,0.1)]"
                  >
                    <span>{program.status === "Draft" && canPublish ? (isAr ? "نشر البرنامج" : "Publish Program") : (isAr ? "إدارة ←" : "Manage →")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a3033] bg-[#121619] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between border-b border-[#2a3033] pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {isAr ? "إنشاء برنامج رياضي جديد" : "Create New Program"}
                </h2>
                <p className="text-xs text-[#9aa1a6]">
                  {isAr ? "إضافة منهج رياضي معتمد وربطه بتصنيف الرياضات" : "Establish foundational curriculum linked to SportsCore taxonomy"}
                </p>
              </div>
              <button
                onClick={closeCreateDialog}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#1a1f23] text-[#778084] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">
                  {isAr ? "تصنيف الرياضة الأساسية *" : "Sport Taxonomy *"}
                </label>
                <select
                  className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                  value={sportId}
                  onChange={e => setSportId(e.target.value)}
                >
                  <option value="">{isAr ? "-- اختر الرياضة المعتمدة --" : "-- Select canonical sport --"}</option>
                  <option value="sport-football">Football (Soccer)</option>
                  <option value="sport-swimming">Swimming</option>
                  <option value="sport-padel">Padel</option>
                  <option value="sport-basketball">Basketball</option>
                  <option value="sport-gymnastics">Gymnastics</option>
                  {state.sports.map(s => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.nameAr : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "رمز البرنامج *" : "Program Code *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROG-FB-JR"
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "مستوى البرنامج *" : "Level *"}
                  </label>
                  <select
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={level}
                    onChange={e => setLevel(e.target.value as ProgramLevel)}
                  >
                    <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                    <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                    <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                    <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "الاسم (إنجليزي) *" : "Name (English) *"}
                  </label>
                  <input
                    type="text"
                    placeholder="Junior Football Development"
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "الاسم (عربي) *" : "Name (Arabic) *"}
                  </label>
                  <input
                    type="text"
                    placeholder="برنامج تطوير كرة القدم"
                    dir="rtl"
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "الحد الأدنى للعمر *" : "Min Age *"}
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={25}
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={minAge}
                    onChange={e => setMinAge(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "الحد الأقصى للعمر *" : "Max Age *"}
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={25}
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={maxAge}
                    onChange={e => setMaxAge(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">
                    {isAr ? "فئة الجنس *" : "Gender Criteria *"}
                  </label>
                  <select
                    className="w-full h-9 rounded-xl border border-[#343b40] bg-[#0c1012] px-3 text-xs text-white"
                    value={genderCriteria}
                    onChange={e => setGenderCriteria(e.target.value as GenderCriteria)}
                  >
                    <option value="Mixed">{isAr ? "مختلط (Mixed)" : "Mixed"}</option>
                    <option value="BoysOnly">{isAr ? "بنين فقط (Boys Only)" : "Boys Only"}</option>
                    <option value="GirlsOnly">{isAr ? "بنات فقط (Girls Only)" : "Girls Only"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">
                  {isAr ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-[#343b40] bg-[#0c1012] p-2 text-xs text-white"
                  value={descriptionEn}
                  onChange={e => setDescriptionEn(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2a3033]">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="px-4 py-2 rounded-xl border border-[#343b40] text-xs font-bold text-[#c5c9cb] hover:bg-[#1a1f23]"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={state.submitting || !isFormValid}
                  className="px-5 py-2 rounded-xl bg-[#c8ff05] hover:bg-[#d4ff33] text-[#131600] font-extrabold text-xs disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(200,255,5,0.2)]"
                >
                  {state.submitting
                    ? (isAr ? "جاري الحفظ..." : "Saving...")
                    : (isAr ? "حفظ البرنامج" : "Save Program")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully written AcademyProgramsView.tsx');
