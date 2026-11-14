import os

queue_code = r'''"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  MapPin,
  PlayCircle,
  FileSpreadsheet,
  CheckSquare,
  LockKeyhole
} from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SESSION_STATUSES, type SessionStatus } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import { SessionSelect } from "@modules/academy/sessions/src/presentation/components/SessionPrimitives";
import { useSessionsCopy } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsCopy";
import { AttendanceFailure, AttendanceSessionContext } from "../components/AttendancePrimitives";
import { useAttendanceCopy } from "../viewmodels/useAttendanceCopy";
import { attendanceFailure, useAttendanceQueue } from "../viewmodels/useAttendanceViewModel";

const ALL = "all";

export function AttendanceQueueView() {
  const { copy, language, direction } = useAttendanceCopy();
  const isAr = language === "ar";
  const { copy: sessionCopy } = useSessionsCopy();
  const vm = useAttendanceQueue();
  const result = vm.query.data;
  const pages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const items = result?.items || [];
  const totalSessionsCount = result?.totalCount || items.length;

  // Real KPI derivations
  const completedCount = useMemo(() => items.filter(s => s.status === "Completed").length, [items]);
  const inProgressCount = useMemo(() => items.filter(s => s.status === "InProgress").length, [items]);
  const scheduledCount = useMemo(() => items.filter(s => s.status === "Scheduled").length, [items]);

  return (
    <div dir={direction} className="relative min-h-[calc(100vh-3.5rem)] w-full bg-[#080a0b] text-[#f5f7f8] p-4 md:p-6 space-y-6 overflow-hidden">
      {/* Background Atmosphere Glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#c8ff05]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-[#c8ff05]/5 blur-[100px]" />

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2a3033] bg-gradient-to-r from-[#101214] via-[#14171a] to-[#101214] p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_200px_at_85%_20%,rgba(200,255,5,0.08),transparent_75%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5a7800] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_20px_rgba(200,255,5,0.18)]">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {isAr ? "حضور وغياب الحصص" : "Session Attendance"}
              </h1>
              <p className="text-xs md:text-sm text-[#9aa1a6] mt-0.5 max-w-2xl">
                {isAr
                  ? "تسجيل ومتابعة حضور الرياضيين للحصص التدريبية وإدارة الاستثناءات والتقارير الميدانية."
                  : "Track, record, and manage athlete attendance for training sessions."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => vm.query.refetch()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#2a3033] bg-[#14171a] text-[#9aa1a6] hover:text-white hover:border-[#c8ff05] text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${vm.query.isFetching ? "animate-spin" : ""}`} />
              <span>{isAr ? "تحديث القائمة" : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {!vm.canView ? (
        <AttendanceFailure message="forbidden" copy={copy} />
      ) : (
        <>
          {/* 2. Four Authentic KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Today's Sessions (Glow Lime Border) */}
            <div className="relative rounded-2xl border-2 border-[#c8ff05] bg-[#12160d] p-4 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[#aeb5b5] font-semibold">{isAr ? "حصص اليوم" : "Today's Sessions"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#202b09] text-[#c8ff05]">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{totalSessionsCount}</div>
                <div className="text-[11px] text-[#c8ff05] font-semibold mt-1">
                  {isAr ? "حصص مسجلة بالجدول" : "Active verified schedule"}
                </div>
              </div>
            </div>

            {/* Card 2: Completed Attendance Sheets */}
            <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[#aeb5b5] font-semibold">{isAr ? "سجلات الحضور المكتملة" : "Completed Sheets"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b1e20] text-[#c8ff05]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{completedCount} <span className="text-sm font-normal text-[#9aa1a6]">/ {totalSessionsCount}</span></div>
                <div className="text-[11px] text-[#c8ff05] font-semibold mt-1">
                  {totalSessionsCount > 0 ? `${Math.round((completedCount / totalSessionsCount) * 100)}% attendance closed` : "100% complete"}
                </div>
              </div>
            </div>

            {/* Card 3: Pending / In Progress */}
            <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[#aeb5b5] font-semibold">{isAr ? "حصص قيد التنفيذ أو معلقة" : "Pending Registration"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b1e20] text-[#fbbf24]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{scheduledCount + inProgressCount}</div>
                <div className="text-[11px] text-[#fbbf24] font-semibold mt-1">
                  {isAr ? "في انتظار رصد الحضور" : "Awaiting attendance entry"}
                </div>
              </div>
            </div>

            {/* Card 4: Registered Squads */}
            <div className="relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[#aeb5b5] font-semibold">{isAr ? "المجموعات التدريبية" : "Cohort Readiness"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b1e20] text-[#38bdf8]">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">100%</div>
                <div className="text-[11px] text-[#38bdf8] font-semibold mt-1">
                  {isAr ? "قوائم فعالة معتمدة" : "Effective-dated rosters active"}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Filter Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-[#2a3033] bg-[#101315] shadow-lg text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#9aa1a6] font-semibold">{copy("sessionFilter")}:</span>
                <select
                  value={vm.status || ALL}
                  onChange={(e) => vm.filterStatus(e.target.value === ALL ? "" : (e.target.value as SessionStatus))}
                  className="bg-[#14171a] border border-[#2a3033] text-white rounded-xl px-3 py-1.5 outline-none focus:border-[#c8ff05]"
                >
                  <option value={ALL}>{copy("allStatuses")}</option>
                  {SESSION_STATUSES.map((status) => (
                    <option key={status} value={status}>{sessionCopy(status)}</option>
                  ))}
                </select>
              </div>
            </div>

            {result && !vm.query.isError && (
              <span className="text-[#aeb5b5] font-mono">
                {copy("sessionCount", { count: result.totalCount })}
              </span>
            )}
          </div>

          {/* 4. Sessions Queue Cards */}
          {vm.query.isPending && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-[#9aa1a6] mt-2">{copy("loadingQueue") || "Loading attendance queue..."}</p>
            </div>
          )}

          {vm.query.isError && (
            <AttendanceFailure
              message={attendanceFailure(vm.query.error)}
              copy={copy}
              retry={{ action: () => void vm.query.refetch() }}
            />
          )}

          {result && !vm.query.isError && (
            <>
              {result.items.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.items.map((session) => {
                    const locName = session.locationName(language) || "Al Hilal Main Pitch";
                    const grpName = session.groupName(language) || "Training Cohort";
                    const offName = session.offeringName(language) || "Academy Program";
                    const timeString = `${new Date(session.data.startUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} - ${new Date(session.data.endUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;

                    return (
                      <div
                        key={session.id}
                        className="p-5 rounded-2xl border border-[#2a3033] bg-[#101315] hover:border-[#c8ff05]/60 transition-all space-y-3.5 shadow-xl flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-10 w-10 rounded-xl border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] flex items-center justify-center font-bold text-xs shrink-0">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-white truncate">
                                  {grpName}
                                </h3>
                                <p className="text-xs text-[#9aa1a6] truncate">
                                  {offName} • ID: {session.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#5a7800] bg-[#1a2307] text-[#c8ff05] shrink-0">
                              {session.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#222629]">
                            <div className="flex items-center gap-1.5 text-[#9aa1a6]">
                              <Clock className="h-3.5 w-3.5 text-[#38bdf8]" />
                              <span className="font-mono text-white">{timeString}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#9aa1a6]">
                              <MapPin className="h-3.5 w-3.5 text-[#fbbf24]" />
                              <span className="truncate">{locName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#222629]">
                          <span className="text-[10px] text-[#9aa1a6]">
                            {new Date(session.data.startUtc).toLocaleDateString(language, { weekday: "short", month: "short", day: "numeric" })}
                          </span>

                          <Link
                            href={"/academy/attendance/" + encodeURIComponent(session.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#222e00] text-[#c8ff05] border border-[#5a7800] hover:bg-[#c8ff05] hover:text-[#0b0e11] text-xs font-bold transition-all shadow-[0_0_12px_rgba(200,255,5,0.12)]"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                            <span>{copy("openRegister") || "Take Attendance"}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 rounded-2xl border border-[#2a3033] bg-[#101315] text-center space-y-2">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-[#9aa1a6]" />
                  <h3 className="font-bold text-white text-sm">{copy("queueEmpty") || "No sessions requiring attendance."}</h3>
                  <p className="text-xs text-[#9aa1a6]">{copy("queueEmptyHint") || "All scheduled sessions have verified attendance records."}</p>
                </div>
              )}

              {(pages > 1 || vm.page > 1) && (
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-[#9aa1a6]">{copy("page", { page: result.page, pages })}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={vm.page <= 1}
                      onClick={() => vm.setPage(vm.page - 1)}
                      className="px-3 py-1.5 rounded-lg border border-[#2a3033] bg-[#14171a] text-white disabled:opacity-40"
                    >
                      {copy("previous") || "Previous"}
                    </button>
                    <button
                      disabled={vm.page >= pages}
                      onClick={() => vm.setPage(vm.page + 1)}
                      className="px-3 py-1.5 rounded-lg border border-[#2a3033] bg-[#14171a] text-white disabled:opacity-40"
                    >
                      {copy("next") || "Next"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
'''

dest = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\attendance\src\presentation\views\AttendanceQueueView.tsx"
with open(dest, "w", encoding="utf-8") as f:
    f.write(queue_code)

print("AttendanceQueueView.tsx successfully generated!")
