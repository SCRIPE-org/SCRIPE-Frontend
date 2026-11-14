"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  ClipboardCheck,
  LockKeyhole,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Users,
  ChevronRight,
  ShieldAlert,
  Save
} from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SessionSelect } from "@modules/academy/sessions/src/presentation/components/SessionPrimitives";
import { useSessionScope } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsViewModel";
import { canMarkAttendance } from "../../domain/attendance-draft";
import { ATTENDANCE_BULK_LIMIT, ATTENDANCE_STATUSES, type AttendanceRegister, type AttendanceRow, type AttendanceStatus } from "../../domain/entities/Attendance";
import { AttendanceCorrectionDialog, AttendanceHistoryDialog } from "../components/AttendanceDialogs";
import { AttendanceBadge, AttendanceFailure, attendanceName, AttendanceReasonField, AttendanceSessionContext } from "../components/AttendancePrimitives";
import { useAttendanceCopy, type AttendanceCopy } from "../viewmodels/useAttendanceCopy";
import { attendanceFailure, useAttendanceRegister } from "../viewmodels/useAttendanceViewModel";

type RegisterViewModel = ReturnType<typeof useAttendanceRegister>;

export function AttendanceRegisterView({ sessionId }: { sessionId: string }) {
  const scope = useSessionScope();
  return <RegisterBody key={JSON.stringify([sessionId, ...scope])} sessionId={sessionId} scope={scope} />;
}

