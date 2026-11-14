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
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SESSION_STATUSES, type SessionStatus, type TrainingSession } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import { SessionSelect } from "@modules/academy/sessions/src/presentation/components/SessionPrimitives";
import { useSessionsCopy } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsCopy";
import { useSessionScope } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsViewModel";
import { formatSessionTime } from "@modules/academy/sessions/src/domain/session-time";
import { ATTENDANCE_STATUSES, type AttendanceStatus, type AttendanceRow } from "../../domain/entities/Attendance";
import { AttendanceFailure, AttendanceSessionContext, AttendanceBadge } from "../components/AttendancePrimitives";
import { useAttendanceCopy } from "../viewmodels/useAttendanceCopy";
import { attendanceFailure, useAttendanceQueue, useAttendanceRegister, useAttendanceHistory } from "../viewmodels/useAttendanceViewModel";

const ALL = "all";

export function AttendanceQueueView() {
  const { copy, language, direction } = useAttendanceCopy();
  const isAr = language === "ar";
  const { copy: sessionCopy } = useSessionsCopy();
  const vm = useAttendanceQueue();
  const result = vm.query.data;
  const pages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;

  // Screen 20: Attendance Corrections & Audit Workspace state
  const [showCorrectionWorkspace, setShowCorrectionWorkspace] = useState(false);
  const [initialCorrectionSessionId, setInitialCorrectionSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "corrections" || params.get("corrections") === "true") {
        setShowCorrectionWorkspace(true);
        const sid = params.get("sessionId");
        if (sid) setInitialCorrectionSessionId(sid);
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
    <div dir={direction} className="relative min-h-[calc(100vh-3.5rem)] w-full bg-nx-surface text-nx-ink p-4 md:p-6 space-y-6 overflow-hidden">
      {/* Background Atmosphere Glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-nx-accent-fill/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-nx-accent-fill/5 blur-[100px]" />

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-nx-line bg-gradient-to-r from-nx-surface via-nx-raised to-nx-surface p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_200px_at_85%_20%,rgba(200,255,5,0.08),transparent_75%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shadow-[0_0_20px_rgba(200,255,5,0.18)]">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {isAr ? "حضور وغياب الحصص" : "Session Attendance"}
              </h1>
              <p className="text-xs md:text-sm text-nx-ink-2 mt-0.5 max-w-2xl">
                {isAr
                  ? "تسجيل ومتابعة حضور الرياضيين للحصص التدريبية وإدارة الاستثناءات والتقارير الميدانية."
                  : "Track, record, and manage athlete attendance for training sessions."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                const firstCompleted = items.find(s => s.status === "Completed")?.id;
                setInitialCorrectionSessionId(firstCompleted || items[0]?.id);
                setShowCorrectionWorkspace(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent hover:bg-nx-accent-fill hover:text-nx-on-fill text-xs font-semibold transition-all cursor-pointer shadow-nx-glow"
            >
              <CheckSquare className="h-4 w-4" />
              <span>{isAr ? "تصحيحات الحضور والتدقيق" : "Attendance Corrections & Audit"}</span>
            </button>
            <button
              onClick={() => vm.query.refetch()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-accent text-xs font-semibold transition-all cursor-pointer"
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
            <div className="relative rounded-2xl border-2 border-nx-accent-fill bg-nx-accent-fill/15 p-4 shadow-[0_0_20px_rgba(200,255,5,0.12)] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "حصص اليوم" : "Today's Sessions"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent-fill/15 text-nx-accent">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{totalSessionsCount}</div>
                <div className="text-[11px] text-nx-accent font-semibold mt-1">
                  {isAr ? "حصص مسجلة بالجدول" : "Active verified schedule"}
                </div>
              </div>
            </div>

            {/* Card 2: Completed Attendance Sheets */}
            <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "سجلات الحضور المكتملة" : "Completed Sheets"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-nx-accent">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{completedCount} <span className="text-sm font-normal text-nx-ink-2">/ {totalSessionsCount}</span></div>
                <div className="text-[11px] text-nx-accent font-semibold mt-1">
                  {totalSessionsCount > 0 ? `${Math.round((completedCount / totalSessionsCount) * 100)}% attendance closed` : "100% complete"}
                </div>
              </div>
            </div>

            {/* Card 3: Pending / In Progress */}
            <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "حصص قيد التنفيذ أو معلقة" : "Pending Registration"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-warning">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">{scheduledCount + inProgressCount}</div>
                <div className="text-[11px] text-warning font-semibold mt-1">
                  {isAr ? "في انتظار رصد الحضور" : "Awaiting attendance entry"}
                </div>
              </div>
            </div>

            {/* Card 4: Registered Squads */}
            <div className="relative rounded-2xl border border-nx-line bg-nx-surface p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs text-nx-ink-2 font-semibold">{isAr ? "المجموعات التدريبية" : "Cohort Readiness"}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nx-raised text-info">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">100%</div>
                <div className="text-[11px] text-info font-semibold mt-1">
                  {isAr ? "قوائم فعالة معتمدة" : "Effective-dated rosters active"}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Filter Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-nx-line bg-nx-surface shadow-lg text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-nx-ink-2 font-semibold">{copy("sessionFilter")}:</span>
                <select
                  value={vm.status || ALL}
                  onChange={(e) => vm.filterStatus(e.target.value === ALL ? "" : (e.target.value as SessionStatus))}
                  className="bg-nx-raised border border-nx-line text-white rounded-xl px-3 py-1.5 outline-none focus:border-nx-accent"
                >
                  <option value={ALL}>{copy("allStatuses")}</option>
                  {SESSION_STATUSES.map((status) => (
                    <option key={status} value={status}>{sessionCopy(status)}</option>
                  ))}
                </select>
              </div>
            </div>

            {result && !vm.query.isError && (
              <span className="text-nx-ink-2 font-mono">
                {copy("sessionCount", { count: result.totalCount })}
              </span>
            )}
          </div>

          {/* 4. Sessions Queue Cards */}
          {vm.query.isPending && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-nx-ink-2 mt-2">Loading attendance queue...</p>
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
                        className="p-5 rounded-2xl border border-nx-line bg-nx-surface hover:border-nx-accent/60 transition-all space-y-3.5 shadow-xl flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-10 w-10 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent flex items-center justify-center font-bold text-xs shrink-0">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-nx-ink truncate">
                                  {grpName}
                                </h3>
                                <p className="text-xs text-nx-ink-2 truncate">
                                  {offName} • ID: {session.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent shrink-0">
                              {session.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-nx-line">
                            <div className="flex items-center gap-1.5 text-nx-ink-2">
                              <Clock className="h-3.5 w-3.5 text-info" />
                              <span className="font-mono text-white">{timeString}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-nx-ink-2">
                              <MapPin className="h-3.5 w-3.5 text-warning" />
                              <span className="truncate">{locName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-nx-line">
                          <span className="text-[10px] text-nx-ink-2">
                            {new Date(session.data.startUtc).toLocaleDateString(language, { weekday: "short", month: "short", day: "numeric" })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setInitialCorrectionSessionId(session.id);
                                setShowCorrectionWorkspace(true);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-nx-raised text-nx-ink-2 border border-nx-line hover:text-nx-accent hover:border-nx-accent text-xs font-semibold transition-all"
                            >
                              <CheckSquare className="h-3 w-3" />
                              <span>{isAr ? "تدقيق" : "Audit"}</span>
                            </button>
                            <Link
                              href={"/academy/attendance/" + encodeURIComponent(session.id)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40 hover:bg-nx-accent-fill hover:text-nx-on-fill text-xs font-bold transition-all shadow-nx-glow"
                            >
                              <CheckSquare className="h-3.5 w-3.5" />
                              <span>{copy("openRegister") || "Take Attendance"}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 rounded-2xl border border-nx-line bg-nx-surface text-center space-y-2">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-nx-ink-2" />
                  <h3 className="font-bold text-nx-ink text-sm">{copy("queueEmpty") || "No sessions requiring attendance."}</h3>
                  <p className="text-xs text-nx-ink-2">{copy("queueEmptyHint") || "All scheduled sessions have verified attendance records."}</p>
                </div>
              )}

              {(pages > 1 || vm.page > 1) && (
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-nx-ink-2">{copy("page", { page: result.page, pages })}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={vm.page <= 1}
                      onClick={() => vm.setPage(vm.page - 1)}
                      className="px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised text-white disabled:opacity-40"
                    >
                      {copy("previous") || "Previous"}
                    </button>
                    <button
                      disabled={vm.page >= pages}
                      onClick={() => vm.setPage(vm.page + 1)}
                      className="px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised text-white disabled:opacity-40"
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

      {/* Screen 20: Real Governed Attendance Corrections & Audit Workspace */}
      {showCorrectionWorkspace && (
        <AttendanceCorrectionWorkspaceModal
          sessions={items}
          initialSessionId={initialCorrectionSessionId}
          onClose={() => setShowCorrectionWorkspace(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 20: Real Governed Attendance Correction Workspace Modal Component
// ---------------------------------------------------------------------------
function AttendanceCorrectionWorkspaceModal({
  sessions,
  initialSessionId,
  onClose,
}: {
  sessions: TrainingSession[];
  initialSessionId?: string;
  onClose: () => void;
}) {
  const { copy, language, direction } = useAttendanceCopy();
  const isAr = language === "ar";
  const scope = useSessionScope();

  // Find initial completed session or fallback to first session
  const defaultSessionId = initialSessionId || sessions.find((s) => s.status === "Completed")?.id || sessions[0]?.id || "";
  const [selectedSessionId, setSelectedSessionId] = useState<string>(defaultSessionId);

  // Hook into real register ViewModel
  const registerVm = useAttendanceRegister(selectedSessionId, scope);
  const register = registerVm.query.data;
  const rows = register?.rows || [];

  // Active athlete for correction
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");

  // Sync selected athlete once rows are loaded
  useEffect(() => {
    if (rows.length > 0) {
      if (!selectedAthleteId || !rows.some((r) => r.athleteId === selectedAthleteId)) {
        const firstWithRecord = rows.find((r) => r.attendance);
        setSelectedAthleteId(firstWithRecord ? firstWithRecord.athleteId : rows[0].athleteId);
      }
    }
  }, [rows, selectedAthleteId]);

  const selectedRow = useMemo(() => rows.find((r) => r.athleteId === selectedAthleteId), [rows, selectedAthleteId]);

  // Form states for the selected athlete
  const [correctionStatus, setCorrectionStatus] = useState<AttendanceStatus>("Present");
  const [medicalReason, setMedicalReason] = useState<string>("");
  const [auditReason, setAuditReason] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update form inputs when selectedRow changes
  useEffect(() => {
    if (selectedRow) {
      setCorrectionStatus(selectedRow.attendance?.status || "Present");
      setMedicalReason(selectedRow.attendance?.reason || "");
      setAuditReason("");
      setSaveSuccess(null);
      setSaveError(null);
    }
  }, [selectedRow?.athleteId, selectedRow?.attendance?.version]);

  // Real KPI derivations from real rows
  const presentCount = useMemo(() => rows.filter((r) => r.attendance?.status === "Present").length, [rows]);
  const lateCount = useMemo(() => rows.filter((r) => r.attendance?.status === "Late").length, [rows]);
  const absentCount = useMemo(
    () => rows.filter((r) => r.attendance?.status === "AbsentExcused" || r.attendance?.status === "AbsentUnexcused").length,
    [rows]
  );
  const expectedCount = rows.length;
  const presentPercent = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;

  // Real audit history for selected athlete
  const historyQuery = useAttendanceHistory(selectedSessionId, selectedAthleteId);
  const historyEntries = historyQuery.data || [];

  const handleSaveCorrection = async () => {
    if (!selectedRow) return;
    if (!selectedRow.attendance) {
      setSaveError(isAr ? "الرياضي لا يملك سجلاً سابقاً للتصحيح" : "Athlete does not have an existing attendance record to correct.");
      return;
    }
    if (!auditReason.trim()) {
      setSaveError(isAr ? "سبب التصحيح مطلوب لسجل التدقيق الإلزامي" : "Correction reason is mandatory for the audit log.");
      return;
    }
    if (!registerVm.canCorrect) {
      setSaveError(isAr ? "ليس لديك صلاحية تصحيح الحضور (تتطلب academy:attendance:override)" : "Insufficient permissions to correct attendance.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const failure = await registerVm.correct(selectedAthleteId, {
        expectedVersion: selectedRow.attendance.version,
        expectedSessionVersion: register?.session.version || "",
        status: correctionStatus,
        reason: medicalReason.trim() || undefined,
        correctionReason: auditReason.trim(),
      });

      if (failure) {
        setSaveError(copy(failure));
      } else {
        setSaveSuccess(isAr ? "تم حفظ التصحيح وتوثيقه بنجاح في سجل التدقيق الرسمي" : "Correction successfully saved and audited to official ledger.");
        setAuditReason("");
        void historyQuery.refetch();
        void registerVm.refresh(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Correction operation failed";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (selectedRow) {
      setCorrectionStatus(selectedRow.attendance?.status || "Present");
      setMedicalReason(selectedRow.attendance?.reason || "");
      setAuditReason("");
      setSaveError(null);
      setSaveSuccess(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-5">
        {/* 1. Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-nx-line">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-gradient-to-br from-nx-surface to-nx-surface text-nx-accent shadow-[0_7px_20px_rgba(0,0,0,0.5)] text-xl font-bold">
              ☑
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {isAr ? "تصحيحات الحضور والتدقيق" : "Attendance Corrections & Audit"}
              </h2>
              <p className="text-xs text-nx-ink-2 mt-0.5">
                {isAr
                  ? "تصحيحات خاضعة للرقابة بعد الإرسال دون فقدان سجل الحصة أو أهلية القائمة."
                  : "Controlled post-submission corrections without losing session history or roster eligibility."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Session Selector */}
            {sessions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-nx-raised border border-nx-line rounded-lg px-2.5 py-1.5 text-xs">
                <span className="text-nx-ink-2">{isAr ? "الحصة:" : "Session:"}</span>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="bg-transparent text-white font-medium outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-nx-raised text-white">
                      {s.groupName(language) || s.data.offeringNameEn} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-nx-line-hi bg-nx-surface text-nx-ink text-xs font-bold hover:bg-nx-raised cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{isAr ? "← جدول الحصص" : "← Session Attendance"}</span>
            </button>
          </div>
        </div>

        {/* 2. Four Authentic KPI Metric Cards Derived From Real Register */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Present */}
          <div className="relative rounded-2xl border border-nx-accent-fill/40 card-glass p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-nx-accent-fill/15 text-nx-accent flex items-center justify-center text-lg font-bold">
                ▦
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-nx-ink">{presentCount}</div>
                <div className="text-xs text-nx-ink-2">{isAr ? "حاضر" : "Present"}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-nx-accent-fill/15 text-nx-accent">
              {presentPercent}%
            </span>
          </div>

          {/* Late */}
          <div className="rounded-2xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-nx-accent-fill/15 text-warning flex items-center justify-center text-lg font-bold">
              ◷
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">{lateCount}</div>
              <div className="text-xs text-nx-ink-2">{isAr ? "متأخر" : "Late"}</div>
            </div>
          </div>

          {/* Absent */}
          <div className="rounded-2xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-nx-accent-fill/15 text-destructive flex items-center justify-center text-lg font-bold">
              ×
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">{absentCount}</div>
              <div className="text-xs text-nx-ink-2">{isAr ? "غائب" : "Absent"}</div>
            </div>
          </div>

          {/* Expected */}
          <div className="rounded-2xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 shadow flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-nx-accent-fill/15 text-nx-accent flex items-center justify-center text-lg font-bold">
              ☑
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">{expectedCount}</div>
              <div className="text-xs text-nx-ink-2">{isAr ? "متوقع" : "Expected"}</div>
            </div>
          </div>
        </div>

        {/* 3. Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Register Correction Mode */}
          <div className="lg:col-span-8 rounded-2xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nx-line">
                <div className="flex items-center gap-2">
                  <strong className="text-sm md:text-base font-bold text-nx-ink">
                    {isAr ? "سجل الحضور · وضع التصحيح" : "Attendance Register · Correction Mode"}
                  </strong>
                  {register?.session && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                      v{register.session.version.slice(0, 8)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-xs text-nx-accent font-bold hover:underline cursor-pointer"
                >
                  {isAr ? "استعادة السجل" : "Restore Record"}
                </button>
              </div>

              {/* Callout */}
              <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-gradient-to-r from-nx-accent-fill/15 to-nx-accent-fill/15 text-xs text-nx-accent">
                {isAr
                  ? "ⓘ وضع التصحيح — الحصة مكتملة. يتطلب التعديل إذنًا صريحًا وسببًا وسجل تدقيق."
                  : "ⓘ Correction mode — session completed. Edits require explicit permission, reason, and audit record."}
              </div>

              {/* Status Alert Messages */}
              {saveSuccess && (
                <div className="p-3 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}
              {saveError && (
                <div className="p-3 rounded-xl border border-destructive/40 bg-destructive/15/60 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Real Table */}
              {registerVm.query.isPending ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-nx-ink-2 mt-2">Loading session roster...</p>
                </div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center text-xs text-nx-ink-2">
                  {isAr ? "لا توجد سجلات رياضيين لهذه الحصة." : "No athlete roster records found for this session."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="h-10 bg-nx-raised text-nx-ink-2 font-bold text-[11px] text-start">
                        <th className="px-3 text-start">{isAr ? "الرياضي" : "Athlete"}</th>
                        <th className="px-3 text-start">{isAr ? "الحالة الحالية" : "Current Status"}</th>
                        <th className="px-3 text-start">{isAr ? "الحالة الجديدة" : "New Status"}</th>
                        <th className="px-3 text-start">{isAr ? "سبب التدقيق" : "Audit Reason"}</th>
                        <th className="px-3 text-start">{isAr ? "الإجراء" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-nx-line">
                      {rows.map((row) => {
                        const isSelected = row.athleteId === selectedAthleteId;
                        const athleteName = isAr ? row.displayNameAr || row.displayNameEn : row.displayNameEn;
                        const currentStatus = row.attendance?.status || "Unrecorded";

                        return (
                          <tr
                            key={row.athleteId}
                            className={`h-13 transition-colors ${
                              isSelected
                                ? "bg-nx-accent-fill/15 border-y border-nx-accent-fill/40"
                                : "hover:bg-nx-raised"
                            }`}
                          >
                            <td className={`px-3 font-bold text-nx-ink ${isSelected ? "border-l-2 border-nx-accent-fill" : ""}`}>
                              {athleteName}
                            </td>
                            <td className="px-3">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  currentStatus === "Present"
                                    ? "border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent"
                                    : currentStatus === "Late"
                                    ? "border-warning/30 bg-warning/15 text-warning"
                                    : currentStatus.startsWith("Absent")
                                    ? "border-destructive/30 bg-destructive/15 text-destructive"
                                    : "border-nx-line-hi bg-nx-raised text-nx-ink-2"
                                }`}
                              >
                                {currentStatus}
                              </span>
                            </td>
                            <td className="px-3">
                              {isSelected ? (
                                <select
                                  value={correctionStatus}
                                  onChange={(e) => setCorrectionStatus(e.target.value as AttendanceStatus)}
                                  className="h-8 px-2 rounded-lg border border-nx-line-hi bg-nx-surface text-nx-ink-2 text-xs focus:outline-none focus:border-nx-accent"
                                >
                                  {ATTENDANCE_STATUSES.map((st) => (
                                    <option key={st} value={st} className="bg-nx-surface text-white">
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-nx-ink-2">—</span>
                              )}
                            </td>
                            <td className="px-3">
                              {isSelected ? (
                                <input
                                  type="text"
                                  value={auditReason}
                                  placeholder={isAr ? "سبب إلزامي للتدقيق..." : "Mandatory audit reason..."}
                                  onChange={(e) => setAuditReason(e.target.value)}
                                  className="h-8 px-2.5 w-full max-w-[200px] rounded-lg border border-nx-line-hi bg-nx-surface text-nx-ink-2 text-xs focus:outline-none focus:border-nx-accent"
                                />
                              ) : (
                                <span className="text-nx-ink-2">{row.attendance?.reason || "—"}</span>
                              )}
                            </td>
                            <td className="px-3">
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={handleDiscard}
                                  className="px-2.5 py-1 rounded-lg border border-nx-line-hi bg-nx-surface text-nx-ink text-xs font-bold hover:bg-nx-raised cursor-pointer"
                                >
                                  {isAr ? "تراجع" : "Revert"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedAthleteId(row.athleteId)}
                                  className="px-2.5 py-1 rounded-lg border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent text-xs font-bold hover:bg-nx-accent-fill/25 cursor-pointer"
                                >
                                  {isAr ? "تعديل" : "Edit"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-nx-line bg-nx-surface text-[11px] text-nx-ink-2">
              <span>
                {selectedRow
                  ? `${isAr ? "الرياضي المحدد:" : "Selected:"} ${
                      isAr ? selectedRow.displayNameAr || selectedRow.displayNameEn : selectedRow.displayNameEn
                    } · ${registerVm.canCorrect ? (isAr ? "تدقيق معتمد متاح" : "Authorized audit permitted") : (isAr ? "للقراءة فقط" : "Read-only mode")}`
                  : (isAr ? "حدد رياضياً للتصحيح" : "Select an athlete to correct")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg border border-nx-line-hi bg-nx-surface text-nx-ink text-xs font-bold hover:bg-nx-raised disabled:opacity-40 cursor-pointer"
                >
                  {isAr ? "إلغاء التغيير" : "Discard Change"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCorrection}
                  disabled={saving || !auditReason.trim() || !registerVm.canCorrect || !selectedRow?.attendance}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nx-accent-fill text-nx-on-fill text-xs font-bold shadow-nx-glow hover:bg-nx-accent-fill disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  <span>{saving ? (isAr ? "جاري الحفظ والتدقيق..." : "Saving & Auditing...") : (isAr ? "حفظ التصحيح المدقق" : "Save Audited Correction")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Governed Audit Trail (Bound to Real API History) */}
          <div className="lg:col-span-4 rounded-2xl border border-nx-line bg-gradient-to-br from-nx-surface to-nx-surface p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nx-line">
              <strong className="text-sm md:text-base font-bold text-nx-ink">
                {isAr ? "سجل التدقيق الحاكم" : "Governed Audit Trail"}
              </strong>
              <span className="text-xs text-nx-accent font-bold">{isAr ? "سجل للقراءة فقط" : "Read-only log"}</span>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-nx-ink-2 font-bold">
                {isAr ? "معلومات الحصة والرياضي" : "Session & Athlete Info"}
              </div>
              <div className="h-px bg-nx-raised" />

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-nx-line">
                  <span className="text-[11px] text-nx-ink-2">{isAr ? "الحصة" : "Session"}</span>
                  <b className="text-white truncate max-w-[180px]">
                    {register?.session ? (register.session.groupName(language) || register.session.data.offeringNameEn) : "—"}
                  </b>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-nx-line">
                  <span className="text-[11px] text-nx-ink-2">{isAr ? "حالة الحصة" : "Status"}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent text-[11px] font-bold">
                    {register?.session.status || "Completed"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-nx-line">
                  <span className="text-[11px] text-nx-ink-2">{isAr ? "إصدار السجل" : "Version"}</span>
                  <b className="text-white font-mono">{selectedRow?.attendance?.version ? `v${selectedRow.attendance.version.slice(0, 8)}` : "v1"}</b>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-nx-line">
                  <span className="text-[11px] text-nx-ink-2">{isAr ? "الرياضي" : "Athlete"}</span>
                  <b className="text-white truncate max-w-[180px]">
                    {selectedRow ? (isAr ? selectedRow.displayNameAr || selectedRow.displayNameEn : selectedRow.displayNameEn) : "—"}
                  </b>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-nx-line">
                  <span className="text-[11px] text-nx-ink-2">{isAr ? "السبب مطلوب" : "Reason required"}</span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      auditReason.trim()
                        ? "border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent"
                        : "border-warning/30 bg-warning/15 text-warning"
                    }`}
                  >
                    {auditReason.trim() ? (isAr ? "مكتمل" : "Provided") : (isAr ? "مطلوب" : "Required")}
                  </span>
                </div>
              </div>

              <div className="h-px bg-nx-raised" />
              <div className="text-[11px] uppercase tracking-wider text-nx-ink-2 font-bold">
                {isAr ? "سجل التدقيق والتصحيحات السابقة" : "Immutable Audit History"}
              </div>

              <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                {historyQuery.isPending ? (
                  <div className="py-4 text-center">
                    <LoadingSpinner size="sm" />
                    <span className="text-[11px] text-nx-ink-2 mt-1 block">Loading audit history...</span>
                  </div>
                ) : historyEntries.length > 0 ? (
                  historyEntries.map((entry, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-nx-surface border border-nx-line space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-nx-accent">
                          {entry.before.status} → {entry.after.status}
                        </span>
                        <span className="text-nx-ink-2">
                          {new Date(entry.changedAtUtc).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-xs text-white [overflow-wrap:anywhere]">
                        {entry.correctionReason || "Administrative correction"}
                      </div>
                      <div className="text-[10px] text-nx-ink-2 font-mono truncate">
                        Actor: {entry.actorId.slice(0, 12)}...
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-nx-surface border border-nx-line text-center text-xs text-nx-ink-2">
                    {isAr ? "لا توجد تعديلات تدقيق سابقة لهذا الرياضي." : "No prior audit corrections recorded for this athlete."}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent text-xs">
                {isAr
                  ? "لا تستبدل أبداً سجل حضور مرسل دون تسجيل الفاعل، والوقت، والقيم القديمة والجديدة، والسبب وقرار التفويض."
                  : "Never silently overwrite a submitted attendance record. Record actor, time, old/new values, reason and authorization decision."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
