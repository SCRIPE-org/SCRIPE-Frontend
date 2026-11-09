"use client";

import { useId, useState } from "react";
import { History, Pencil } from "lucide-react";
import { Button } from "@core/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Textarea } from "@core/ui/textarea";
import { SessionSelect } from "@modules/academy/sessions/src/presentation/components/SessionPrimitives";
import { formatSessionTime } from "@modules/academy/sessions/src/domain/session-time";
import { attendanceReasonValid } from "../../domain/attendance-draft";
import { ATTENDANCE_REASON_LIMIT, ATTENDANCE_STATUSES, type AttendanceCorrection, type AttendanceRecord, type AttendanceStatus } from "../../domain/entities/Attendance";
import type { AttendanceCopy, AttendanceCopyKey } from "../viewmodels/useAttendanceCopy";
import { useAttendanceCopy } from "../viewmodels/useAttendanceCopy";
import { attendanceFailure, useAttendanceHistory } from "../viewmodels/useAttendanceViewModel";
import { AttendanceBadge, AttendanceFailure, AttendanceReasonField } from "./AttendancePrimitives";

interface CorrectionSnapshot {
  record: AttendanceRecord;
  sessionVersion: string;
}

export function AttendanceCorrectionDialog({ name, record, sessionVersion, disabled, onSave, onReload, copy }: {
  name: string;
  record: AttendanceRecord;
  sessionVersion: string;
  disabled: boolean;
  onSave: (correction: AttendanceCorrection) => Promise<AttendanceCopyKey | null>;
  onReload: () => void;
  copy: AttendanceCopy;
}) {
  const [snapshot, setSnapshot] = useState<CorrectionSnapshot | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={!!snapshot} onOpenChange={(open) => { if (!saving) setSnapshot(open ? { record, sessionVersion } : null); }}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="min-h-11 gap-2" disabled={disabled} aria-label={copy("correctionFor", { name })}>
          <Pencil className="size-4" aria-hidden="true" />{copy("correction")}
        </Button>
      </DialogTrigger>
      {snapshot && (
        <CorrectionForm name={name} snapshot={snapshot} saving={saving} setSaving={setSaving} onSave={onSave}
          onSaved={() => setSnapshot(null)} onReload={() => { setSnapshot(null); onReload(); }} />
      )}
    </Dialog>
  );
}

