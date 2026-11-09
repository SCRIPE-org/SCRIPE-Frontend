"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
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
  const { copy: sessionCopy } = useSessionsCopy();
  const vm = useAttendanceQueue();
  const result = vm.query.data;
  const pages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;

  return (
    <section dir={direction} aria-labelledby="attendance-queue-title" className="mx-auto w-full max-w-6xl min-w-0 space-y-5 p-4 text-nx-ink sm:p-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-nx-ink-2">{copy("eyebrow")}</p>
        <h1 id="attendance-queue-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy("queueTitle")}</h1>
        <p className="text-sm text-nx-ink-2">{copy("queueDescription")}</p>
      </header>
      {!vm.canView ? <AttendanceFailure message="forbidden" copy={copy} /> : (
        <>
          <Card className="grid min-w-0 gap-3 border-nx-line bg-nx-surface p-4 sm:grid-cols-[minmax(12rem,18rem)_1fr] sm:items-end">
            <SessionSelect id="attendance-session-filter" label={copy("sessionFilter")} value={vm.status || ALL}
              onValueChange={(value) => vm.filterStatus(value === ALL ? "" : value as SessionStatus)}
              options={[{ value: ALL, label: copy("allStatuses") }, ...SESSION_STATUSES.map((status) => ({ value: status, label: sessionCopy(status) }))]} />
            {result && !vm.query.isError && <output className="pb-1 text-sm text-nx-ink-2 sm:justify-self-end">{copy("sessionCount", { count: result.totalCount })}</output>}
          </Card>
          {vm.query.isPending && <LoadingSpinner />}
          {vm.query.isError && <AttendanceFailure message={attendanceFailure(vm.query.error)} copy={copy} retry={{ action: () => void vm.query.refetch() }} />}
          {result && !vm.query.isError && (
            <>
              {result.items.length ? (
                <ul className="grid min-w-0 gap-3">
                  {result.items.map((session) => (
                    <li key={session.id} className="min-w-0">
                      <Card className="grid min-w-0 items-start gap-4 border-nx-line bg-nx-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <AttendanceSessionContext session={session} copy={copy} />
                        <Button asChild variant="outline" className="min-h-11 w-fit gap-2">
                          <Link href={"/academy/attendance/" + encodeURIComponent(session.id)}
                            aria-label={copy("openRegister") + " · " + session.groupName(language)}>
                            {copy("openRegister")}<ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                          </Link>
                        </Button>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <Card className="border-nx-line bg-nx-surface p-8 text-center">
                  <ClipboardCheck aria-hidden="true" className="mx-auto mb-3 size-6 text-nx-ink-3" />
                  <h2 className="font-semibold">{copy("queueEmpty")}</h2>
                  <p className="mt-1 text-sm text-nx-ink-2">{copy("queueEmptyHint")}</p>
                </Card>
              )}
              {(pages > 1 || vm.page > 1) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-nx-ink-2">{copy("page", { page: result.page, pages })}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="min-h-11" disabled={vm.page <= 1} onClick={() => vm.setPage(vm.page - 1)}>{copy("previous")}</Button>
                    <Button type="button" variant="outline" className="min-h-11" disabled={vm.page >= pages} onClick={() => vm.setPage(vm.page + 1)}>{copy("next")}</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
