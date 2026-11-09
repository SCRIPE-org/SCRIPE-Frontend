"use client";

import { useId, useState } from "react";
import { CheckCircle, Play, XCircle } from "lucide-react";
import { stripHtmlTags } from "@core/common/sanitize";
import { Button } from "@core/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { SessionAction, TrainingSession } from "../../domain/entities/TrainingSession";
import { useSessionsCopy, type SessionCopyKey } from "../viewmodels/useSessionsCopy";
import { sessionErrorKey, useTransitionSession } from "../viewmodels/useSessionsViewModel";
import { SessionFailure } from "./SessionPrimitives";

const actionIcons = { start: Play, complete: CheckCircle, cancel: XCircle } as const;
const successNotice = { start: "started", complete: "completed", cancel: "cancelled" } as const;
const intros = { start: "startIntro", complete: "completeIntro", cancel: "cancelIntro" } as const;

export function SessionTransitionDialog({ session, action, onSaved, onReload }: {
  session: TrainingSession;
  action: SessionAction;
  onSaved: (notice: SessionCopyKey) => void;
  onReload: () => void;
}) {
  const { copy } = useSessionsCopy();
  const [base, setBase] = useState<TrainingSession | null>(null);
  const [busy, setBusy] = useState(false);
  const Icon = actionIcons[action];
  return (
    <Dialog open={Boolean(base)} onOpenChange={(open) => { if (!busy) setBase(open ? session : null); }}>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11 gap-2" variant={action === "cancel" ? "outline" : "default"}>
          <Icon className="size-4" aria-hidden="true" />
          {copy(action)}
        </Button>
      </DialogTrigger>
      {base && <TransitionForm session={base} action={action} onBusy={setBusy} onSaved={() => {
        setBase(null);
        onSaved(successNotice[action]);
      }} onReload={() => { setBase(null); onReload(); }} />}
    </Dialog>
  );
}

function TransitionForm({ session, action, onBusy, onSaved, onReload }: {
  session: TrainingSession;
  action: SessionAction;
  onBusy: (busy: boolean) => void;
  onSaved: () => void;
  onReload: () => void;
}) {
  const { copy, direction } = useSessionsCopy();
  const [reason, setReason] = useState("");
  const [missingReason, setMissingReason] = useState(false);
  const reasonId = useId();
  const mutation = useTransitionSession(session, action);
  const error = mutation.error ? sessionErrorKey(mutation.error, "transition") : null;
  return (
    <DialogContent dir={direction} className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>{copy(action)}</DialogTitle><DialogDescription>{copy(intros[action])}</DialogDescription></DialogHeader>
      <form className="min-w-0 space-y-4" aria-busy={mutation.isPending} noValidate onSubmit={(event) => {
        event.preventDefault();
        if (mutation.isPending || error === "conflict") return;
        const cleanReason = stripHtmlTags(reason).trim();
        if (action === "cancel" && !cleanReason) {
          setMissingReason(true);
          return;
        }
        onBusy(true);
        mutation.mutate(action === "cancel" ? cleanReason : undefined, {
          onSuccess: onSaved,
          onSettled: () => onBusy(false),
        });
      }}>
        {action === "cancel" && (
          <div className="space-y-1.5">
            <Label htmlFor={reasonId}>{copy("reason")}</Label>
            <Textarea id={reasonId} required aria-invalid={missingReason} disabled={mutation.isPending}
              rows={3} maxLength={500} value={reason} onChange={(event) => { setReason(event.target.value); setMissingReason(false); }} />
          </div>
        )}
        {missingReason && <SessionFailure error="reasonRequired" copy={copy} />}
        {error && <SessionFailure error={error} copy={copy} retry={error === "conflict" ? onReload : undefined} retryLabel="reload" />}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={mutation.isPending}>{copy("close")}</Button></DialogClose>
          <Button type="submit" loading={mutation.isPending} disabled={error === "conflict"}
            variant={action === "cancel" ? "destructive" : "default"}>{copy(mutation.isPending ? "saving" : action)}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
