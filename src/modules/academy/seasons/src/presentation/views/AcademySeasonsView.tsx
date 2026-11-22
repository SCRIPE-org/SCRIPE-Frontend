"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowLeft,
  Info,
  ShieldAlert,
  ChevronRight,
  Settings as SettingsIcon,
  Check,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import type {
  AcademySeason,
  CreateSeasonPayload,
  UpdateSeasonPayload,
  SeasonStatus,
} from "../../domain/entities/AcademySeason";

export function AcademySeasonsView() {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const router = useRouter();
  const searchParams = useSearchParams();

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_CREATE);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_UPDATE) || canCreate;

  const urlSeasonId = searchParams?.get("seasonId");
  const urlTab = searchParams?.get("tab");

  const locator = useAcademyServiceLocator();
  const {
    state,
    selectSeason,
    openCreateDialog,
    closeCreateDialog,
    createSeason,
    updateSeason,
    reload,
  } = useAcademySeasonsViewModel(locator.seasonsRepository, urlSeasonId);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "offerings" | "groups" | "enrollment" | "settings">(
    urlTab === "settings" ? "settings" : "overview"
  );

  // Raw contextual data for authentic season-scoped calculations
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allOfferings, setAllOfferings] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [metricsLoaded, setMetricsLoaded] = useState<boolean>(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Settings inline form states
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState<SeasonStatus>("Draft");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Create form states
  const [createNameEn, setCreateNameEn] = useState("");
  const [createNameAr, setCreateNameAr] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createEndDate, setCreateEndDate] = useState("");

  // Load authentic backend dataset across linked entities
  const loadRelatedData = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsLoaded(false);
    setMetricsError(null);
    try {
      const fetchAllSessions = async () => {
        const pageSize = 200;
        const firstPage: any = await locator.sessionsRepository.list({ page: 1, pageSize });
        const sessions = [...(firstPage?.items || [])];
        const totalCount = firstPage?.totalCount ?? sessions.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage: any = await locator.sessionsRepository.list({ page, pageSize });
          sessions.push(...(nextPage?.items || []));
        }
        return sessions;
      };

      const [progs, offs, grps, enrs, sess] = await Promise.all([
        locator.programsRepository.fetchPrograms(),
        locator.offeringsRepository.fetchOfferings(),
        locator.groupsRepository.getGroups(),
        locator.enrollmentsRepository.getEnrollments(),
        fetchAllSessions(),
      ]);
      setAllPrograms(progs || []);
      setAllOfferings(offs || []);
      setAllGroups(grps || []);
      setAllEnrollments(enrs || []);
      setAllSessions(sess || []);
      setMetricsLoaded(true);
    } catch (error) {
      setMetricsError(error instanceof Error ? error.message : "Unable to load season operational metrics.");
    } finally {
      setMetricsLoading(false);
    }
  }, [locator]);

  useEffect(() => {
    loadRelatedData();
  }, [loadRelatedData]);

  // Derive Season Code
  const getSeasonCode = useCallback((season: AcademySeason) => {
    if (season.code) return season.code;
    const parsedStart = new Date(season.startDate);
    const year = Number.isFinite(parsedStart.valueOf()) ? parsedStart.getFullYear() : "UNKN";
    const cleaned = season.nameEn.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase() || "MAIN";
    return `ACAD-${year}-${cleaned}`;
  }, []);

  // Filtered seasons list
  const filteredSeasons = useMemo(() => {
    return state.seasons.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const code = getSeasonCode(s).toLowerCase();
      return (
        s.nameEn.toLowerCase().includes(q) ||
        (s.nameAr && s.nameAr.toLowerCase().includes(q)) ||
        code.includes(q)
      );
    });
  }, [state.seasons, searchQuery, getSeasonCode]);

  // Selected season entity
  const selectedSeason = useMemo(() => {
    if (!state.seasons.length) return null;
    if (state.selectedSeasonId) {
      const found = state.seasons.find((s) => s.id === state.selectedSeasonId);
      if (found) return found;
    }
    return state.seasons.find((s) => s.status === "Active") || state.seasons[0];
  }, [state.seasons, state.selectedSeasonId]);

  // Populate edit form when selected season changes
  useEffect(() => {
    if (selectedSeason) {
      setEditNameEn(selectedSeason.nameEn);
      setEditNameAr(selectedSeason.nameAr || "");
      setEditStartDate(selectedSeason.startDate.substring(0, 10));
      setEditEndDate(selectedSeason.endDate.substring(0, 10));
      setEditStatus(selectedSeason.status);
      setSaveSuccessMsg(null);
    }
  }, [selectedSeason]);

  // Sync URL search parameters on selection change
  const handleSelectSeason = (seasonId: string) => {
    selectSeason(seasonId);
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("seasonId", seasonId);
      if (activeTab) currentUrl.searchParams.set("tab", activeTab);
      window.history.pushState(null, "", currentUrl.toString());
    }
  };

  // Sync selected tab with URL
  const handleTabChange = (tab: "overview" | "offerings" | "groups" | "enrollment" | "settings") => {
    if (!selectedSeason) return;

    if (tab === "offerings") {
      router.push(`/academy/offerings?seasonId=${selectedSeason.id}`);
      return;
    }
    if (tab === "groups") {
      router.push(`/academy/groups?seasonId=${selectedSeason.id}`);
      return;
    }
    if (tab === "enrollment") {
      router.push(`/academy/enrollments?seasonId=${selectedSeason.id}`);
      return;
    }

    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("seasonId", selectedSeason.id);
      currentUrl.searchParams.set("tab", tab);
      window.history.pushState(null, "", currentUrl.toString());
    }
  };

  // Sync state if user navigates with browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get("seasonId");
      const tab = params.get("tab") as any;
      if (sId && state.seasons.some((s) => s.id === sId)) {
        selectSeason(sId);
      }
      if (tab && ["overview", "settings"].includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [state.seasons, selectSeason]);

  // Real season-scoped metrics derived from relationships
  const seasonMetrics = useMemo(() => {
    if (!selectedSeason) {
      return {
        seasonOfferings: [],
        seasonGroups: [],
        seasonEnrollments: [],
        seasonActiveEnrollments: [],
        seasonSessions: [],
        programsRate: 0,
        programsWithSeasonOffering: 0,
        totalPrograms: 0,
        groupsRate: 0,
        groupsWithCoaches: 0,
        totalSeasonGroups: 0,
        sessionsRate: 0,
        sessionsWithLocation: 0,
        totalSeasonSessions: 0,
        capacityRate: 0,
        totalSeasonEnrolled: 0,
        totalSeasonCapacity: 0,
      };
    }

    // 1. Season Offerings
    const seasonOfferings = allOfferings.filter((o) => o.seasonId === selectedSeason.id);
    const seasonOfferingIds = new Set(seasonOfferings.map((o) => o.id));

    // 2. Season Groups (linked via OfferingId)
    const seasonGroups = allGroups.filter((g) => seasonOfferingIds.has(g.offeringId));
    const seasonGroupIds = new Set(seasonGroups.map((g) => g.id));

    // 3. Season Enrollments (linked via OfferingId)
    const seasonEnrollments = allEnrollments.filter((e) => seasonOfferingIds.has(e.offeringId));
    const seasonActiveEnrollments = seasonEnrollments.filter((e) => e.status === "Active");

    // 4. Season Sessions (linked via OfferingId or GroupId)
    const seasonSessions = allSessions.filter(
      (s) => seasonOfferingIds.has(s.offeringId) || seasonGroupIds.has(s.groupId)
    );

    // Metric 1: Programs with published offerings
    const programsWithSeasonOffering = new Set(seasonOfferings.map((o) => o.programId)).size;
    const totalPrograms = allPrograms.length;
    const programsRate = totalPrograms > 0 ? Math.round((programsWithSeasonOffering / totalPrograms) * 100) : 0;

    // Metric 2: Groups with assigned coaches
    const groupsWithCoaches = seasonGroups.filter(
      (g) => (g.coaches && g.coaches.length > 0) || g.headCoachId || g.coachId
    ).length;
    const totalSeasonGroups = seasonGroups.length;
    const groupsRate = totalSeasonGroups > 0 ? Math.round((groupsWithCoaches / totalSeasonGroups) * 100) : 0;

    // Metric 3: Sessions with confirmed location
    const sessionsWithLocation = seasonSessions.filter(
      (s) => s.locationNameEn || s.locationNameAr || s.externalLocationId || s.venueReservationId
    ).length;
    const totalSeasonSessions = seasonSessions.length;
    const sessionsRate = totalSeasonSessions > 0 ? Math.round((sessionsWithLocation / totalSeasonSessions) * 100) : 0;

    // Metric 4: Enrollment capacity filled
    const totalSeasonCapacity = seasonGroups.reduce((acc, g) => acc + (g.maxCapacity || 0), 0);
    const totalSeasonEnrolled = seasonActiveEnrollments.length;
    const capacityRate = totalSeasonCapacity > 0 ? Math.min(100, Math.round((totalSeasonEnrolled / totalSeasonCapacity) * 100)) : 0;

    return {
      seasonOfferings,
      seasonGroups,
      seasonEnrollments,
      seasonActiveEnrollments,
      seasonSessions,
      programsRate,
      programsWithSeasonOffering,
      totalPrograms,
      groupsRate,
      groupsWithCoaches,
      totalSeasonGroups,
      sessionsRate,
      sessionsWithLocation,
      totalSeasonSessions,
      capacityRate,
      totalSeasonEnrolled,
      totalSeasonCapacity,
    };
  }, [selectedSeason, allPrograms, allOfferings, allGroups, allEnrollments, allSessions]);

  const activeSeasonCount = useMemo(() => {
    return state.seasons.filter((s) => s.status === "Active").length;
  }, [state.seasons]);

  const relatedMetric = (value: number) => {
    if (metricsLoading) return <LoadingSpinner size="sm" />;
    return metricsLoaded ? value : "—";
  };

  // Date countdown calculation
  const getCountdownText = (end?: string) => {
    if (!end) return isAr ? "غير محدد" : "Unspecified";
    const diff = new Date(end).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return isAr ? "انتهى الموسم" : "Season ended";
    }
    if (days === 0) {
      return isAr ? "ينتهي اليوم" : "Ends today";
    }
    return `${days} ${isAr ? "يوماً متبقياً في الموسم" : "days remaining in cycle"}`;
  };

  const getStatusBadge = (status: SeasonStatus | string) => {
    switch (status) {
      case "Active":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-[0_0_12px_rgba(200,255,5,0.15)]">
            {isAr ? "نشط" : "Active"}
          </span>
        );
      case "Draft":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-info/40 bg-info/15 text-info">
            {isAr ? "قادم / مسودة" : "Draft / Upcoming"}
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

  // Submit Create Season
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNameEn.trim() || !createNameAr.trim() || !createStartDate || !createEndDate) return;

    const ok = await createSeason({
      nameEn: createNameEn.trim(),
      nameAr: createNameAr.trim(),
      startDate: createStartDate,
      endDate: createEndDate,
    });

    if (ok) {
      setCreateNameEn("");
      setCreateNameAr("");
      closeCreateDialog();
    }
  };

  // Submit Settings Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeason || !editNameEn.trim() || !editNameAr.trim() || !editStartDate || !editEndDate) return;

    const ok = await updateSeason(selectedSeason.id, {
      nameEn: editNameEn.trim(),
      nameAr: editNameAr.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
      status: editStatus,
    });

    if (ok) {
      setSaveSuccessMsg(isAr ? "تم حفظ التعديلات بنجاح." : "Season settings updated successfully.");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      reload();
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6 rounded-2xl border border-destructive/30 bg-destructive/15 text-destructive">
        <h3 className="font-bold">{isAr ? "غير مصرح" : "Access Restricted"}</h3>
        <p className="text-xs mt-1 text-nx-ink-2">
          {isAr
            ? "ليس لديك صلاحية لعرض المواسم الأكاديمية."
            : "You do not have permission to view Academy Seasons."}
        </p>
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {isAr ? "المواسم الأكاديمية" : "Academic Seasons"}
                </h1>
                {selectedSeason && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg border border-nx-line bg-nx-raised text-nx-ink-2">
                    {getSeasonCode(selectedSeason)}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-nx-ink-2 mt-0.5 max-w-2xl">
                {isAr
                  ? "إدارة دورات ومواسم الأكاديمية، ونوافذ التسجيل، والجاهزية التشغيلية، والاستمرارية التاريخية."
                  : "Manage academy seasons, lifecycle windows, rollover readiness, and historical continuity."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                reload();
                loadRelatedData();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent text-xs font-semibold transition-all cursor-pointer"
            >
              <Archive className="h-4 w-4" />
              <span>{isAr ? "تحديث السجلات" : "Refresh Records"}</span>
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
              onClick={() => {
                reload();
                loadRelatedData();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent transition-all cursor-pointer"
              title={isAr ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-4 w-4 ${state.stage === "loading" || metricsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {metricsError && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-bold text-nx-ink">
                {isAr ? "تعذر تحميل مؤشرات الموسم" : "Season metrics are unavailable"}
              </p>
              <p className="text-xs text-nx-ink-2 mt-1">{metricsError}</p>
            </div>
          </div>
          <button type="button" onClick={() => void loadRelatedData()} className="text-xs font-bold text-nx-accent hover:underline shrink-0">
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}

      {/* 2. Four Authentic Season-Scoped KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Season Count */}
        <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">
              {isAr ? "المواسم النشطة" : "Active Seasons"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">{activeSeasonCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1 truncate">
              {selectedSeason ? (isAr && selectedSeason.nameAr ? selectedSeason.nameAr : selectedSeason.nameEn) : "—"}
            </div>
          </div>
        </div>

        {/* Card 2: Season Published Offerings */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">
              {isAr ? "العروض المنشورة (الموسم)" : "Published Offerings"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-nx-accent">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">
              {relatedMetric(seasonMetrics.seasonOfferings.length)}
            </div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "عروض منشورة في هذا الموسم" : "Cohorts in selected season"}
            </div>
          </div>
        </div>

        {/* Card 3: Season Active Enrollments */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">
              {isAr ? "التسجيلات المقيدة (الموسم)" : "Active Enrollments"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-info">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">
              {relatedMetric(seasonMetrics.seasonActiveEnrollments.length)}
            </div>
            <div className="text-[11px] text-info font-semibold mt-1">
              {isAr ? "لاعبون مقيدون في هذا الموسم" : "Active season registrations"}
            </div>
          </div>
        </div>

        {/* Card 4: Season Training Groups */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">
              {isAr ? "المجموعات التدريبية (الموسم)" : "Training Groups"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-warning">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black tracking-tight text-white">
              {relatedMetric(seasonMetrics.seasonGroups.length)}
            </div>
            <div className="text-[11px] text-warning font-semibold mt-1">
              {isAr ? "مجموعات تدريبية لهذا الموسم" : "Cohorts for this season"}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم أو رمز الموسم..." : "Search by season name or code..."}
              className="w-full h-8.5 rounded-xl border border-nx-line bg-nx-raised pl-9 pr-3 text-xs text-white placeholder:text-nx-ink-3 outline-none focus:border-nx-accent transition-all"
            />
          </div>

          {/* Seasons List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
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
              filteredSeasons.map((s) => {
                const isSelected = selectedSeason?.id === s.id;
                const code = getSeasonCode(s);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSeason(s.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-nx-accent-fill bg-nx-accent-fill/15/50 shadow-nx-glow"
                        : "border-nx-line bg-nx-raised hover:border-nx-line-hi"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "border-nx-accent-fill/60 bg-nx-accent-fill/15 text-nx-accent"
                            : "border-nx-line bg-nx-raised text-nx-ink-2"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-nx-ink truncate">
                            {isAr && s.nameAr ? s.nameAr : s.nameEn}
                          </span>
                          <span className="text-[10px] font-mono text-nx-accent shrink-0">
                            [{code}]
                          </span>
                        </div>
                        <div className="text-[10px] text-nx-ink-2 truncate mt-0.5">
                          {new Date(s.startDate).toLocaleDateString(language, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          –{" "}
                          {new Date(s.endDate).toLocaleDateString(language, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
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

        {/* Right Column: Selected Season Details & Actions (7 Cols) */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-nx-accent uppercase tracking-wider">
                      {isAr ? "الموسم المحدد" : "Selected Season"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-nx-line bg-nx-raised text-nx-ink-2">
                      {getSeasonCode(selectedSeason)}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-nx-ink mt-0.5">
                    {isAr && selectedSeason.nameAr ? selectedSeason.nameAr : selectedSeason.nameEn}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedSeason.status)}
                </div>
              </div>

              {/* 5 Selected-Season Action Tabs Bar */}
              <div className="flex items-center gap-2 border-b border-nx-line pb-2 text-xs overflow-x-auto">
                <button
                  onClick={() => handleTabChange("overview")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "overview"
                      ? "bg-nx-accent-fill text-nx-on-fill font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
                  }`}
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  <span>{isAr ? "نظرة عامة" : "Overview"}</span>
                </button>

                <button
                  onClick={() => handleTabChange("offerings")}
                  className="px-3 py-1.5 rounded-xl font-semibold text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ? "الانتقال إلى عروض هذا الموسم" : "Navigate to offerings for this season"}
                >
                  <Layers className="h-3.5 w-3.5 text-nx-accent" />
                  <span>{isAr ? "العروض" : "Offerings"}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-nx-raised border border-nx-line font-mono">
                    {metricsLoaded ? seasonMetrics.seasonOfferings.length : "—"}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabChange("groups")}
                  className="px-3 py-1.5 rounded-xl font-semibold text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ? "الانتقال إلى مجموعات هذا الموسم" : "Navigate to training groups for this season"}
                >
                  <Users className="h-3.5 w-3.5 text-warning" />
                  <span>{isAr ? "المجموعات" : "Groups"}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-nx-raised border border-nx-line font-mono">
                    {metricsLoaded ? seasonMetrics.seasonGroups.length : "—"}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabChange("enrollment")}
                  className="px-3 py-1.5 rounded-xl font-semibold text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ? "الانتقال إلى تسجيلات هذا الموسم" : "Navigate to enrollments for this season"}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-info" />
                  <span>{isAr ? "التسجيل" : "Enrollment"}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-nx-raised border border-nx-line font-mono">
                    {metricsLoaded ? seasonMetrics.seasonActiveEnrollments.length : "—"}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabChange("settings")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "settings"
                      ? "bg-nx-accent-fill text-nx-on-fill font-bold shadow-nx-glow"
                      : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
                  }`}
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span>{isAr ? "الإعدادات" : "Settings"}</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Season Dates & Countdown minicards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-1">
                      <div className="text-[10px] font-bold text-nx-ink-2 uppercase tracking-wider">
                        {isAr ? "بداية الموسم" : "Season Start"}
                      </div>
                      <strong className="text-sm font-bold text-nx-ink block">
                        {new Date(selectedSeason.startDate).toLocaleDateString(language, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                      <p className="text-[10px] text-nx-ink-2">
                        {isAr ? "تاريخ تقويمي محفوظ للموسم" : "Stored season calendar date"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-1">
                      <div className="text-[10px] font-bold text-nx-ink-2 uppercase tracking-wider">
                        {isAr ? "نهاية الموسم والعد التنازلي" : "Season End & Countdown"}
                      </div>
                      <strong className="text-sm font-bold text-nx-ink block">
                        {new Date(selectedSeason.endDate).toLocaleDateString(language, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                      <p className="text-[10px] text-nx-accent font-semibold">
                        {getCountdownText(selectedSeason.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Operational Readiness Progress Bars (AUTHENTIC SEASON-SCOPED DATA) */}
                  {!metricsLoading && !metricsLoaded && (
                    <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-nx-ink-2">
                      {isAr
                        ? "مؤشرات الجاهزية محجوبة لأن بيانات التشغيل المرتبطة لم تُحمّل بنجاح."
                        : "Readiness metrics are withheld because the related operational data did not load successfully."}
                    </div>
                  )}
                  <div className={metricsLoaded ? "space-y-3 pt-2" : "hidden"}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-nx-ink uppercase tracking-wider">
                        {isAr ? "الجاهزية التشغيلية (محسوبة فعلياً للموسم)" : "Operational Readiness (Authentic Season Scope)"}
                      </div>
                      {metricsLoading && <LoadingSpinner size="sm" />}
                    </div>

                    {/* Metric 1: Programs with published offerings */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-nx-ink-2">
                          {isAr ? "البرامج ذات العروض المنشورة" : "Programs with published offerings"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-nx-ink-2 font-mono">
                            {seasonMetrics.programsWithSeasonOffering} / {seasonMetrics.totalPrograms} {isAr ? "برامج" : "programs"}
                          </span>
                          <span className="text-nx-accent font-mono font-bold">
                            {seasonMetrics.programsRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nx-accent-fill transition-all duration-500"
                          style={{ width: `${seasonMetrics.programsRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric 2: Groups with assigned coaches */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-nx-ink-2">
                          {isAr ? "المجموعات المعين لها مدربون" : "Groups with assigned coaches"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-nx-ink-2 font-mono">
                            {seasonMetrics.groupsWithCoaches} / {seasonMetrics.totalSeasonGroups} {isAr ? "مجموعات" : "groups"}
                          </span>
                          <span className="text-nx-accent font-mono font-bold">
                            {seasonMetrics.groupsRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nx-accent-fill transition-all duration-500"
                          style={{ width: `${seasonMetrics.groupsRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric 3: Sessions with confirmed location */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-nx-ink-2">
                          {isAr ? "الحصص المعتمدة بمواقع محددة" : "Sessions with confirmed location"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-nx-ink-2 font-mono">
                            {seasonMetrics.sessionsWithLocation} / {seasonMetrics.totalSeasonSessions} {isAr ? "حصص" : "sessions"}
                          </span>
                          <span className="text-nx-accent font-mono font-bold">
                            {seasonMetrics.sessionsRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nx-accent-fill transition-all duration-500"
                          style={{ width: `${seasonMetrics.sessionsRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric 4: Enrollment capacity filled */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-nx-ink-2">
                          {isAr ? "نسبة الامتلاء الاستيعابي" : "Enrollment capacity filled"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-nx-ink-2 font-mono">
                            {seasonMetrics.totalSeasonEnrolled} / {seasonMetrics.totalSeasonCapacity} {isAr ? "مقعد" : "seats"}
                          </span>
                          <span className="text-nx-accent font-mono font-bold">
                            {seasonMetrics.capacityRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-nx-raised overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nx-accent-fill transition-all duration-500"
                          style={{ width: `${seasonMetrics.capacityRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Selected-Season Destination Action Cards */}
                  <div className="pt-2 space-y-2.5">
                    <div className="text-xs font-bold text-nx-ink uppercase tracking-wider">
                      {isAr ? "إجراءات الموسم المباشرة" : "Selected Season Operational Destinations"}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Offerings Destination */}
                      <button
                        onClick={() => router.push(`/academy/offerings?seasonId=${selectedSeason.id}`)}
                        className="p-3 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-accent hover:bg-nx-accent-fill/10 text-left transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between">
                          <Layers className="h-4 w-4 text-nx-accent" />
                          <ArrowRight className="h-3.5 w-3.5 text-nx-ink-2 group-hover:text-nx-accent transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-bold text-nx-ink block">
                            {isAr ? "عروض البرنامج" : "Program Offerings"}
                          </span>
                          <span className="text-[11px] text-nx-accent font-semibold">
                            {metricsLoaded ? seasonMetrics.seasonOfferings.length : "—"} {isAr ? "عروض مسجلة" : "offerings linked"}
                          </span>
                        </div>
                      </button>

                      {/* Groups Destination */}
                      <button
                        onClick={() => router.push(`/academy/groups?seasonId=${selectedSeason.id}`)}
                        className="p-3 rounded-xl border border-nx-line bg-nx-raised hover:border-warning hover:bg-warning/10 text-left transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between">
                          <Users className="h-4 w-4 text-warning" />
                          <ArrowRight className="h-3.5 w-3.5 text-nx-ink-2 group-hover:text-warning transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-bold text-nx-ink block">
                            {isAr ? "المجموعات التدريبية" : "Training Groups"}
                          </span>
                          <span className="text-[11px] text-warning font-semibold">
                            {metricsLoaded ? seasonMetrics.seasonGroups.length : "—"} {isAr ? "مجموعات مفعلة" : "active cohorts"}
                          </span>
                        </div>
                      </button>

                      {/* Enrollment Destination */}
                      <button
                        onClick={() => router.push(`/academy/enrollments?seasonId=${selectedSeason.id}`)}
                        className="p-3 rounded-xl border border-nx-line bg-nx-raised hover:border-info hover:bg-info/10 text-left transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between">
                          <CheckCircle2 className="h-4 w-4 text-info" />
                          <ArrowRight className="h-3.5 w-3.5 text-nx-ink-2 group-hover:text-info transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-bold text-nx-ink block">
                            {isAr ? "التسجيلات المقيدة" : "Season Enrollments"}
                          </span>
                          <span className="text-[11px] text-info font-semibold">
                            {metricsLoaded ? seasonMetrics.seasonActiveEnrollments.length : "—"} {isAr ? "تسجيلات نشطة" : "active records"}
                          </span>
                        </div>
                      </button>
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
                </div>
              )}

              {/* TAB 2: SETTINGS (ACTION 5) */}
              {activeTab === "settings" && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-2 border-b border-nx-line">
                    <div>
                      <h4 className="text-sm font-bold text-nx-ink flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4 text-nx-accent" />
                        <span>{isAr ? "إعدادات وتعديل الموسم" : "Season Configuration & Lifecycle"}</span>
                      </h4>
                      <p className="text-[11px] text-nx-ink-2 mt-0.5">
                        {isAr
                          ? "تعديل بيانات الموسم، التواريخ المعتمدة، وحالة الدورة التشغيلية."
                          : "Modify term dates, localized names, and operational lifecycle state."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTabChange("overview")}
                      className="text-xs text-nx-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isAr ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />}
                      <span>{isAr ? "العودة للنظرة العامة" : "Back to Overview"}</span>
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-3 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent text-xs flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {state.errorMessage && (
                    <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/15 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{state.errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-nx-ink-2 mb-1 font-semibold">
                          {isAr ? "اسم الموسم (EN)" : "Season Name (EN)"}
                        </label>
                        <input
                          type="text"
                          required
                          value={editNameEn}
                          onChange={(e) => setEditNameEn(e.target.value)}
                          disabled={!canUpdate || state.submitting}
                          className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-nx-ink-2 mb-1 font-semibold">
                          {isAr ? "اسم الموسم (AR)" : "Season Name (AR)"}
                        </label>
                        <input
                          type="text"
                          required
                          value={editNameAr}
                          onChange={(e) => setEditNameAr(e.target.value)}
                          disabled={!canUpdate || state.submitting}
                          className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-nx-ink-2 mb-1 font-semibold">
                          {isAr ? "تاريخ البدء" : "Start Date"}
                        </label>
                        <input
                          type="date"
                          required
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          disabled={!canUpdate || state.submitting}
                          className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-nx-ink-2 mb-1 font-semibold">
                          {isAr ? "تاريخ الانتهاء" : "End Date"}
                        </label>
                        <input
                          type="date"
                          required
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          disabled={!canUpdate || state.submitting}
                          className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-nx-ink-2 mb-1 font-semibold">
                        {isAr ? "حالة دورة الموسم" : "Season Lifecycle Status"}
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as SeasonStatus)}
                        disabled={!canUpdate || state.submitting}
                        className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent disabled:opacity-60"
                      >
                        <option value="Draft">{isAr ? "مسودة / قادم (Draft)" : "Draft / Upcoming"}</option>
                        <option value="Active">{isAr ? "نشط (Active)" : "Active"}</option>
                        <option value="Closed">{isAr ? "مغلق (Closed)" : "Closed"}</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl border border-nx-line bg-nx-raised/60 text-[11px] text-nx-ink-2 space-y-1">
                      <span className="font-semibold text-nx-ink block">
                        {isAr ? "معلومات النطاق والربط:" : "Scope & Relationship Summary:"}
                      </span>
                      <p>
                        {metricsLoaded
                          ? isAr
                            ? `رمز الموسم: ${getSeasonCode(selectedSeason)} • العروض المرتبطة: ${seasonMetrics.seasonOfferings.length} • المجموعات: ${seasonMetrics.seasonGroups.length}`
                            : `Season Code: ${getSeasonCode(selectedSeason)} • Linked Offerings: ${seasonMetrics.seasonOfferings.length} • Groups: ${seasonMetrics.seasonGroups.length}`
                          : isAr
                            ? `رمز الموسم: ${getSeasonCode(selectedSeason)} • مؤشرات التشغيل غير متاحة`
                            : `Season Code: ${getSeasonCode(selectedSeason)} • Operational metrics unavailable`}
                      </p>
                    </div>

                    {canUpdate && (
                      <div className="flex justify-end gap-2.5 pt-3 border-t border-nx-line">
                        <button
                          type="button"
                          onClick={() => handleTabChange("overview")}
                          className="px-4 py-2 rounded-xl border border-nx-line text-nx-ink-2 hover:text-nx-ink cursor-pointer"
                        >
                          {isAr ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          disabled={state.submitting || !editNameEn.trim() || !editNameAr.trim()}
                          className="px-4 py-2 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,255,5,0.2)]"
                        >
                          {state.submitting
                            ? isAr
                              ? "جاري الحفظ..."
                              : "Saving..."
                            : isAr
                            ? "حفظ التغييرات"
                            : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
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

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">
                  {isAr ? "اسم الموسم (EN)" : "Season Name (EN)"}
                </label>
                <input
                  type="text"
                  required
                  value={createNameEn}
                  onChange={(e) => setCreateNameEn(e.target.value)}
                  placeholder="e.g. 2026/2027 Main Season"
                  className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                />
              </div>

              <div>
                <label className="block text-nx-ink-2 mb-1 font-semibold">
                  {isAr ? "اسم الموسم (AR)" : "Season Name (AR)"}
                </label>
                <input
                  type="text"
                  required
                  value={createNameAr}
                  onChange={(e) => setCreateNameAr(e.target.value)}
                  placeholder="مثال: الموسم الرئيسي 2026 / 2027"
                  className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">
                    {isAr ? "تاريخ البدء" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                  />
                </div>
                <div>
                  <label className="block text-nx-ink-2 mb-1 font-semibold">
                    {isAr ? "تاريخ الانتهاء" : "End Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={createEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-nx-line bg-nx-raised px-3 text-xs text-white outline-none focus:border-nx-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-nx-line">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="px-4 py-2 rounded-xl border border-nx-line text-nx-ink-2 hover:text-nx-ink cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={state.submitting || !createNameEn.trim() || !createNameAr.trim()}
                  className="px-4 py-2 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,255,5,0.25)]"
                >
                  {state.submitting
                    ? isAr
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : isAr
                    ? "إنشاء الموسم"
                    : "Create Season"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