function CorrectionForm({ name, snapshot, saving, setSaving, onSave, onSaved, onReload }: {
  name: string;
  snapshot: CorrectionSnapshot;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  onSave: (correction: AttendanceCorrection) => Promise<AttendanceCopyKey | null>;
  onSaved: () => void;
  onReload: () => void;
}) {
  const { copy, direction } = useAttendanceCopy();
  const { record, sessionVersion } = snapshot;
  const statusId = useId();
  const correctionId = useId();
  const [status, setStatus] = useState(record.status);
  const [reason, setReason] = useState(record.reason ?? "");
  const [correctionReason, setCorrectionReason] = useState("");
  const [validate, setValidate] = useState(false);
  const [error, setError] = useState<AttendanceCopyKey | null>(null);
  const reasonValid = attendanceReasonValid({ status, reason });
  const correctionValid = correctionReason.trim().length > 0 && correctionReason.trim().length <= ATTENDANCE_REASON_LIMIT;
  const unchanged = status === record.status && reason.trim() === (record.reason ?? "").trim();
  const reload = error === "conflict" || error === "correctionUnavailable" || error === "forbidden" || error === "notFound";

  return (
    <DialogContent dir={direction} className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{copy("correctionTitle")} · <bdi>{name}</bdi></DialogTitle>
        <DialogDescription>{copy("correctionIntro")}</DialogDescription>
      </DialogHeader>
      <form className="min-w-0 space-y-4" aria-busy={saving} noValidate onSubmit={async (event) => {
        event.preventDefault();
        if (saving || reload) return;
        setValidate(true);
        if (!reasonValid || !correctionValid || unchanged) return;
        setSaving(true);
        try {
          const failure = await onSave({
            expectedVersion: record.version, expectedSessionVersion: sessionVersion, status,
            reason: reason.trim() || undefined, correctionReason: correctionReason.trim(),
          });
          setError(failure);
          if (!failure) onSaved();
        } finally {
          setSaving(false);
        }
      }}>
        <p className="flex flex-wrap items-center gap-2 text-sm text-nx-ink-2">{copy("currentStatus")} <AttendanceBadge status={record.status} copy={copy} /></p>
        <SessionSelect id={statusId} label={copy("status")} value={status} disabled={saving || reload}
          onValueChange={(value) => { setStatus(value as AttendanceStatus); if (value === "Present") setReason(""); }}
          options={ATTENDANCE_STATUSES.map((value) => ({ value, label: copy(value) }))} />
        <AttendanceReasonField mark={{ status, reason }} copy={copy} disabled={saving || reload} invalid={validate && !reasonValid} onChange={setReason} />
        <div className="space-y-1.5">
          <Label htmlFor={correctionId}>{copy("correctionReason")}</Label>
          <Textarea id={correctionId} rows={3} dir="auto" value={correctionReason} maxLength={ATTENDANCE_REASON_LIMIT}
            required disabled={saving || reload} aria-invalid={validate && !correctionValid || undefined}
            aria-describedby={validate && !correctionValid ? correctionId + "-error" : undefined}
            onChange={(event) => setCorrectionReason(event.target.value)} />
          {validate && !correctionValid && <p id={correctionId + "-error"} className="text-xs font-medium text-destructive">{copy("missingCorrectionReason")}</p>}
        </div>
        {validate && unchanged && <AttendanceFailure message="unchanged" copy={copy} />}
        {error && <AttendanceFailure message={error} copy={copy} reload={reload ? onReload : undefined} />}
        <DialogFooter>
          <DialogClose asChild><Button type="button" className="min-h-11" variant="outline" disabled={saving}>{copy("close")}</Button></DialogClose>
          <Button type="submit" className="min-h-11" loading={saving} disabled={reload}>{copy(saving ? "saving" : "saveCorrection")}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function AttendanceHistoryDialog({ name, sessionId, record, timeZone, copy }: {
  name: string;
  sessionId: string;
  record: AttendanceRecord;
  timeZone: string;
  copy: AttendanceCopy;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="min-h-11 gap-2" aria-label={copy("historyFor", { name })}>
          <History className="size-4" aria-hidden="true" />{copy("history")}
        </Button>
      </DialogTrigger>
      {open && <HistoryContent name={name} sessionId={sessionId} record={record} timeZone={timeZone} />}
    </Dialog>
  );
}

function HistoryContent({ name, sessionId, record, timeZone }: { name: string; sessionId: string; record: AttendanceRecord; timeZone: string }) {
  const { copy, direction, language } = useAttendanceCopy();
  const query = useAttendanceHistory(sessionId, record.athleteId);
  return (
    <DialogContent dir={direction} className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{copy("historyTitle")} · <bdi>{name}</bdi></DialogTitle>
        <DialogDescription>{copy("historyIntro")}</DialogDescription>
      </DialogHeader>
      <section className="min-w-0 space-y-3">
        <div className="space-y-1 rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {copy("recordedOn")}<AttendanceBadge status={record.status} copy={copy} />
          </div>
          <time dateTime={record.recordedAtUtc} className="block text-xs text-nx-ink-2">{formatSessionTime(record.recordedAtUtc, timeZone, language)}</time>
          {record.reason && <p className="text-sm text-nx-ink-2 [overflow-wrap:anywhere]" dir="auto">{record.reason}</p>}
        </div>
        {query.isPending && <LoadingSpinner size="sm" />}
        {query.isError && <AttendanceFailure message={attendanceFailure(query.error)} copy={copy} retry={{ action: () => void query.refetch() }} />}
        {query.isSuccess && (query.data.length ? (
          <ol className="space-y-3">
            {query.data.map((entry) => (
              <li key={entry.after.version} className="min-w-0 space-y-2 rounded-nx-md border border-nx-line bg-nx-surface p-3">
                <div className="flex flex-wrap justify-between gap-2 text-xs text-nx-ink-2">
                  <time dateTime={entry.changedAtUtc}>{formatSessionTime(entry.changedAtUtc, timeZone, language)}</time>
                  <span className="min-w-0 [overflow-wrap:anywhere]">{copy("actor")} <bdi>{entry.actorId || copy("actorUnavailable")}</bdi></span>
                </div>
                <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                  <HistoryMark label={copy("from")} record={entry.before} copy={copy} />
                  <HistoryMark label={copy("to")} record={entry.after} copy={copy} />
                </div>
                <div>
                  <p className="text-xs font-medium">{copy("correctionNote")}</p>
                  <p className="text-sm text-nx-ink-2 [overflow-wrap:anywhere]" dir="auto">{entry.correctionReason}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-nx-ink-2">{copy("noHistory")}</p>)}
      </section>
      <DialogFooter><DialogClose asChild><Button type="button" className="min-h-11" variant="outline">{copy("close")}</Button></DialogClose></DialogFooter>
    </DialogContent>
  );
}

function HistoryMark({ label, record, copy }: { label: string; record: AttendanceRecord; copy: AttendanceCopy }) {
  return (
    <div className="min-w-0 space-y-1 rounded-nx-md bg-nx-raised p-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">{label} <AttendanceBadge status={record.status} copy={copy} /></div>
      <p dir={record.reason ? "auto" : undefined} className="text-sm text-nx-ink-2 [overflow-wrap:anywhere]">{record.reason || copy("noReason")}</p>
    </div>
  );
}
