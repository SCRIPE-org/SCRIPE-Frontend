"use client";

import { useId, useState } from "react";
import { CalendarPlus, CalendarRange } from "lucide-react";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Textarea } from "@core/ui/textarea";
import type { TrainingSession } from "../../domain/entities/TrainingSession";
import { useSessionFormViewModel } from "../viewmodels/useSessionFormViewModel";
import { useSessionsCopy } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey } from "../viewmodels/useSessionsViewModel";
import { preferredName, SessionFailure, SessionSelect } from "./SessionPrimitives";

const NO_SUBSTITUTE = "none";

export function SessionFormDialog({ session, onSaved, onReload }: {
  session?: TrainingSession; onSaved: (session: TrainingSession) => void; onReload?: () => void;
}) {
  const { copy } = useSessionsCopy();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const Icon = session ? CalendarRange : CalendarPlus;
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) setOpen(next); }}>
      <DialogTrigger asChild>
        <Button type="button" variant={session ? "outline" : "default"} className="min-h-11 gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {copy(session ? "reschedule" : "create")}
        </Button>
      </DialogTrigger>
      {open && <SessionForm initial={session} onBusy={setBusy} onSaved={(saved) => {
        setOpen(false);
        onSaved(saved);
      }} onReload={onReload && (() => { setOpen(false); onReload(); })} />}
    </Dialog>
  );
}

