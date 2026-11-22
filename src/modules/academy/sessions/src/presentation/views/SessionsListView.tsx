"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  List,
  Calendar as CalendarIcon,
  CheckSquare,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight,
  XCircle,
  X
} from "lucide-react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SESSION_STATUSES, type SessionStatus, type TrainingSession } from "../../domain/entities/TrainingSession";
import { SessionFormDialog } from "../components/SessionFormDialog";
import { SessionTransitionDialog } from "../components/SessionTransitionDialog";
import { preferredName, SessionFailure, type SessionCopy } from "../components/SessionPrimitives";
import { useSessionsCopy } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey, useSessionsViewModel } from "../viewmodels/useSessionsViewModel";
import { localDateFromKey, localDateKey, sessionDateKey } from "../../domain/session-time";

const ANY = "any";

export function SessionsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams?.get("groupId") || "";
  const initialSessionId = searchParams?.get("sessionId") || null;

  const { copy, language, direction } = useSessionsCopy();
  const isAr = language === "ar";
  const vm = useSessionsViewModel(initialGroupId);
  const result = vm.query.data;

  // View state
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(() => localDateKey(new Date()));
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = result?.items || [];
  const totalSessionsCount = result?.totalCount ?? items.length;

  // Derived KPI metrics (authoritative from backend query)
  const scheduledCount = useMemo(() => items.filter(s => s.status === "Scheduled").length, [items]);
  const completedCount = useMemo(() => items.filter(s => s.status === "Completed").length, [items]);
  const inProgressCount = useMemo(() => items.filter(s => s.status === "InProgress").length, [items]);
  const cancelledCount = useMemo(() => items.filter(s => s.status === "Cancelled").length, [items]);
  const activeSessionsCount = useMemo(() => items.filter(s => s.status !== "Cancelled").length, [items]);
  const activeRate = useMemo(
    () => (items.length > 0 ? Math.round((activeSessionsCount / items.length) * 100) : null),
    [activeSessionsCount, items.length]
  );

  // Auto-select session if none selected
  useEffect(() => {
    if (!selectedSessionId && items.length > 0) {
      setSelectedSessionId(items[0].id);
    }
  }, [items, selectedSessionId]);

  // Selected session item
  const selectedSession = useMemo(() => {
    return items.find(s => s.id === selectedSessionId) || items[0] || null;
  }, [items, selectedSessionId]);

  // Day filter strip calculations (navigable week)
  const currentDaysOfWeek = useMemo(() => {
    const curr = new Date();
    curr.setDate(curr.getDate() + (weekOffset * 7));
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.getTime());
      nextDay.setDate(first + i);
      days.push({
        dayName: nextDay.toLocaleDateString(language, { weekday: "short" }),
        dayNumber: nextDay.getDate(),
        dateString: localDateKey(nextDay),
        isToday: nextDay.toDateString() === new Date().toDateString()
      });
    }
    return days;
  }, [language, weekOffset]);

  // Daily sessions strictly matching selected date, sorted by start time
  const dailySessions = useMemo(() => {
    return items
      .filter(s => {
        const sDate = sessionDateKey(s.data.startUtc, s.data.timeZoneId);
        return sDate === selectedDateFilter;
      })
      .sort((a, b) => new Date(a.data.startUtc).getTime() - new Date(b.data.startUtc).getTime());
  }, [items, selectedDateFilter]);

  // Calendar View month grid generator
  const calendarDays = useMemo(() => {
    const year = calendarMonthDate.getFullYear();
    const month = calendarMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateString: localDateKey(d),
        isCurrentMonth: false,
        dayNumber: d.getDate(),
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        dateString: localDateKey(d),
        isCurrentMonth: true,
        dayNumber: day,
      });
    }

    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      days.push({
        date: d,
        dateString: localDateKey(d),
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    return days;
  }, [calendarMonthDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        vm.query.refetch(),
        vm.groups.refetch()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatSessionTime = (startUtc: string, endUtc: string, timeZoneId: string) => {
    try {
      const s = new Date(startUtc);
      const e = new Date(endUtc);
      if (!Number.isFinite(s.valueOf()) || !Number.isFinite(e.valueOf())) throw new Error("Invalid session time");
      const formatter = new Intl.DateTimeFormat(language, {
        timeZone: timeZoneId,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${formatter.format(s)} - ${formatter.format(e)}`;
    } catch {
      return isAr ? "وقت غير صالح" : "Invalid time";
    }
  };

  const getStatusBadge = (status: SessionStatus | string) => {
    switch (status) {
      case "InProgress":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/50 bg-nx-accent-fill/15 text-success">
            <PlayCircle className="h-3 w-3" />
            {isAr ? "جارية الآن" : "In Progress"}
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-info/50 bg-info/15 text-info">
            <Calendar className="h-3 w-3" />
            {isAr ? "مجدولة" : "Scheduled"}
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent">
            <CheckCircle2 className="h-3 w-3" />
            {isAr ? "مكتملة" : "Completed"}
          </span>
        );
      case "Cancelled":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/30 bg-destructive/15 text-destructive line-through">
            <XCircle className="h-3 w-3" />
            {isAr ? "ملغاة" : "Cancelled"}
          </span>
        );
    }
  };

  return (
    <div dir={direction} className="relative min-h-[calc(100vh-3.5rem)] w-full bg-nx-surface text-nx-ink p-4 md:p-6 space-y-6 overflow-hidden font-sans">
      {/* Background Neon Glow */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-nx-accent-fill/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-nx-accent-fill/5 blur-[100px]" />

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-nx-line bg-gradient-to-r from-nx-surface via-nx-raised to-nx-surface p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_200px_at_85%_20%,rgba(200,255,5,0.08),transparent_75%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-[0_0_20px_rgba(200,255,5,0.18)]">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-nx-ink">
                {isAr ? "جدول الحصص والتدريب" : "Sessions & Training"}
              </h1>
              <p className="text-xs md:text-sm text-nx-ink-2 mt-0.5 max-w-2xl">
                {isAr
                  ? "تخطيط وإدارة ومتابعة جميع الحصص التدريبية عبر الرياضات والمجموعات والملاعب."
                  : "Plan, manage, and monitor all training sessions across sports, groups, and locations."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-nx-raised border border-nx-line rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-nx-accent-fill text-nx-on-fill shadow-nx-glow" : "text-nx-ink-2 hover:text-nx-ink"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>{isAr ? "قائمة" : "List View"}</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === "calendar" ? "bg-nx-accent-fill text-nx-on-fill font-bold shadow-nx-glow" : "text-nx-ink-2 hover:text-nx-ink"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{isAr ? "تقويم" : "Calendar View"}</span>
              </button>
            </div>

            {/* Create Session Dialog */}
            {vm.canView && vm.canCreate && (
              <SessionFormDialog onSaved={(saved) => { vm.sessionCreated(saved); setSelectedSessionId(saved.id); handleRefresh(); }} />
            )}

            <button
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent transition-all cursor-pointer"
              title={isAr ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || vm.query.isFetching ? "animate-spin text-nx-accent" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Group Scope Active Filter Banner */}
      {vm.input.group && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/10 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-nx-accent" />
            <span className="font-semibold text-nx-ink">
              {isAr ? "تصفية الحصص حسب المجموعة:" : "Filtering sessions for group:"}{" "}
              <strong className="text-nx-accent font-bold">
                {(() => {
                  const grp = (vm.groups.data || []).find(g => g.id === vm.input.group);
                  return grp ? (isAr && grp.nameAr ? grp.nameAr : grp.nameEn) : vm.input.group;
                })()}
              </strong>
            </span>
          </div>
          <button
            onClick={() => { vm.clearFilters(); }}
            className="text-xs text-nx-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            <span>{isAr ? "إلغاء التصفية" : "Clear Filter"}</span>
          </button>
        </div>
      )}

      {/* 2. Five Authentic KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Sessions */}
        <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "إجمالي الحصص" : "Total Sessions"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-nx-ink">{totalSessionsCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "إجمالي مطابق لنطاق التصفية" : "Total for the filtered scope"}
            </div>
          </div>
        </div>

        {/* Card 2: Scheduled */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "الحصص المجدولة" : "Scheduled"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-info">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-nx-ink">{scheduledCount}</div>
            <div className="text-[11px] text-info font-semibold mt-1">
              {isAr ? "في الصفحة المحملة" : "On the loaded page"}
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "جارية الآن" : "In Progress"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-success">
              <PlayCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-nx-ink">{inProgressCount}</div>
            <div className="text-[11px] text-success font-semibold mt-1">
              {isAr ? "في الصفحة المحملة" : "On the loaded page"}
            </div>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "الحصص المكتملة" : "Completed"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-nx-accent">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-nx-ink">{completedCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "في الصفحة المحملة" : "On the loaded page"}
            </div>
          </div>
        </div>

        {/* Card 5: Operational Schedule Fulfillment Rate */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "نسبة النشاط للصفحة" : "Loaded Active Rate"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-warning">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-nx-ink">{activeRate === null ? "—" : `${activeRate}%`}</div>
            <div className="text-[11px] text-warning font-semibold mt-1">
              {activeSessionsCount} {isAr ? "نشطة" : "active"} • {cancelledCount} {isAr ? "ملغاة" : "cancelled"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: List View or Calendar View */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Weekly Stepper & Daily Sessions (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-nx-line bg-nx-surface p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-nx-line">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-nx-accent" />
                <h3 className="text-xs font-bold text-nx-ink uppercase tracking-wider">
                  {isAr ? "أيام الأسبوع المحدد" : "Current Week Schedule"}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="p-1 rounded-lg border border-nx-line hover:border-nx-accent text-nx-ink-2 hover:text-nx-ink"
                  title={isAr ? "الأسبوع السابق" : "Previous Week"}
                >
                  <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => { setWeekOffset(0); setSelectedDateFilter(localDateKey(new Date())); }}
                  className="px-2 py-0.5 text-[10px] rounded-lg border border-nx-line text-nx-accent hover:border-nx-accent font-bold"
                >
                  {isAr ? "اليوم" : "Today"}
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="p-1 rounded-lg border border-nx-line hover:border-nx-accent text-nx-ink-2 hover:text-nx-ink"
                  title={isAr ? "الأسبوع التالي" : "Next Week"}
                >
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Days Strip */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {currentDaysOfWeek.map((d, idx) => {
                const isSelected = selectedDateFilter === d.dateString;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateFilter(d.dateString)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
                      isSelected
                        ? "border-nx-accent-fill bg-nx-accent-fill/15 text-nx-accent font-bold shadow-nx-glow"
                        : "border-nx-line bg-nx-raised text-nx-ink-2 hover:border-nx-line-hi hover:text-nx-ink"
                    }`}
                  >
                    <span className="text-[9px] uppercase">{d.dayName}</span>
                    <span className="text-xs font-mono font-bold mt-0.5">{d.dayNumber}</span>
                    {d.isToday && <span className="h-1 w-1 rounded-full bg-nx-accent-fill mt-1" />}
                  </button>
                );
              })}
            </div>

            {/* Day's Queue Header */}
            <div className="text-xs font-bold text-nx-accent flex items-center justify-between pt-1">
              <span>{localDateFromKey(selectedDateFilter).toLocaleDateString(language, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="text-[10px] text-nx-ink-2 font-normal">
                {dailySessions.length} {isAr ? "حصص محملة لهذا اليوم" : "loaded sessions today"}
              </span>
            </div>

            {/* Daily Sessions Queue */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {dailySessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-nx-ink-2 space-y-2">
                  <p>{isAr ? "لا توجد حصص تدريبية مجدولة لهذا اليوم." : "No training sessions scheduled for this day."}</p>
                  {vm.canCreate && (
                    <div className="pt-2">
                      <SessionFormDialog onSaved={(saved) => { vm.sessionCreated(saved); setSelectedSessionId(saved.id); handleRefresh(); }} />
                    </div>
                  )}
                </div>
              ) : (
                dailySessions.map(s => {
                  const isSelected = selectedSessionId === s.id;
                  const locName = s.locationName(language) || (isAr ? "الموقع غير محدد" : "Location not provided");
                  const grpName = s.groupName(language) || (isAr ? "المجموعة غير محددة" : "Group not provided");
                  const offName = s.offeringName(language) || (isAr ? "العرض غير محدد" : "Offering not provided");
                  const timeString = formatSessionTime(s.data.startUtc, s.data.endUtc, s.data.timeZoneId);

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? "border-nx-accent-fill bg-nx-accent-fill/15 shadow-nx-glow"
                          : "border-nx-line bg-nx-raised hover:border-nx-line-hi"
                      } ${s.status === "Cancelled" ? "opacity-75" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-nx-surface border border-nx-line text-nx-accent">
                          {timeString}
                        </span>
                        {getStatusBadge(s.status)}
                      </div>

                      <div className={`text-xs font-bold text-nx-ink truncate ${s.status === "Cancelled" ? "line-through text-nx-ink-3" : ""}`}>
                        {offName} • {grpName}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-nx-ink-2 pt-1 border-t border-nx-line/50">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-warning" />
                          {locName}
                        </span>
                        <span>{grpName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Sessions Table & Filter Toolbar (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-4 shadow-xl">
            {/* Filter Toolbar */}
            <form
              onSubmit={e => { e.preventDefault(); vm.applyFilters(); }}
              className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-nx-line text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                {vm.canSeeGroups && (
                  <select
                    value={vm.input.group || ANY}
                    onChange={e => vm.setInput({ ...vm.input, group: e.target.value === ANY ? "" : e.target.value })}
                    className="bg-nx-raised border border-nx-line text-nx-ink rounded-xl px-2.5 py-1.5 outline-none focus:border-nx-accent"
                  >
                    <option value={ANY}>{isAr ? "جميع المجموعات" : "All Groups"}</option>
                    {(vm.groups.data || []).map(g => (
                      <option key={g.id} value={g.id}>{isAr && g.nameAr ? g.nameAr : g.nameEn}</option>
                    ))}
                  </select>
                )}

                <select
                  value={vm.input.status || ANY}
                  onChange={e => vm.setInput({ ...vm.input, status: e.target.value === ANY ? "" : (e.target.value as SessionStatus) })}
                  className="bg-nx-raised border border-nx-line text-nx-ink rounded-xl px-2.5 py-1.5 outline-none focus:border-nx-accent"
                >
                  <option value={ANY}>{isAr ? "جميع الحالات" : "All Statuses"}</option>
                  {SESSION_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40 hover:bg-nx-accent-fill hover:text-nx-on-fill font-bold transition-all cursor-pointer"
                >
                  {isAr ? "تصفية" : "Filter"}
                </button>
              </div>

              <button
                type="button"
                onClick={vm.clearFilters}
                className="text-xs text-nx-ink-2 hover:text-nx-ink transition-colors cursor-pointer"
              >
                {isAr ? "إعادة ضبط" : "Clear filters"}
              </button>
            </form>

            {/* Sessions Table */}
            <div className="rounded-xl border border-nx-line overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-nx-raised text-nx-ink-2 border-b border-nx-line">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? "الحصة التدريبية" : "Session"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? "المجموعة" : "Group"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? "الموقع" : "Location"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? "الوقت والتاريخ" : "Time & Date"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? "الحالة" : "Status"}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nx-line/60">
                  {vm.query.isPending ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-nx-ink-2">
                        <LoadingSpinner size="md" />
                        <p className="mt-2">{isAr ? "جاري تحميل الحصص..." : "Loading sessions..."}</p>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-nx-ink-2">
                        {isAr ? "لا توجد حصص مطابقة للمعايير" : "No training sessions found matching criteria."}
                      </td>
                    </tr>
                  ) : (
                    items.map(s => {
                      const isSelected = selectedSessionId === s.id;
                      const locName = s.locationName(language) || (isAr ? "الموقع غير محدد" : "Location not provided");
                      const grpName = s.groupName(language) || (isAr ? "المجموعة غير محددة" : "Group not provided");
                      const offName = s.offeringName(language) || (isAr ? "العرض غير محدد" : "Offering not provided");
                      const timeString = formatSessionTime(s.data.startUtc, s.data.endUtc, s.data.timeZoneId);

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSessionId(s.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? "bg-nx-accent-fill/15" : "hover:bg-nx-raised/50"
                          } ${s.status === "Cancelled" ? "opacity-60" : ""}`}
                        >
                          {/* Session Identity */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent flex items-center justify-center font-bold text-xs shrink-0">
                                <CalendarDays className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold text-nx-ink truncate ${s.status === "Cancelled" ? "line-through" : ""}`}>
                                  {offName} • {grpName}
                                </div>
                                <div className="text-[10px] text-nx-ink-2 truncate font-mono">
                                  ID: {s.id.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Group */}
                          <td className="py-3 px-3 text-nx-ink-2">
                            <span className="px-2 py-0.5 rounded-md bg-nx-raised border border-nx-line text-[11px] text-nx-ink">
                              {grpName}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-3 text-nx-ink-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-warning" />
                              {locName}
                            </span>
                          </td>

                          {/* Time & Date */}
                          <td className="py-3 px-3 text-nx-ink-2">
                            <div className="font-mono text-nx-ink text-[11px]">
                              {timeString}
                            </div>
                            <div className="text-[10px] text-nx-ink-2">
                              {new Date(s.data.startUtc).toLocaleDateString(language, {
                                month: "short",
                                day: "numeric",
                                timeZone: s.data.timeZoneId,
                              })}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {getStatusBadge(s.status)}
                          </td>

                          {/* Action buttons */}
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/academy/attendance?sessionId=${encodeURIComponent(s.id)}`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40 hover:bg-nx-accent-fill hover:text-nx-on-fill text-[11px] font-bold transition-all"
                                title={isAr ? "تسجيل الحضور" : "Take Attendance"}
                              >
                                <CheckSquare className="h-3 w-3" />
                                <span>{isAr ? "الحضور" : "Attendance"}</span>
                              </Link>

                              <Link
                                href={`/academy/sessions/${encodeURIComponent(s.id)}`}
                                className="p-1 rounded-lg border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink transition-all"
                                title={isAr ? "التفاصيل" : "Details"}
                              >
                                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Real Functional Interactive Calendar View */
        <div className="rounded-2xl border border-nx-line bg-nx-surface p-5 space-y-4 shadow-xl">
          {/* Calendar Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nx-line">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-nx-ink">
                {calendarMonthDate.toLocaleDateString(language, { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-1 rounded-lg border border-nx-line text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent"
                  title={isAr ? "الشهر السابق" : "Previous Month"}
                >
                  <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setCalendarMonthDate(now);
                    setSelectedDateFilter(localDateKey(now));
                  }}
                  className="px-2.5 py-0.5 text-xs rounded-lg border border-nx-line text-nx-accent hover:border-nx-accent font-bold"
                >
                  {isAr ? "الشهر الحالي" : "Today"}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-1 rounded-lg border border-nx-line text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent"
                  title={isAr ? "الشهر التالي" : "Next Month"}
                >
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Quick Status Legend */}
            <div className="flex items-center gap-3 text-[11px] text-nx-ink-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-info" />
                <span>{isAr ? "مجدولة" : "Scheduled"}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span>{isAr ? "جارية" : "In Progress"}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-nx-accent" />
                <span>{isAr ? "مكتملة" : "Completed"}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>{isAr ? "ملغاة" : "Cancelled"}</span>
              </span>
            </div>
          </div>

          {/* Calendar 7-Day Grid */}
          <div className="grid grid-cols-7 border border-nx-line rounded-xl overflow-hidden bg-nx-raised/30">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <div key={idx} className="p-2 text-center text-xs font-bold text-nx-ink-2 border-b border-r border-nx-line last:border-r-0 bg-nx-raised">
                {isAr ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][idx] : dayName}
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              const cellSessions = items.filter(s => {
                const sDate = sessionDateKey(s.data.startUtc, s.data.timeZoneId);
                return sDate === cell.dateString;
              });
              const isToday = cell.date.toDateString() === new Date().toDateString();
              const isSelectedDay = selectedDateFilter === cell.dateString;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateFilter(cell.dateString)}
                  className={`min-h-[95px] p-1.5 border-b border-r border-nx-line last:border-r-0 transition-colors cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth ? "bg-nx-surface" : "bg-nx-surface/30 opacity-40"
                  } ${isSelectedDay ? "ring-2 ring-inset ring-nx-accent/50 bg-nx-accent-fill/10" : "hover:bg-nx-raised/40"}`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday ? "bg-nx-accent-fill text-black font-black" : "text-nx-ink-2"
                    }`}>
                      {cell.dayNumber}
                    </span>
                    {cellSessions.length > 0 && (
                      <span className="text-[9px] font-bold text-nx-accent">
                        {cellSessions.length}
                      </span>
                    )}
                  </div>

                  {/* Session Pills Inside Day Cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[65px]">
                    {cellSessions.slice(0, 3).map(s => {
                      const isSelected = selectedSessionId === s.id;
                      const sTime = formatSessionTime(s.data.startUtc, s.data.endUtc, s.data.timeZoneId).split(" - ")[0];
                      const grp = s.groupName(language) || (isAr ? "مجموعة غير محددة" : "Group not provided");

                      return (
                        <div
                          key={s.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionId(s.id);
                            setSelectedDateFilter(cell.dateString);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center justify-between gap-1 border transition-all ${
                            isSelected
                              ? "bg-nx-accent-fill text-black font-bold border-nx-accent"
                              : s.status === "Cancelled"
                              ? "bg-destructive/15 text-destructive border-destructive/30 line-through"
                              : s.status === "Completed"
                              ? "bg-nx-accent-fill/15 text-nx-accent border-nx-accent-fill/40"
                              : s.status === "InProgress"
                              ? "bg-success/15 text-success border-success/40"
                              : "bg-info/15 text-info border-info/30"
                          }`}
                          title={`${sTime} - ${grp} (${s.status})`}
                        >
                          <span className="truncate">{sTime} {grp}</span>
                        </div>
                      );
                    })}
                    {cellSessions.length > 3 && (
                      <span className="text-[9px] text-nx-ink-3 block text-center">
                        +{cellSessions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Sticky Bottom Action Bar with Discoverable Lifecycle Controls */}
      {selectedSession && (
        <div className="p-4 rounded-2xl border border-nx-accent-fill/40 bg-nx-surface/95 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-[0_0_25px_rgba(200,255,5,0.12)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-nx-ink">
              {isAr ? "الحصة المحددة:" : "Selected Session:"}{" "}
              <strong className="text-nx-accent font-black">
                {selectedSession.offeringName(language)} • {selectedSession.groupName(language)}
              </strong>
            </span>
            <span className="text-xs text-nx-ink-2 font-mono">
              ({formatSessionTime(selectedSession.data.startUtc, selectedSession.data.endUtc, selectedSession.data.timeZoneId)})
            </span>
            {getStatusBadge(selectedSession.status)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mark Attendance Action */}
            <Link
              href={`/academy/attendance?sessionId=${encodeURIComponent(selectedSession.id)}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill transition-all cursor-pointer"
            >
              <CheckSquare className="h-4 w-4 stroke-[3]" />
              <span>{isAr ? "تسجيل الحضور" : "Mark Attendance"}</span>
            </Link>

            {/* Discoverable Reschedule Action (SessionFormDialog) */}
            {vm.canUpdate && selectedSession.canReschedule && selectedSession.data.locationMode !== "InternalVenue" && (
              <SessionFormDialog
                session={selectedSession}
                onSaved={() => { handleRefresh(); }}
                onReload={handleRefresh}
              />
            )}

            {/* Discoverable Cancel Action (SessionTransitionDialog) */}
            {vm.canCancel && selectedSession.canCancel && (
              <SessionTransitionDialog
                session={selectedSession}
                action="cancel"
                onSaved={() => { handleRefresh(); }}
                onReload={handleRefresh}
              />
            )}

            {/* Start Session Action */}
            {vm.canUpdate && selectedSession.canStart && (
              <SessionTransitionDialog
                session={selectedSession}
                action="start"
                onSaved={() => { handleRefresh(); }}
                onReload={handleRefresh}
              />
            )}

            {/* Complete Session Action */}
            {vm.canUpdate && selectedSession.canComplete && (
              <SessionTransitionDialog
                session={selectedSession}
                action="complete"
                onSaved={() => { handleRefresh(); }}
                onReload={handleRefresh}
              />
            )}

            {/* View Details Link */}
            <Link
              href={`/academy/sessions/${encodeURIComponent(selectedSession.id)}`}
              className="px-3.5 py-2 rounded-xl border border-nx-line bg-nx-raised text-nx-ink hover:border-nx-accent text-xs font-semibold transition-all"
            >
              {isAr ? "عرض التفاصيل" : "View Details"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
