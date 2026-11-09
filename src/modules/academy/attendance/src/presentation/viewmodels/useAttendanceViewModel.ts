"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@core/hooks/use-permission";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared/permission-constants";
import type { SessionStatus } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import { useSessionScope } from "@modules/academy/sessions/src/presentation/viewmodels/useSessionsViewModel";
import { buildBulkAttendance, canMarkAttendance, changeAttendanceMark, markAllPresent, reconcileDraft, type AttendanceDraft } from "../../domain/attendance-draft";
import { ATTENDANCE_BULK_LIMIT, AttendanceRequestError, type AttendanceCorrection, type AttendanceRegister, type AttendanceStatus, type BulkAttendanceIntent } from "../../domain/entities/Attendance";
import type { AttendanceCopyKey } from "./useAttendanceCopy";

const PAGE_SIZE = 25;
type AttendanceScope = ReturnType<typeof useSessionScope>;
const attendanceKey = (scope: AttendanceScope) => ["academy-attendance", ...scope] as const;
const historyKey = (scope: AttendanceScope, id: string, athleteId: string) => [...attendanceKey(scope), "history", id, athleteId] as const;

export function attendanceFailure(error: unknown) {
  return error instanceof AttendanceRequestError ? error.kind : "unavailable";
}

export function useAttendanceQueue() {
  const { attendanceRepository } = useAcademyServiceLocator();
  const scope = useSessionScope();
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SessionStatus | "">("");
  const query = useQuery({
    queryKey: [...attendanceKey(scope), "queue", page, status],
    enabled: canView,
    retry: false,
    queryFn: ({ signal }) => attendanceRepository.list({ page, pageSize: PAGE_SIZE, status: status || undefined }, signal),
  });

  function filterStatus(next: SessionStatus | "") {
    setStatus(next);
    setPage(1);
  }

  return { canView, query, page, setPage, status, filterStatus };
}

type WriteOperation = { kind: "bulk"; intent: BulkAttendanceIntent }
  | { kind: "correct"; athleteId: string; correction: AttendanceCorrection };

export function useAttendanceRegister(id: string, scope: AttendanceScope) {
  const { attendanceRepository } = useAcademyServiceLocator();
  const queryClient = useQueryClient();
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW);
  const hasRecordPermission = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_RECORD);
  const hasCorrectPermission = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_OVERRIDE);
  const key = [...attendanceKey(scope), "register", id] as const;
  const query = useQuery({
    queryKey: key,
    enabled: canView,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: ({ signal }) => attendanceRepository.get(id, signal),
  });
  const [draft, setDraft] = useState<AttendanceDraft>({});
  const [notice, setNotice] = useState<"saved" | "corrected" | null>(null);
  const [failure, setFailure] = useState<AttendanceCopyKey | null>(null);
  const [retryIntent, setRetryIntent] = useState<BulkAttendanceIntent>();
  const [needsReload, setNeedsReload] = useState(false);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [validate, setValidate] = useState(false);
  const register = query.data;
  const rows = register?.rows ?? [];
  const sessionOpen = register && register.session.status !== "Cancelled";
  const canRecord = canView && hasRecordPermission && !!sessionOpen && register.canRecord;
  const canCorrect = canView && hasCorrectPermission && !!sessionOpen && register.canCorrect;
  const locked = busy || query.isFetching || query.isError || needsReload;
  const { entries, invalidAthletes } = buildBulkAttendance(draft, rows);
  const markableCount = rows.filter(canMarkAttendance).length;
  const draftCount = entries.length + invalidAthletes.length;

  const write = useMutation({
    mutationFn: async (operation: WriteOperation) => operation.kind === "bulk"
      ? attendanceRepository.record(id, operation.intent)
      : [await attendanceRepository.correct(id, operation.athleteId, operation.correction)],
    retry: false,
  });

  async function refresh(afterSave = false) {
    const result = await query.refetch();
    if (result.isError || !result.data) {
      setNeedsReload(true);
      setFailure(afterSave ? "reloadAfterSave" : "reloadUnavailable");
      return;
    }
    setDraft((previous) => reconcileDraft(previous, result.data.rows));
    setRetryIntent(undefined);
    setNeedsReload(false);
    setFailure(null);
    setValidate(false);
  }

  async function perform(operation: WriteOperation): Promise<AttendanceCopyKey | null> {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setNotice(null);
    setFailure(null);
    try {
      const records = await write.mutateAsync(operation);
      const byId = new Map(records.map((record) => [record.athleteId, record]));
      queryClient.setQueryData<AttendanceRegister>(key, (current) => current && ({
        ...current,
        rows: current.rows.map((row) => {
          const attendance = byId.get(row.athleteId);
          return attendance ? { ...row, attendance } : row;
        }),
      }));
      if (operation.kind === "correct") {
        void queryClient.invalidateQueries({ queryKey: historyKey(scope, id, operation.athleteId) });
      }
      setRetryIntent(undefined);
      setNotice(operation.kind === "bulk" ? "saved" : "corrected");
      await refresh(true);
      return null;
    } catch (error) {
      const kind = attendanceFailure(error);
      const reload = kind === "conflict" || kind === "unavailable" || kind === "forbidden" || kind === "notFound";
      const message = kind === "unavailable" ? (operation.kind === "bulk" ? "saveUnavailable" : "correctionUnavailable") : kind;
      setNeedsReload(reload);
      setRetryIntent(kind === "unavailable" && operation.kind === "bulk" ? operation.intent : undefined);
      if (operation.kind === "bulk" || reload) setFailure(message);
      return message;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function mark(id: string, status?: AttendanceStatus) {
    if (!canRecord || locked) return;
    setDraft((previous) => changeAttendanceMark(previous, id, status));
  }

  function changeReason(id: string, reason: string) {
    if (!canRecord || locked) return;
    setDraft((previous) => {
      const mark = previous[id];
      return mark ? { ...previous, [id]: { ...mark, reason } } : previous;
    });
  }

  function fillPresent() {
    if (canRecord && !locked) setDraft((previous) => markAllPresent(previous, rows));
  }

  function save() {
    if (!canRecord || locked || !register) return;
    setValidate(true);
    if (invalidAthletes.length || !entries.length) return;
    void perform({ kind: "bulk", intent: {
      idempotencyKey: crypto.randomUUID(),
      expectedSessionVersion: register.session.version,
      entries: entries.slice(0, ATTENDANCE_BULK_LIMIT),
    } });
  }

  function retry() {
    if (canRecord && retryIntent && !busy && !query.isFetching) void perform({ kind: "bulk", intent: retryIntent });
  }

  function correct(athleteId: string, correction: AttendanceCorrection) {
    return canCorrect && !locked && !inFlight.current
      ? perform({ kind: "correct", athleteId, correction }) : Promise.resolve("conflict" as const);
  }

  return {
    canView, canRecord, canCorrect, query, draft, notice, failure, busy, locked, needsReload,
    canRetry: canRecord && !!retryIntent, draftCount, markableCount,
    invalidAthletes: validate ? invalidAthletes : [],
    mark, changeReason, fillPresent, save, retry, correct, refresh,
  };
}

export function useAttendanceHistory(id: string, athleteId: string) {
  const { attendanceRepository } = useAcademyServiceLocator();
  const scope = useSessionScope();
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW);
  return useQuery({
    queryKey: historyKey(scope, id, athleteId),
    enabled: canView,
    retry: false,
    queryFn: ({ signal }) => attendanceRepository.history(id, athleteId, signal),
  });
}
