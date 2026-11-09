"use client";

import Link from "next/link";
import { ArrowLeft, CheckCheck, ClipboardCheck, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
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
  const vm = useAttendanceRegister(sessionId, scope);
  const register = vm.query.data;
  const readError = vm.query.isError ? attendanceFailure(vm.query.error) : null;
  const accessError = readError === "forbidden" || readError === "notFound";
  const reload = () => void vm.refresh();

  return (
    <section dir={direction} aria-labelledby="attendance-register-title" className="mx-auto w-full max-w-6xl min-w-0 space-y-5 p-4 text-nx-ink sm:p-6">
      <Button asChild variant="ghost" className="min-h-11 gap-2">
        <Link href="/academy/attendance"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />{copy("backToQueue")}</Link>
      </Button>
      <header className="space-y-1">
        <p className="text-xs font-semibold text-nx-ink-2">{copy("eyebrow")}</p>
        <h1 id="attendance-register-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy("registerTitle")}</h1>
      </header>
      {!vm.canView ? <AttendanceFailure message="forbidden" copy={copy} /> : (
        <>
          {vm.query.isPending && <LoadingSpinner />}
          {readError && (!register || accessError || !vm.failure) && <AttendanceFailure message={readError} copy={copy} retry={{ action: reload }} disabled={vm.query.isFetching} />}
          {register && !accessError && (
            <>
              <Card className="min-w-0 border-nx-line bg-nx-surface p-4 sm:p-5"><AttendanceSessionContext session={register.session} copy={copy} /></Card>
              {!vm.canRecord && (
                <Alert variant="info" role="status"><LockKeyhole aria-hidden="true" />
                  <AlertDescription>{copy(register.session.status === "Cancelled" ? "cancelled" : vm.canCorrect ? "correctionsOnly" : "readOnly")}</AlertDescription>
                </Alert>
              )}
              <div aria-live="polite">
                {vm.notice && <Alert variant="success" role="status"><ClipboardCheck aria-hidden="true" /><AlertDescription>{copy(vm.notice)}</AlertDescription></Alert>}
              </div>
              {vm.failure && (
                <AttendanceFailure message={vm.failure} copy={copy} disabled={vm.busy || vm.query.isFetching}
                  retry={vm.canRetry ? { action: vm.retry, label: "retrySave" } : undefined} reload={vm.needsReload ? reload : undefined} />
              )}
              <Roster register={register} vm={vm} copy={copy} language={language} />
            </>
          )}
        </>
      )}
    </section>
  );
}

function Roster({ register, vm, copy, language }: {
  register: AttendanceRegister; vm: RegisterViewModel; copy: AttendanceCopy; language: "en" | "ar";
}) {
  const savedCount = register.rows.filter((row) => row.attendance).length;
  const multipleBatches = vm.draftCount > ATTENDANCE_BULK_LIMIT;
  return (
    <section aria-labelledby="attendance-roster-title" aria-busy={vm.busy || vm.query.isFetching} className="min-w-0 space-y-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 id="attendance-roster-title" className="text-lg font-semibold">{copy("roster")}</h2>
          {vm.canRecord && vm.markableCount > 0 && <p className="text-sm text-nx-ink-2">{copy("rosterHint")}</p>}
          <div className="flex flex-wrap gap-2 pt-1" aria-live="polite" aria-atomic="true">
            <Badge variant="outline">{copy("rosterCount", { count: register.rows.length })}</Badge>
            <Badge variant="secondary">{copy("savedCount", { count: savedCount })}</Badge>
            {vm.canRecord && vm.draftCount > 0 && <Badge variant="info">{copy("markedCount", { count: vm.draftCount })}</Badge>}
          </div>
        </div>
        {vm.canRecord && vm.markableCount > 0 && (
          <Button type="button" variant="outline" className="min-h-11 gap-2" disabled={vm.locked || vm.draftCount === vm.markableCount} onClick={vm.fillPresent}>
            <CheckCheck aria-hidden="true" className="size-4" />{copy("markAll")}
          </Button>
        )}
      </header>
      {register.rows.length ? (
        <ul className="grid min-w-0 gap-2">
          {register.rows.map((row) => <RosterRow key={row.athleteId} row={row} register={register} vm={vm} copy={copy} language={language} />)}
        </ul>
      ) : <Card className="border-nx-line bg-nx-surface p-6 text-center text-sm text-nx-ink-2">{copy("rosterEmpty")}</Card>}
      {vm.canRecord && vm.markableCount > 0 && (
        <Card className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-nx-line bg-nx-surface p-4">
          <div className="space-y-1">
            <output className="block text-sm text-nx-ink-2">{copy("saveSummary", { marked: vm.draftCount, unmarked: vm.markableCount - vm.draftCount })}</output>
            {multipleBatches && <p className="text-xs text-nx-ink-2">{copy("batchHint", { max: ATTENDANCE_BULK_LIMIT })}</p>}
          </div>
          <Button type="button" className="min-h-11 w-full sm:w-auto" loading={vm.busy} disabled={vm.locked || !vm.draftCount} onClick={vm.save}>
            {copy(vm.busy ? "saving" : vm.query.isFetching ? "refreshing" : multipleBatches ? "saveBatch" : "saveAttendance", { count: ATTENDANCE_BULK_LIMIT })}
          </Button>
          {!!vm.invalidAthletes.length && <AttendanceFailure message="reviewReasons" copy={copy} />}
        </Card>
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
    <li className="min-w-0">
      <Card className="grid min-w-0 items-start gap-3 border-nx-line bg-nx-surface p-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,22rem)]">
        <div className="min-w-0 space-y-1 [overflow-wrap:anywhere]">
          <h3 className="font-medium"><bdi>{name}</bdi></h3>
          <div className="flex flex-wrap gap-2">
            {(!vm.canRecord || !canMarkAttendance(row)) && <AttendanceBadge status={attendance?.status ?? "Unmarked"} copy={copy} />}
            {!row.isEligible && <Badge variant="outline">{copy("notEligible")}</Badge>}
          </div>
          {attendance?.reason && <p className="text-sm text-nx-ink-2" dir="auto">{attendance.reason}</p>}
        </div>
        {attendance && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
            {vm.canCorrect && (
              <AttendanceCorrectionDialog name={name} record={attendance} sessionVersion={register.session.version} copy={copy} disabled={vm.locked}
                onSave={(correction) => vm.correct(athleteId, correction)} onReload={() => void vm.refresh()} />
            )}
            <AttendanceHistoryDialog name={name} sessionId={register.session.id} record={attendance} timeZone={register.session.data.timeZoneId} copy={copy} />
          </div>
        )}
        {vm.canRecord && canMarkAttendance(row) && (
          <div className="min-w-0 space-y-3">
            <SessionSelect id={"attendance-mark-" + athleteId} label={copy("athleteStatus", { name })} value={mark?.status ?? "Unmarked"} disabled={vm.locked}
              onValueChange={(status) => vm.mark(athleteId, status === "Unmarked" ? undefined : status as AttendanceStatus)}
              options={[{ value: "Unmarked", label: copy("Unmarked") }, ...ATTENDANCE_STATUSES.map((status) => ({ value: status, label: copy(status) }))]} />
            {mark && mark.status !== "Present" && <AttendanceReasonField mark={mark} copy={copy} disabled={vm.locked}
              invalid={vm.invalidAthletes.includes(athleteId)} onChange={(reason) => vm.changeReason(athleteId, reason)} />}
          </div>
        )}
      </Card>
    </li>
  );
}