function RegisterBody({ sessionId, scope }: { sessionId: string; scope: ReturnType<typeof useSessionScope> }) {
  const { copy, direction, language } = useAttendanceCopy();
  const isAr = language === "ar";
  const vm = useAttendanceRegister(sessionId, scope);
  const register = vm.query.data;
  const readError = vm.query.isError ? attendanceFailure(vm.query.error) : null;
  const accessError = readError === "forbidden" || readError === "notFound";
  const reload = () => void vm.refresh();

  return (
    <div dir={direction} className="relative min-h-[calc(100vh-3.5rem)] w-full bg-[#080a0b] text-[#f5f7f8] p-4 md:p-6 space-y-6 overflow-hidden">
      {/* Background Atmosphere Glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#c8ff05]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-[#c8ff05]/5 blur-[100px]" />

      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/academy/attendance"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a3033] bg-[#14171a] text-xs text-[#9aa1a6] hover:text-white hover:border-[#c8ff05] transition-all"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>{copy("backToQueue") || "Back to Sessions"}</span>
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#2a3033] bg-gradient-to-r from-[#101214] via-[#14171a] to-[#101214] p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_200px_at_85%_20%,rgba(200,255,5,0.08),transparent_75%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5a7800] bg-[#1a2307] text-[#c8ff05] shadow-[0_0_20px_rgba(200,255,5,0.18)]">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {copy("registerTitle") || "Record Session Attendance"}
              </h1>
              <p className="text-xs md:text-sm text-[#9aa1a6] mt-0.5">
                {copy("eyebrow") || "Session dynamic roster, date-effective eligibility, and official attendance logging."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!vm.canView ? (
        <AttendanceFailure message="forbidden" copy={copy} />
      ) : (
        <>
          {vm.query.isPending && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-[#9aa1a6] mt-2">Loading attendance roster...</p>
            </div>
          )}

          {readError && (!register || accessError || !vm.failure) && (
            <AttendanceFailure message={readError} copy={copy} retry={{ action: reload }} disabled={vm.query.isFetching} />
          )}

          {register && !accessError && (
            <div className="space-y-5">
              {/* Session Context Banner */}
              <div className="rounded-2xl border border-[#2a3033] bg-[#101315] p-5 shadow-xl">
                <AttendanceSessionContext session={register.session} copy={copy} />
              </div>

              {!vm.canRecord && (
                <div className="p-4 rounded-xl border border-[#38bdf8]/40 bg-[#0c2331]/60 flex items-center gap-3 text-xs text-[#38bdf8]">
                  <LockKeyhole className="h-4 w-4 shrink-0" />
                  <span>{copy(register.session.status === "Cancelled" ? "cancelled" : vm.canCorrect ? "correctionsOnly" : "readOnly")}</span>
                </div>
              )}

              {vm.notice && (
                <div className="p-4 rounded-xl border border-[#5a7800] bg-[#1a2307] flex items-center gap-3 text-xs text-[#c8ff05]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{copy(vm.notice)}</span>
                </div>
              )}

              {vm.failure && (
                <AttendanceFailure
                  message={vm.failure}
                  copy={copy}
                  disabled={vm.busy || vm.query.isFetching}
                  retry={vm.canRetry ? { action: vm.retry, label: "retrySave" } : undefined}
                  reload={vm.needsReload ? reload : undefined}
                />
              )}

              <Roster register={register} vm={vm} copy={copy} language={language} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Roster({ register, vm, copy, language }: {
  register: AttendanceRegister; vm: RegisterViewModel; copy: AttendanceCopy; language: "en" | "ar";
}) {
  const isAr = language === "ar";
  const savedCount = register.rows.filter((row) => row.attendance).length;
  const multipleBatches = vm.draftCount > ATTENDANCE_BULK_LIMIT;

  return (
    <section aria-labelledby="attendance-roster-title" aria-busy={vm.busy || vm.query.isFetching} className="space-y-4">
      {/* Roster Header and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#2a3033] bg-[#101315] shadow-lg">
        <div>
          <h2 id="attendance-roster-title" className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-[#c8ff05]" />
            <span>{copy("roster") || "Active Squad Roster"}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-full border border-[#2a3033] bg-[#14171a] text-[#9aa1a6] font-mono">
              {copy("rosterCount", { count: register.rows.length })}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-[#5a7800] bg-[#1a2307] text-[#c8ff05] font-mono font-bold">
              {copy("savedCount", { count: savedCount })}
            </span>
            {vm.canRecord && vm.draftCount > 0 && (
              <span className="px-2 py-0.5 rounded-full border border-[#38bdf8]/40 bg-[#0c2331] text-[#38bdf8] font-mono font-bold">
                {copy("markedCount", { count: vm.draftCount })}
              </span>
            )}
          </div>
        </div>

        {vm.canRecord && vm.markableCount > 0 && (
          <button
            type="button"
            disabled={vm.locked || vm.draftCount === vm.markableCount}
            onClick={vm.fillPresent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#222e00] text-[#c8ff05] border border-[#5a7800] hover:bg-[#c8ff05] hover:text-[#0b0e11] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{copy("markAll") || "Mark All Present"}</span>
          </button>
        )}
      </div>

      {/* Roster List Items */}
      {register.rows.length ? (
        <ul className="space-y-2.5">
          {register.rows.map((row) => (
            <RosterRow key={row.athleteId} row={row} register={register} vm={vm} copy={copy} language={language} />
          ))}
        </ul>
      ) : (
        <div className="p-8 rounded-2xl border border-[#2a3033] bg-[#101315] text-center text-xs text-[#9aa1a6]">
          {copy("rosterEmpty") || "No athletes found in roster."}
        </div>
      )}

      {/* Sticky Save Bar */}
      {vm.canRecord && vm.markableCount > 0 && (
        <div className="p-4 rounded-2xl border border-[#c8ff05]/40 bg-[#12160d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_24px_rgba(200,255,5,0.15)]">
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold text-white">
              {copy("saveSummary", { marked: vm.draftCount, unmarked: vm.markableCount - vm.draftCount })}
            </span>
            {multipleBatches && (
              <p className="text-[11px] text-[#fbbf24]">
                {copy("batchHint", { max: ATTENDANCE_BULK_LIMIT })}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={vm.locked || !vm.draftCount}
            onClick={vm.save}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8ff05] text-[#0b0e11] font-bold text-xs shadow-[0_0_16px_rgba(200,255,5,0.25)] hover:bg-[#b0e600] transition-all cursor-pointer disabled:opacity-40"
          >
            {vm.busy ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4 stroke-[2.5]" />
            )}
            <span>
              {copy(vm.busy ? "saving" : vm.query.isFetching ? "refreshing" : multipleBatches ? "saveBatch" : "saveAttendance", { count: ATTENDANCE_BULK_LIMIT }) || "Save Official Attendance"}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

function RosterRow({ row, register, vm, copy, language }: {
  row: AttendanceRow; register: AttendanceRegister; vm: RegisterViewModel; copy: AttendanceCopy; language: "en" | "ar";
}) {
  const { athleteId, attendance } = row;
  const name = attendanceName(row, language, copy);
  const mark = vm.draft[athleteId];

  return (
    <li className="p-4 rounded-xl border border-[#222629] bg-[#101315] hover:border-[#384247] transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border border-[#c8ff05]/40 bg-[#1a2307] text-[#c8ff05] flex items-center justify-center font-bold text-xs shrink-0">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">{name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {(!vm.canRecord || !canMarkAttendance(row)) && <AttendanceBadge status={attendance?.status ?? "Unmarked"} copy={copy} />}
              {!row.isEligible && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#7a343e] bg-[#1a1214] text-[#ff8290]">
                  {copy("notEligible") || "Ineligible"}
                </span>
              )}
            </div>
            {attendance?.reason && (
              <p className="text-[11px] text-[#9aa1a6] mt-0.5" dir="auto">{attendance.reason}</p>
            )}
          </div>
        </div>

        {attendance && (
          <div className="flex items-center gap-2">
            {vm.canCorrect && (
              <AttendanceCorrectionDialog
                name={name}
                record={attendance}
                sessionVersion={register.session.version}
                copy={copy}
                disabled={vm.locked}
                onSave={(correction) => vm.correct(athleteId, correction)}
                onReload={() => void vm.refresh()}
              />
            )}
            <AttendanceHistoryDialog
              name={name}
              sessionId={register.session.id}
              record={attendance}
              timeZone={register.session.data.timeZoneId}
              copy={copy}
            />
          </div>
        )}
      </div>

      {/* Status Radio Pills Selection */}
      {vm.canRecord && canMarkAttendance(row) && (
        <div className="pt-2 border-t border-[#222629]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {ATTENDANCE_STATUSES.map((status) => {
              const isMarked = (mark?.status || attendance?.status) === status;
              const statusColor =
                status === "Present"
                  ? "border-[#5a7800] bg-[#1a2307] text-[#c8ff05]"
                  : status === "Late"
                  ? "border-[#fbbf24]/50 bg-[#372b09] text-[#fbbf24]"
                  : status === "AbsentUnexcused"
                  ? "border-[#7a343e] bg-[#1a1214] text-[#ff8290]"
                  : status === "AbsentExcused"
                  ? "border-[#38bdf8]/40 bg-[#0c2331] text-[#38bdf8]"
                  : status === "Medical"
                  ? "border-purple-500/40 bg-purple-950/40 text-purple-300"
                  : "border-[#2a3033] bg-[#14171a] text-[#9aa1a6]";

              return (
                <button
                  key={status}
                  type="button"
                  disabled={vm.locked}
                  onClick={() => vm.mark(athleteId, status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isMarked
                      ? `${statusColor} font-bold shadow-[0_0_12px_rgba(200,255,5,0.1)]`
                      : "border-[#2a3033] bg-[#14171a] text-[#9aa1a6] hover:text-white"
                  }`}
                >
                  {copy(status)}
                </button>
              );
            })}
          </div>

          {mark && mark.status !== "Present" && (
            <div className="sm:max-w-xs w-full">
              <AttendanceReasonField
                mark={mark}
                copy={copy}
                disabled={vm.locked}
                invalid={vm.invalidAthletes.includes(athleteId)}
                onChange={(reason) => vm.changeReason(athleteId, reason)}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
