"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SESSION_STATUSES, type SessionStatus, type TrainingSession } from "../../domain/entities/TrainingSession";
import { SessionFormDialog } from "../components/SessionFormDialog";
import { preferredName, SessionFailure, SessionSelect, SessionStatusBadge, SessionTimeRange, type SessionCopy } from "../components/SessionPrimitives";
import { useSessionsCopy } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey, useSessionsViewModel } from "../viewmodels/useSessionsViewModel";

const ANY = "any";

export function SessionsListView() {
  const { copy, language, direction } = useSessionsCopy();
  const vm = useSessionsViewModel();
  const result = vm.query.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;
  const groups = (vm.groups.data ?? []).map((group) => ({
    value: group.id, label: preferredName(language, group.nameEn, group.nameAr) || copy("noValue"),
  }));

  return (
    <section dir={direction} aria-labelledby="sessions-title" className="mx-auto w-full max-w-6xl min-w-0 space-y-5 p-4 text-nx-ink sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-nx-ink-2">{copy("eyebrow")}</p>
          <h1 id="sessions-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy("title")}</h1>
          <p className="text-sm text-nx-ink-2">{copy("subtitle")}</p>
        </div>
        {vm.canView && vm.canCreate && <SessionFormDialog onSaved={vm.sessionCreated} />}
      </header>

      {!vm.canView ? <SessionFailure error="forbidden" copy={copy} /> : (
        <>
          {vm.created && (
            <Alert role="generic" aria-live="polite" variant="success" className="flex flex-wrap items-center justify-between gap-2">
              <AlertDescription>{copy("created")}</AlertDescription>
              <Button asChild size="sm" variant="outline">
                <Link href={"/academy/sessions/" + encodeURIComponent(vm.created.id)}>{copy("openDetails")}</Link>
              </Button>
            </Alert>
          )}
          <Card className="min-w-0 border-nx-line bg-nx-surface p-4 sm:p-5">
            <form aria-labelledby="sessions-filters" className="space-y-3" onSubmit={(event) => { event.preventDefault(); vm.applyFilters(); }}>
              <h2 id="sessions-filters" className="text-sm font-semibold">{copy("filterTitle")}</h2>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {vm.canSeeGroups && (
                  <SessionSelect id="sessions-group" label={copy("group")} value={vm.input.group || ANY}
                    onValueChange={(group) => vm.setInput({ ...vm.input, group: group === ANY ? "" : group })}
                    disabled={vm.groups.isPending || vm.groups.isError}
                    options={[{ value: ANY, label: copy("groupsAll") }, ...groups]} />
                )}
                <SessionSelect id="sessions-status" label={copy("status")} value={vm.input.status || ANY}
                  onValueChange={(status) => vm.setInput({ ...vm.input, status: status === ANY ? "" : status as SessionStatus })}
                  options={[{ value: ANY, label: copy("statusAll") }, ...SESSION_STATUSES.map((status) => ({ value: status, label: copy(status) }))]} />
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="sessions-from">{copy("dateFrom")}</Label>
                  <Input id="sessions-from" className="min-h-11 w-full min-w-0" dir="ltr" type="date" value={vm.input.from}
                    onChange={(event) => vm.setInput({ ...vm.input, from: event.target.value })} />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="sessions-through">{copy("dateThrough")}</Label>
                  <Input id="sessions-through" className="min-h-11 w-full min-w-0" dir="ltr" type="date" value={vm.input.through}
                    onChange={(event) => vm.setInput({ ...vm.input, through: event.target.value })} />
                </div>
              </div>
              <p className="text-xs text-nx-ink-2">{copy("datesHint")}</p>
              {vm.filterError && <SessionFailure error={vm.filterError} copy={copy} />}
              {vm.canSeeGroups && vm.groups.isError && <SessionFailure error="optionsFailed" copy={copy} retry={() => void vm.groups.refetch()} />}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary" className="min-h-11">{copy("applyFilters")}</Button>
                <Button type="button" variant="ghost" className="min-h-11" onClick={vm.clearFilters}>{copy("clearFilters")}</Button>
              </div>
            </form>
          </Card>

          {vm.query.isPending && <LoadingSpinner />}
          {vm.query.isError && (
            <SessionFailure error={sessionErrorKey(vm.query.error, "read")} copy={copy}
              retry={() => void vm.query.refetch()} />
          )}
          {!vm.query.isError && result && (
            <>
              <output className="block text-sm text-nx-ink-2">{copy("results", { count: result.totalCount })}</output>
              {result.items.length === 0 ? (
                <Card className="border-nx-line bg-nx-surface p-8 text-center">
                  <CalendarDays className="mx-auto mb-3 size-6 text-nx-ink-3" aria-hidden="true" />
                  <h2 className="font-semibold">{copy("empty")}</h2>
                  <p className="mt-1 text-sm text-nx-ink-2">{copy(vm.filtered ? "emptyFiltered" : "emptyUnfiltered")}</p>
                </Card>
              ) : (
                <ul className="grid min-w-0 gap-3">
                  {result.items.map((session) => (
                    <li key={session.id} className="min-w-0"><SessionRow session={session} copy={copy} language={language} /></li>
                  ))}
                </ul>
              )}
              {(totalPages > 1 || vm.page > 1) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-nx-ink-2">{copy("page", { page: result.page, pages: totalPages })}</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={vm.page <= 1} onClick={() => vm.setPage(vm.page - 1)}>{copy("previous")}</Button>
                    <Button type="button" variant="outline" disabled={vm.page >= totalPages} onClick={() => vm.setPage(vm.page + 1)}>{copy("next")}</Button>
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

function SessionRow({ session, copy, language }: { session: TrainingSession; copy: SessionCopy; language: "ar" | "en" }) {
  const { coaches, locationMode, partnerReservationReference } = session.data;
  const name = session.groupName(language);
  const location = session.locationName(language) || partnerReservationReference || copy(locationMode);
  return (
    <Card className="grid min-w-0 items-start gap-4 border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="min-w-0 space-y-1">
        <h2 className="break-words font-semibold"><bdi>{name}</bdi></h2>
        <p className="break-words text-sm text-nx-ink-2"><bdi>{session.offeringName(language)}</bdi></p>
        <SessionStatusBadge status={session.status} copy={copy} />
      </div>
      <SessionTimeRange session={session} copy={copy} language={language} />
      <div className="min-w-0 space-y-2 text-sm text-nx-ink-2">
        <p className="flex items-start gap-2 break-words"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <bdi className="min-w-0 break-words">{location}</bdi>
        </p>
        <p className="flex items-start gap-2"><Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{coaches.map((coach, index) => (
            <span key={coach.staffMemberId}>{index ? ", " : ""}<bdi>{coach.fullName || copy("noCoachName")}</bdi></span>
          ))}</span>
        </p>
      </div>
      <Button asChild variant="outline" className="min-h-11 w-fit">
        <Link href={"/academy/sessions/" + encodeURIComponent(session.id)}
          aria-label={copy("openDetails") + " · " + name}>{copy("openDetails")}</Link>
      </Button>
    </Card>
  );
}
