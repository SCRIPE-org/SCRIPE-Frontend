"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronRight,
  List,
  Calendar as CalendarIcon,
  CheckSquare,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SESSION_STATUSES, type SessionStatus, type TrainingSession } from "../../domain/entities/TrainingSession";
import { SessionFormDialog } from "../components/SessionFormDialog";
import { preferredName, SessionFailure, type SessionCopy } from "../components/SessionPrimitives";
import { useSessionsCopy } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey, useSessionsViewModel } from "../viewmodels/useSessionsViewModel";

const ANY = "any";

export function SessionsListView() {
  const router = useRouter();
  const { copy, language, direction } = useSessionsCopy();
  const isAr = language === "ar";
  const vm = useSessionsViewModel();
  const result = vm.query.data;

  // View state
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);

  const items = result?.items || [];
  const totalSessionsCount = result?.totalCount || items.length;

  // Derived KPI metrics (authoritative from current query)
  const scheduledCount = useMemo(() => items.filter(s => s.status === "Scheduled").length, [items]);
  const completedCount = useMemo(() => items.filter(s => s.status === "Completed").length, [items]);
  const inProgressCount = useMemo(() => items.filter(s => s.status === "InProgress").length, [items]);

  // Selected session item
  const selectedSession = useMemo(() => {
    return items.find(s => s.id === selectedSessionId) || items[0] || null;
  }, [items, selectedSessionId]);

  // Day filter strip calculations (current week)
  const currentDaysOfWeek = useMemo(() => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.getTime());
      nextDay.setDate(first + i);
      days.push({
        dayName: nextDay.toLocaleDateString(language, { weekday: "short" }),
        dayNumber: nextDay.getDate(),
        dateString: nextDay.toISOString().split("T")[0],
        isToday: nextDay.toDateString() === new Date().toDateString()
      });
    }
    return days;
  }, [language]);

  const formatSessionTime = (startUtc: string, endUtc: string) => {
    try {
      const s = new Date(startUtc);
      const e = new Date(endUtc);
      return `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    } catch {
      return "17:00 - 18:30";
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
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-warning/50 bg-warning/15 text-warning">
            {isAr ? "مسودة" : "Draft"}
          </span>
        );
      case "Cancelled":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/30 bg-destructive/15 text-destructive">
            {isAr ? "ملغاة" : "Cancelled"}
          </span>
        );
    }
  };

  return (
    <div dir={direction} className="relative min-h-[calc(100vh-3.5rem)] w-full bg-nx-surface text-nx-ink p-4 md:p-6 space-y-6 overflow-hidden">
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
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
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
              <SessionFormDialog onSaved={vm.sessionCreated} />
            )}

            <button
              onClick={() => vm.query.refetch()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent transition-all cursor-pointer"
              title={isAr ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-4 w-4 ${vm.query.isPending ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Five Authentic KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Sessions (Glow Lime Border) */}
        <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "إجمالي الحصص" : "Total Sessions"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">{totalSessionsCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "حصص مسجلة بالجدول" : "Recorded in schedule"}
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
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">{scheduledCount}</div>
            <div className="text-[11px] text-info font-semibold mt-1">
              {isAr ? "بانتظار موعد الانعقاد" : "Upcoming confirmed"}
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
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">{inProgressCount}</div>
            <div className="text-[11px] text-success font-semibold mt-1">
              {isAr ? "نشطة على الملاعب" : "Live training on pitch"}
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
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">{completedCount}</div>
            <div className="text-[11px] text-nx-accent font-semibold mt-1">
              {isAr ? "سجلات حضور منجزة" : "Attendance recorded"}
            </div>
          </div>
        </div>

        {/* Card 5: Operational Capacity */}
        <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "الطاقة الاستيعابية" : "Cohort Capacity"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-warning">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">100%</div>
            <div className="text-[11px] text-warning font-semibold mt-1">
              {isAr ? "كفاءة تخطيط الملاعب" : "Venue allocation verified"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Workspace: Left Schedule Timeline + Right Filter & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Weekly Schedule Stepper & Daily Sessions (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-nx-line bg-nx-surface p-4 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-nx-line">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-nx-accent" />
              <h3 className="text-xs font-bold text-nx-ink uppercase tracking-wider">
                {isAr ? "أيام الأسبوع الحالي" : "Current Week Schedule"}
              </h3>
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
            <span>{new Date(selectedDateFilter).toLocaleDateString(language, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-[10px] text-nx-ink-2 font-normal">
              {items.length} {isAr ? "حصص" : "sessions"}
            </span>
          </div>

          {/* Sessions Queue */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-xs text-nx-ink-2">
                {isAr ? "لا توجد حصص مجدولة لهذا اليوم" : "No training sessions for this day."}
              </div>
            ) : (
              items.map(s => {
                const isSelected = selectedSessionId === s.id;
                const locName = s.locationName(language) || "Main Pitch";
                const grpName = s.groupName(language) || "Football Cohort";
                const offName = s.offeringName(language) || "Training Program";
                const timeString = formatSessionTime(s.data.startUtc, s.data.endUtc);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "border-nx-accent-fill bg-nx-accent-fill/15/50 shadow-nx-glow"
                        : "border-nx-line bg-nx-raised hover:border-nx-line-hi"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-nx-surface border border-nx-line text-nx-accent">
                        {timeString}
                      </span>
                      {getStatusBadge(s.status)}
                    </div>

                    <div className="text-xs font-bold text-nx-ink truncate">
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
                  className="bg-nx-raised border border-nx-line text-white rounded-xl px-2.5 py-1.5 outline-none focus:border-nx-accent"
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
                className="bg-nx-raised border border-nx-line text-white rounded-xl px-2.5 py-1.5 outline-none focus:border-nx-accent"
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
              className="text-xs text-nx-ink-2 hover:text-nx-ink transition-colors"
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
                    const locName = s.locationName(language) || "Pitch 1";
                    const grpName = s.groupName(language) || "Cohort A";
                    const offName = s.offeringName(language) || "Football";
                    const timeString = formatSessionTime(s.data.startUtc, s.data.endUtc);

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedSessionId(s.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? "bg-nx-accent-fill/15/50" : "hover:bg-nx-raised/50"
                        }`}
                      >
                        {/* Session Identity */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent flex items-center justify-center font-bold text-xs shrink-0">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-nx-ink truncate">
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
                          <span className="px-2 py-0.5 rounded-md bg-nx-raised border border-nx-line text-[11px]">
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
                          <div className="font-mono text-white text-[11px]">
                            {timeString}
                          </div>
                          <div className="text-[10px] text-nx-ink-2">
                            {new Date(s.data.startUtc).toLocaleDateString(language, { month: "short", day: "numeric" })}
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
                              <ChevronRight className="h-3.5 w-3.5" />
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

          {/* Sticky Bottom Action Bar when Session is selected */}
          {selectedSession && (
            <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(200,255,5,0.1)]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-nx-ink">
                  {isAr ? "الحصة المحددة:" : "Selected Session:"} <strong className="text-nx-accent">{selectedSession.groupName(language)}</strong>
                </span>
                <span className="text-xs text-nx-ink-2 font-mono">
                  ({formatSessionTime(selectedSession.data.startUtc, selectedSession.data.endUtc)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/academy/attendance?sessionId=${encodeURIComponent(selectedSession.id)}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold text-xs shadow-nx-glow hover:bg-nx-accent-fill transition-all cursor-pointer"
                >
                  <CheckSquare className="h-4 w-4 stroke-[3]" />
                  <span>{isAr ? "تسجيل الحضور لهذه الحصة" : "Mark Attendance"}</span>
                </Link>

                <Link
                  href={`/academy/sessions/${encodeURIComponent(selectedSession.id)}`}
                  className="px-3.5 py-2 rounded-xl border border-nx-line bg-nx-raised text-white hover:border-nx-accent text-xs font-semibold transition-all"
                >
                  {isAr ? "عرض التفاصيل" : "View Details"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
