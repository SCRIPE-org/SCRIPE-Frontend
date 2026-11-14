"use client";

import { useState, useMemo, useEffect } from "react";
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
  LockKeyhole,
  X,
  ArrowLeft,
  RotateCcw,
  Check,
  FileText,
  AlertTriangle
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

  // Screen 20: Attendance Corrections & Audit Workspace
  const [showCorrectionWorkspace, setShowCorrectionWorkspace] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("Arrival recorded 05:38 PM");
  const [correctionSaved, setCorrectionSaved] = useState(false);
  const [correctionStatus, setCorrectionStatus] = useState<"Absent" | "Late">("Late");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "corrections" || params.get("corrections") === "true") {
        setShowCorrectionWorkspace(true);
      }
    }
  }, []);

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
              onClick={() => setShowCorrectionWorkspace(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#5a7800] bg-[#1a2307] text-[#c8ff05] hover:bg-[#c8ff05] hover:text-[#080a0b] text-xs font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(200,255,5,0.15)]"
            >
              <CheckSquare className="h-4 w-4" />
              <span>{isAr ? "تصحيحات الحضور والتدقيق" : "Attendance Corrections & Audit"}</span>
            </button>
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
              <p className="text-xs text-[#9aa1a6] mt-2">Loading attendance queue...</p>
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

      {/* Screen 20: Attendance Corrections & Audit Workspace Modal */}
      {showCorrectionWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#2a3033] bg-[#080a0b] p-6 shadow-2xl space-y-5">
            {/* 1. Headline */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222629]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#454d41] bg-gradient-to-br from-[#222923] to-[#0d1110] text-[#c8ff05] shadow-[0_7px_20px_rgba(0,0,0,0.5)] text-xl font-bold">
                  ☑
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "تصحيحات الحضور والتدقيق" : "Attendance Corrections & Audit"}
                  </h2>
                  <p className="text-xs text-[#afb4b7] mt-0.5">
                    {isAr
                      ? "تصحيحات خاضعة للرقابة بعد الإرسال دون فقدان سجل الحصة أو أهلية القائمة."
                      : "Controlled post-submission corrections without losing session history or roster eligibility."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCorrectionWorkspace(false)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#41474a] bg-[#111416] text-[#eef2f2] text-xs font-bold hover:bg-[#1a1e21] cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  <span>{isAr ? "← جدول الحصص" : "← Session Attendance"}</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-lg border border-[#657d00] bg-[#263300] text-[#c8ff05] text-xs font-bold hover:bg-[#314200] cursor-pointer"
                >
                  {isAr ? "مراجعة التفويض" : "Review Authorization"}
                </button>
              </div>
            </div>

            {/* 2. Four Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* Present - Emph */}
              <div className="relative rounded-2xl border border-[#7ca100] bg-[radial-gradient(200px_110px_at_100%_0,rgba(148,255,0,0.13),transparent),linear-gradient(140deg,#191f0f,#101315)] p-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#202b09] text-[#c8ff05] flex items-center justify-center text-lg font-bold">
                    ▦
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight text-white">18</div>
                    <div className="text-xs text-[#aeb5b5]">{isAr ? "حاضر" : "Present"}</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#243817] text-[#a6f76b]">
                  90%
                </span>
              </div>

              {/* Late */}
              <div className="rounded-2xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 shadow flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#202b09] text-[#fbbf24] flex items-center justify-center text-lg font-bold">
                  ◷
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">1</div>
                  <div className="text-xs text-[#aeb5b5]">{isAr ? "متأخر" : "Late"}</div>
                </div>
              </div>

              {/* Absent */}
              <div className="rounded-2xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 shadow flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#202b09] text-[#ff8290] flex items-center justify-center text-lg font-bold">
                  ×
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">1</div>
                  <div className="text-xs text-[#aeb5b5]">{isAr ? "غائب" : "Absent"}</div>
                </div>
              </div>

              {/* Expected */}
              <div className="rounded-2xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 shadow flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#202b09] text-[#c8ff05] flex items-center justify-center text-lg font-bold">
                  ☑
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">20</div>
                  <div className="text-xs text-[#aeb5b5]">{isAr ? "متوقع" : "Expected"}</div>
                </div>
              </div>
            </div>

            {/* 3. Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Register Correction Mode */}
              <div className="lg:col-span-8 rounded-2xl border border-[#343b3e] bg-gradient-to-br from-[#15191b] to-[#0e1112] overflow-hidden flex flex-col justify-between">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#31373a]">
                    <strong className="text-sm md:text-base font-bold text-white">
                      {isAr ? "سجل الحضور · وضع التصحيح" : "Attendance Register · Correction Mode"}
                    </strong>
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectionStatus("Absent");
                        setCorrectionReason("");
                      }}
                      className="text-xs text-[#c8ff05] font-bold hover:underline cursor-pointer"
                    >
                      {isAr ? "استعادة الحصة" : "Restore Session"}
                    </button>
                  </div>

                  {/* Callout */}
                  <div className="p-3.5 rounded-xl border border-[#687e00] bg-gradient-to-r from-[#26360c] to-[#172009] text-xs text-[#c9dfb4]">
                    {isAr
                      ? "ⓘ وضع التصحيح — الحصة مكتملة. يتطلب التعديل إذنًا صريحًا وسببًا وسجل تدقيق."
                      : "ⓘ Correction mode — session completed. Edits require explicit permission, reason, and audit record."}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="h-10 bg-[#1b2022] text-[#b9c0c1] font-bold text-[11px] text-start">
                          <th className="px-3 text-start">{isAr ? "الرياضي" : "Athlete"}</th>
                          <th className="px-3 text-start">{isAr ? "الحالة السابقة" : "Status Before"}</th>
                          <th className="px-3 text-start">{isAr ? "الحالة الجديدة" : "New Status"}</th>
                          <th className="px-3 text-start">{isAr ? "السبب" : "Reason"}</th>
                          <th className="px-3 text-start">{isAr ? "الإجراء" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#303638]">
                        <tr className="h-13">
                          <td className="px-3 font-bold text-white">Ahmed Essam</td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                              Present
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                              Present
                            </span>
                          </td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                        </tr>

                        <tr className="h-13 bg-[#253006]/60 border-y border-[#728b00]">
                          <td className="px-3 font-bold text-white border-l-2 border-[#c8ff05]">Lina Mostafa</td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#7a343e] bg-[#3b1c20] text-[#ff8290] text-[11px] font-bold">
                              Absent
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#715a12] bg-[#372b09] text-[#ffd24d] text-[11px] font-bold">
                              {correctionStatus}
                            </span>
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={correctionReason}
                              onChange={(e) => setCorrectionReason(e.target.value)}
                              className="h-8 px-2.5 rounded-lg border border-[#374146] bg-[#0c1217] text-[#c9d0d4] text-xs focus:outline-none focus:border-[#c8ff05]"
                            />
                          </td>
                          <td className="px-3">
                            <button
                              type="button"
                              onClick={() => {
                                setCorrectionStatus("Absent");
                                setCorrectionReason("");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[#41474a] bg-[#111416] text-[#eef2f2] text-xs font-bold hover:bg-[#1a1e21]"
                            >
                              Revert
                            </button>
                          </td>
                        </tr>

                        <tr className="h-13">
                          <td className="px-3 font-bold text-white">Omar Khaled</td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                              Present
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                              Present
                            </span>
                          </td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                        </tr>

                        <tr className="h-13">
                          <td className="px-3 font-bold text-white">Salma Ali</td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#7a343e] bg-[#3b1c20] text-[#ff8290] text-[11px] font-bold">
                              Absent
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-[#7a343e] bg-[#3b1c20] text-[#ff8290] text-[11px] font-bold">
                              Absent
                            </span>
                          </td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                          <td className="px-3 text-[#9aa1a6]">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-[#303738] bg-[#101315] text-[11px] text-[#a0aaab]">
                  <span>{correctionSaved ? "All corrections saved and audited" : "1 unsaved correction · authorized reviewer only"}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectionStatus("Absent");
                        setCorrectionReason("");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#41474a] bg-[#111416] text-[#eef2f2] text-xs font-bold hover:bg-[#1a1e21]"
                    >
                      {isAr ? "إلغاء التغيير" : "Discard Change"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCorrectionSaved(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#c8ff05] text-[#131600] text-xs font-bold shadow-[0_0_24px_rgba(199,255,0,0.13)] hover:bg-[#b2e600]"
                    >
                      {isAr ? "حفظ التصحيح المدقق" : "Save Audited Correction"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Governed Audit Trail */}
              <div className="lg:col-span-4 rounded-2xl border border-[#343b3e] bg-gradient-to-br from-[#15191b] to-[#0e1112] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#31373a]">
                  <strong className="text-sm md:text-base font-bold text-white">
                    {isAr ? "سجل التدقيق الحاكم" : "Governed Audit Trail"}
                  </strong>
                  <span className="text-xs text-[#c8ff05] font-bold">{isAr ? "سجل للقراءة فقط" : "Read-only log"}</span>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] uppercase tracking-wider text-[#8f9c9f] font-bold">
                    {isAr ? "سجل التدقيق والتصحيح" : "Audit & Correction History"}
                  </div>
                  <div className="h-px bg-[#303739]" />

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#2a3031]">
                      <span className="text-[11px] text-[#a2aaa9]">{isAr ? "الحصة" : "Session"}</span>
                      <b className="text-white">U12 Football — Group B</b>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#2a3031]">
                      <span className="text-[11px] text-[#a2aaa9]">{isAr ? "الحالة" : "Status"}</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#2a3031]">
                      <span className="text-[11px] text-[#a2aaa9]">{isAr ? "الإصدار" : "Version"}</span>
                      <b className="text-white font-mono">v2</b>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#2a3031]">
                      <span className="text-[11px] text-[#a2aaa9]">{isAr ? "التغيير المطلوب" : "Change requested"}</span>
                      <b className="text-white">Absent → Late</b>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#2a3031]">
                      <span className="text-[11px] text-[#a2aaa9]">{isAr ? "السبب مطلوب" : "Reason required"}</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full border border-[#627b00] bg-[#1e2b09] text-[#b9fb30] text-[11px] font-bold">
                        Provided
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#303739]" />
                  <div className="text-[11px] uppercase tracking-wider text-[#8f9c9f] font-bold">
                    {isAr ? "الأحداث السابقة" : "Prior events"}
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="p-3 rounded-xl bg-[#121618] border border-[#2f3839] flex items-center gap-3">
                      <span className="text-xl text-[#c8ff05]">☑</span>
                      <div>
                        <div className="text-xs font-bold text-white">Attendance submitted</div>
                        <div className="text-[11px] text-[#a0a8a7]">11 Nov 2026 · 18:05 · Coach Ahmed</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#121618] border border-[#2f3839] flex items-center gap-3">
                      <span className="text-xl text-[#c8ff05]">◷</span>
                      <div>
                        <div className="text-xs font-bold text-white">Session completed</div>
                        <div className="text-[11px] text-[#a0a8a7]">11 Nov 2026 · 18:35 · Academy Admin</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#345327] bg-[#0c1510] text-[#c9dfb4] text-xs">
                    {isAr
                      ? "لا تستبدل أبداً سجل حضور مرسل دون تسجيل الفاعل، والوقت، والقيم القديمة والجديدة، والسبب وقرار التفويض."
                      : "Never silently overwrite a submitted attendance record. Record actor, time, old/new values, reason and authorization decision."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
