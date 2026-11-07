"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SessionFormDialog } from "../components/SessionFormDialog";
import { SessionFailure, SessionStatusBadge, SessionTimeRange } from "../components/SessionPrimitives";
import { SessionTransitionDialog } from "../components/SessionTransitionDialog";
import { useSessionsCopy } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey, useSessionDetailViewModel } from "../viewmodels/useSessionsViewModel";

export function SessionDetailView({ id }: { id: string }) {
  const { language, direction, copy } = useSessionsCopy();
  const vm = useSessionDetailViewModel(id);
  const session = vm.query.data;
  const data = session?.data;
  const objectives = language === "ar" ? data?.objectivesAr || data?.objectivesEn : data?.objectivesEn || data?.objectivesAr;
  const reload = () => void vm.query.refetch();

  return (
    <section dir={direction} aria-labelledby="session-title" className="mx-auto w-full max-w-5xl min-w-0 space-y-5 p-4 text-nx-ink sm:p-6">
      <Button asChild variant="ghost" className="min-h-11 gap-2">
        <Link href="/academy/sessions"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />{copy("back")}</Link>
      </Button>
      <header className="space-y-2">
        <p className="text-xs font-semibold text-nx-ink-2">{copy("detail")}</p>
        <h1 id="session-title" className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          <bdi>{session?.groupName(language) || copy("title")}</bdi>
        </h1>
        {session && <SessionStatusBadge status={session.status} copy={copy} />}
      </header>
      {!vm.canView && <SessionFailure error="forbidden" copy={copy} />}
      {vm.canView && vm.query.isPending && <LoadingSpinner />}
      {vm.canView && vm.query.isError && (
        <SessionFailure error={sessionErrorKey(vm.query.error, "read")} copy={copy}
          retry={sessionErrorKey(vm.query.error, "read") === "unavailable" ? reload : undefined} />
      )}
      {vm.canView && !vm.query.isError && session && data && (
        <>
          {vm.notice && <Alert role="generic" aria-live="polite" variant="success"><AlertDescription>{copy(vm.notice)}</AlertDescription></Alert>}
          {vm.canUpdate || vm.canCancel ? (
            <div className="flex flex-wrap items-center gap-2">
              {vm.canUpdate && session.canReschedule && data.locationMode !== "InternalVenue" && (
                <SessionFormDialog session={session} onSaved={() => vm.setNotice("rescheduled")} onReload={reload} />
              )}
              {vm.canUpdate && session.canStart && (
                <SessionTransitionDialog session={session} action="start" onSaved={vm.setNotice} onReload={reload} />
              )}
              {vm.canUpdate && session.canComplete && (
                <SessionTransitionDialog session={session} action="complete" onSaved={vm.setNotice} onReload={reload} />
              )}
              {vm.canCancel && session.canCancel && (
                <SessionTransitionDialog session={session} action="cancel" onSaved={vm.setNotice} onReload={reload} />
              )}
            </div>
          ) : null}

          {session.status === "Cancelled" && (
            <Alert role="generic" aria-live="polite" variant="warning">
              <AlertDescription>
                <p className="font-medium">{copy("cancelledNotice")}</p>
                {data.cancellationReason && <p className="mt-1 break-words" dir="auto">{data.cancellationReason}</p>}
              </AlertDescription>
            </Alert>
          )}
          {session.status === "Completed" && !vm.notice && (
            <Alert role="generic" aria-live="polite" variant="info"><AlertDescription>{copy("completedNotice")}</AlertDescription></Alert>
          )}

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <Card className="min-w-0 space-y-4 border-nx-line bg-nx-surface p-5">
              <h2 className="font-semibold">{copy("timing")}</h2>
              <SessionTimeRange session={session} copy={copy} language={language} />
              <div className="border-t border-nx-line pt-3">
                <h3 className="text-sm font-medium">{copy("offering")}</h3>
                <p className="mt-1 break-words text-sm text-nx-ink-2"><bdi>{session.offeringName(language) || copy("noValue")}</bdi></p>
              </div>
            </Card>
            <Card className="min-w-0 space-y-4 border-nx-line bg-nx-surface p-5">
              <h2 className="font-semibold">{copy("location")}</h2>
              <p className="text-sm font-medium text-nx-ink-2">{copy(data.locationMode)}</p>
              {data.locationMode === "ExternalLocation" && (
                <p className="break-words"><bdi>{session.locationName(language) || copy("noValue")}</bdi></p>
              )}
              {data.locationMode === "PartnerReference" && (
                <>
                  <p className="break-words"><bdi>{session.locationName(language) || copy("noValue")}</bdi></p>
                  <p className="break-words text-sm text-nx-ink-2">{copy("partnerReference")}: <bdi>{data.partnerReservationReference || copy("noValue")}</bdi></p>
                  <p className="text-xs text-nx-ink-2">{copy("partnerHint")}</p>
                </>
              )}
              {data.locationMode === "InternalVenue" && <p className="text-sm text-nx-ink-2">{copy("venueHint")}</p>}
            </Card>
            <Card className="min-w-0 space-y-3 border-nx-line bg-nx-surface p-5">
              <h2 className="font-semibold">{copy("coach")}</h2>
              <ul className="space-y-2">
                {data.coaches.map((coach) => (
                  <li key={coach.staffMemberId} className="flex flex-wrap items-center gap-2 text-sm">
                    <bdi className="break-words">{coach.fullName || copy("noCoachName")}</bdi>
                    {coach.isSubstitute && <Badge variant="info">{copy("substituteTag")}</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="min-w-0 space-y-3 border-nx-line bg-nx-surface p-5">
              <h2 className="font-semibold">{copy("objectives")}</h2>
              <p className="whitespace-pre-wrap break-words text-sm text-nx-ink-2" dir="auto">{objectives || copy("noValue")}</p>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
