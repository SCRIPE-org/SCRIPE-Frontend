"use client";

import { useId } from "react";
import { AlertCircle, MapPin, Users } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { TrainingSession } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import { preferredName, SessionStatusBadge, SessionTimeRange } from "@modules/academy/sessions/src/presentation/components/SessionPrimitives";
import { useSessionsCopy } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsCopy";
import { attendanceReasonRequired, type AttendanceMark } from "../../domain/attendance-draft";
import { ATTENDANCE_REASON_LIMIT, type AttendanceRow, type AttendanceStatus } from "../../domain/entities/Attendance";
import type { AttendanceCopy, AttendanceCopyKey } from "../viewmodels/useAttendanceCopy";

const statusVariants = {
  Present: "success", Late: "warning", AbsentExcused: "secondary",
  AbsentUnexcused: "destructive", Medical: "info", Remote: "info", Unmarked: "outline",
} as const;

export function AttendanceBadge({ status, copy }: { status: AttendanceStatus | "Unmarked"; copy: AttendanceCopy }) {
  return <Badge variant={statusVariants[status]}>{copy(status)}</Badge>;
}

export function attendanceName(row: AttendanceRow, language: "en" | "ar", copy: AttendanceCopy) {
  return preferredName(language, row.displayNameEn, row.displayNameAr) || copy("nameUnavailable");
}

export function AttendanceFailure({ message, copy, retry, reload, disabled }: {
  message: AttendanceCopyKey;
  copy: AttendanceCopy;
  retry?: { action: () => void; label?: AttendanceCopyKey };
  reload?: () => void;
  disabled?: boolean;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertDescription>{copy(message)}</AlertDescription>
      {(retry || reload) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {retry && <Button type="button" size="sm" variant="outline" className="min-h-11" disabled={disabled} onClick={retry.action}>{copy(retry.label ?? "retry")}</Button>}
          {reload && <Button type="button" size="sm" variant="outline" className="min-h-11" disabled={disabled} onClick={reload}>{copy("reload")}</Button>}
        </div>
      )}
    </Alert>
  );
}

export function AttendanceSessionContext({ session, copy }: { session: TrainingSession; copy: AttendanceCopy }) {
  const { language, copy: sessionCopy } = useSessionsCopy();
  const { coaches, partnerReservationReference, locationMode } = session.data;
  const location = session.locationName(language) || partnerReservationReference || sessionCopy(locationMode);
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="min-w-0 space-y-1">
        <h2 className="font-semibold [overflow-wrap:anywhere]"><bdi>{session.groupName(language)}</bdi></h2>
        <p className="text-sm text-nx-ink-2 [overflow-wrap:anywhere]"><bdi>{session.offeringName(language)}</bdi></p>
        <SessionStatusBadge status={session.status} copy={sessionCopy} />
      </div>
      <SessionTimeRange session={session} copy={sessionCopy} language={language} />
      <div className="min-w-0 space-y-2 text-sm text-nx-ink-2 [overflow-wrap:anywhere]">
        <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><bdi>{location}</bdi></p>
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="sr-only">{copy("coach")}</span>
            {coaches.length ? (
              <ul className="space-y-0.5">
                {coaches.map((coach) => <li key={coach.staffMemberId}><bdi>{coach.fullName || copy("noCoach")}</bdi>{coach.isSubstitute && <span className="ms-2 text-xs">{sessionCopy("substituteTag")}</span>}</li>)}
              </ul>
            ) : copy("noCoach")}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttendanceReasonField({ mark, copy, onChange, invalid, disabled }: {
  mark: AttendanceMark;
  copy: AttendanceCopy;
  onChange: (reason: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const required = attendanceReasonRequired(mark.status);
  const medical = mark.status === "Medical";
  const hintId = id + "-hint";
  const errorId = id + "-error";
  const error = mark.reason.trim().length > ATTENDANCE_REASON_LIMIT ? "reasonTooLong" : "missingReason";
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{copy(required ? "reasonRequired" : "reasonOptional")}</Label>
      <Textarea id={id} rows={2} maxLength={ATTENDANCE_REASON_LIMIT} value={mark.reason} dir="auto" disabled={disabled}
        aria-required={required} aria-invalid={invalid || undefined}
        aria-describedby={[medical ? hintId : "", invalid ? errorId : ""].filter(Boolean).join(" ") || undefined}
        onChange={(event) => onChange(event.target.value)} />
      {medical && <p id={hintId} className="text-xs text-nx-ink-2">{copy("medicalHint")}</p>}
      {invalid && <p id={errorId} className="text-xs font-medium text-destructive">{copy(error, { max: ATTENDANCE_REASON_LIMIT })}</p>}
    </div>
  );
}