function SessionForm({ initial, onSaved, onBusy, onReload }: {
  initial?: TrainingSession;
  onSaved: (session: TrainingSession) => void;
  onBusy: (busy: boolean) => void;
  onReload?: () => void;
}) {
  const id = useId();
  const { copy, language, direction } = useSessionsCopy();
  // Keep the exact record version that was reviewed when the dialog opened.
  const [base] = useState(initial);
  const vm = useSessionFormViewModel(base, onSaved, onBusy);
  const { fields, update } = vm;
  const error = vm.error ?? (vm.save.error ? sessionErrorKey(vm.save.error, base ? "update" : "create") : null);
  const groupLabel = base?.groupName(language);
  const groupOptions = (vm.groups.data ?? []).map((group) => ({
    value: group.id, label: preferredName(language, group.nameEn, group.nameAr) || copy("noValue"),
  }));
  const busy = vm.save.isPending;

  return (
    <DialogContent dir={direction} className="max-h-[90dvh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{copy(base ? "reschedule" : "create")}</DialogTitle>
        <DialogDescription>{copy(base ? "rescheduleIntro" : "createIntro")}</DialogDescription>
      </DialogHeader>
      <form noValidate className="min-w-0 space-y-4" aria-busy={busy} onSubmit={(event) => { event.preventDefault(); vm.submit(); }}>
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          {base ? (
            <div><p className="text-xs text-nx-ink-2">{copy("group")}</p><p className="font-semibold">{groupLabel}</p></div>
          ) : (
            <SessionSelect id={id + "-group"} label={copy("group")} value={fields.groupId} onValueChange={vm.chooseGroup}
              options={groupOptions} placeholder={copy("groupChoose")} disabled={vm.groups.isPending || vm.groups.isError} required />
          )}
          {!base && vm.groups.isSuccess && !groupOptions.length && <p className="text-sm text-nx-ink-2">{copy("groupEmpty")}</p>}
          {vm.context.data && <p className="text-sm text-nx-ink-2">{copy("branch")}: <bdi>{vm.context.data.branchName}</bdi></p>}
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor={id + "-start"}>{copy("starts")}</Label>
              <Input id={id + "-start"} className="min-h-11 w-full min-w-0" type="datetime-local" dir="ltr"
                required value={vm.start} onChange={(event) => update("start", event.target.value)} />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor={id + "-end"}>{copy("ends")}</Label>
              <Input id={id + "-end"} className="min-h-11 w-full min-w-0" type="datetime-local" dir="ltr"
                min={vm.start} required value={vm.end} onChange={(event) => update("end", event.target.value)} />
              {vm.start && vm.end && vm.end <= vm.start && (
                <p className="text-xs text-destructive font-medium">{copy("invalidOrder")}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={id + "-timezone"}>{copy("timeZone")}</Label>
            <Input id={id + "-timezone"} className="min-h-11" dir="ltr" aria-describedby={id + "-timezone-hint"}
              value={vm.selectedTimeZone} readOnly={Boolean(vm.context.data?.timeZoneId)}
              onChange={(event) => update("timeZone", event.target.value)} required maxLength={100} />
            <p id={id + "-timezone-hint"} className="text-xs text-nx-ink-2">
              {copy(vm.context.data?.timeZoneId ? "branchTimeZone" : "timeZoneHint")}
            </p>
          </div>
          {fields.groupId && !vm.group.isPending && !vm.group.isError && (
            <fieldset className="min-w-0 space-y-2" aria-describedby={id + "-coaches-hint"}>
              <legend className="text-sm font-medium">{copy("coach")}</legend>
              <p id={id + "-coaches-hint"} className="text-xs text-nx-ink-2">{copy("coachHint")}</p>
              {vm.coachOptions.length === 0 && <p className="text-sm text-nx-ink-2">{copy("coachEmpty")}</p>}
              {vm.coachOptions.map((coach, index) => (
                <div key={coach.staffMemberId} className="flex min-h-9 items-center gap-3 ps-1">
                  <Checkbox id={id + "-coach-" + index} checked={fields.coachIds.includes(coach.staffMemberId)}
                    onCheckedChange={(checked) => vm.toggleCoach(coach.staffMemberId, checked === true)} />
                  <Label htmlFor={id + "-coach-" + index}><bdi>{coach.staffFullName}</bdi></Label>
                </div>
              ))}
              {vm.unavailableCoaches.map((coach, index) => (
                <div key={coach.id} className="flex min-h-9 items-center gap-3 ps-1">
                  <Checkbox id={id + "-unavailable-" + index} checked onCheckedChange={() => vm.toggleCoach(coach.id, false)} />
                  <Label htmlFor={id + "-unavailable-" + index}>
                    <bdi>{coach.name ?? copy("noCoachName")}</bdi> · {copy("coachUnavailable")}
                  </Label>
                </div>
              ))}
            </fieldset>
          )}
          {fields.groupId && (vm.substitutes.isSuccess || vm.initialSubstitute) && (
            <SessionSelect id={id + "-substitute"} label={copy("substitute")}
              value={fields.substituteId || NO_SUBSTITUTE} displayValue={vm.initialSubstitute?.staffMemberId === fields.substituteId ? vm.initialSubstitute?.fullName : undefined} onValueChange={(value) => update("substituteId", value === NO_SUBSTITUTE ? "" : value)}
              options={[
                { value: NO_SUBSTITUTE, label: copy("substituteNone") },
                ...vm.substituteOptions.map((coach) => ({ value: coach.staffMemberId, label: coach.fullName })),
              ]} />
          )}
          {vm.substitutes.isError && <p className="text-sm text-nx-ink-2">{copy("substituteUnavailable")}</p>}
          <SessionSelect id={id + "-mode"} label={copy("locationMode")} value={fields.locationMode}
            onValueChange={(value) => { if (value === "ExternalLocation" || value === "PartnerReference") update("locationMode", value); }}
            options={[{ value: "ExternalLocation", label: copy("ExternalLocation") }, { value: "PartnerReference", label: copy("PartnerReference") }]} />
          <SessionSelect id={id + "-location"} label={copy("location")} value={fields.locationId}
            onValueChange={(value) => update("locationId", value)} placeholder={copy("locationChoose")} required
            disabled={!vm.context.data || vm.optionsPending || vm.optionsError}
            options={vm.locationOptions.map((location) => ({
              value: location.id, label: preferredName(language, location.nameEn, location.nameAr) || copy("noValue"),
            }))} />
          {vm.context.data && !vm.optionsPending && !vm.optionsError && !vm.locationOptions.length && (
            <p className="text-sm text-nx-ink-2">{copy("locationEmpty")}</p>
          )}
          {fields.locationMode === "PartnerReference" && (
            <div className="space-y-1.5">
              <Label htmlFor={id + "-partner"}>{copy("partnerReference")}</Label>
              <Input id={id + "-partner"} className="min-h-11" required maxLength={200} value={fields.partnerReference}
                aria-describedby={id + "-partner-hint"} onChange={(event) => update("partnerReference", event.target.value)} />
              <p id={id + "-partner-hint"} className="text-xs text-nx-ink-2">{copy("partnerHint")}</p>
            </div>
          )}
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={id + "-objectives-en"}>{copy("objectivesEn")} ({copy("optional")})</Label>
              <Textarea id={id + "-objectives-en"} dir="ltr" rows={2} maxLength={1000}
                value={fields.objectivesEn} onChange={(event) => update("objectivesEn", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={id + "-objectives-ar"}>{copy("objectivesAr")} ({copy("optional")})</Label>
              <Textarea id={id + "-objectives-ar"} dir="rtl" rows={2} maxLength={1000}
                value={fields.objectivesAr} onChange={(event) => update("objectivesAr", event.target.value)} />
            </div>
          </div>
        </fieldset>
        {vm.optionsPending && <LoadingSpinner size="sm" />}
        {vm.optionsError && <SessionFailure error="optionsFailed" copy={copy} retry={vm.retryOptions} />}
        {error && <SessionFailure error={error} copy={copy} retry={error === "conflict" ? onReload : undefined} retryLabel="reload" />}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={busy}>{copy("close")}</Button></DialogClose>
          <Button type="submit" loading={busy} disabled={vm.optionsPending || vm.optionsError || error === "conflict"}>
            {copy(busy ? "saving" : base ? "save" : "create")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
