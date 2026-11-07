"use client";

import { AlertCircle, CalendarClock } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { SessionStatus, TrainingSession } from "../../domain/entities/TrainingSession";
import { formatSessionTime } from "../../domain/session-time";
import type { SessionCopyKey, useSessionsCopy } from "../viewmodels/useSessionsCopy";

export type SessionCopy = ReturnType<typeof useSessionsCopy>["copy"];

const statusVariants = {
  Scheduled: "info",
  InProgress: "warning",
  Completed: "success",
  Cancelled: "destructive",
} as const;

export function SessionStatusBadge({ status, copy }: { status: SessionStatus; copy: SessionCopy }) {
  return <Badge variant={statusVariants[status]}>{copy(status)}</Badge>;
}

export function SessionTimeRange({ session, copy, language }: {
  session: TrainingSession; copy: SessionCopy; language: "ar" | "en";
}) {
  const { startUtc, endUtc, timeZoneId } = session.data;
  return (
    <div className="flex items-start gap-2">
      <CalendarClock className="mt-0.5 size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <div className="min-w-0 space-y-0.5 text-sm text-nx-ink-2">
        <p><span className="sr-only">{copy("starts")}: </span><time dateTime={startUtc}>{formatSessionTime(startUtc, timeZoneId, language)}</time></p>
        <p><span className="sr-only">{copy("ends")}: </span><time dateTime={endUtc}>{formatSessionTime(endUtc, timeZoneId, language)}</time></p>
        <bdi className="text-xs text-nx-ink-2">{timeZoneId}</bdi>
      </div>
    </div>
  );
}

export function SessionFailure({ error, copy, retry, retryLabel = "retry" }: {
  error: SessionCopyKey; copy: SessionCopy; retry?: () => void; retryLabel?: SessionCopyKey;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertDescription>{copy(error)}</AlertDescription>
      {retry && <div className="mt-2"><Button type="button" variant="outline" size="sm" onClick={retry}>{copy(retryLabel)}</Button></div>}
    </Alert>
  );
}

export interface NamedOption {
  value: string;
  label: string;
}

export function SessionSelect({ id, label, value, onValueChange, options, placeholder, disabled, required, displayValue }: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: NamedOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  displayValue?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
        <SelectTrigger id={id} aria-required={required} className="min-h-11">
          <SelectValue placeholder={placeholder}>{displayValue}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function preferredName(language: "ar" | "en", en?: string | null, ar?: string | null) {
  return language === "ar" ? ar || en : en || ar;
}
