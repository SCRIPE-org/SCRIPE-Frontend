"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LogIn, UserX } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/ui/alert-dialog";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type {
  Booking360OperationalAction,
  Booking360OperationalFeedback,
  Booking360Status,
} from "../../domain/entities/Booking360";

import { BookingCancelDialog } from "./BookingCancelDialog";
import { BookingChangeResourceDialog } from "./BookingChangeResourceDialog";
import { BookingRescheduleDialog } from "./BookingRescheduleDialog";

export const NO_SHOW_REASON_MAX_LENGTH = 1000;

interface Props {
  status: Booking360Status;
  activeAction: Booking360OperationalAction | null;
  feedback: Booking360OperationalFeedback | null;
  canCheckIn: boolean;
  canComplete: boolean;
  canMarkNoShow: boolean;
  canCancel?: boolean;
  canReschedule?: boolean;
  canChangeResource?: boolean;
  direction: "ltr" | "rtl";
  bookingReference?: string;
  customerName?: string;
  resourceId?: string;
  resourceName?: string;
  facilityId?: string;
  facilityName?: string;
  timeZoneId?: string;
  quantity?: number;
  scheduledTime?: string;
  currentStartUtc?: string;
  currentEndUtc?: string;
  currentTotal?: number;
  currencyCode?: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  onCheckIn: () => void;
  onComplete: () => void;
  onMarkNoShow: (reason: string) => void;
  onCancel?: (reason: string) => void;
  onReschedule?: (input: { resourceId: string; requestedStartUtc: string; requestedEndUtc: string }) => void;
  onChangeResource?: (input: { targetResourceId: string; requestedStartUtc: string; requestedEndUtc: string }) => void;
}

function feedbackVariant(kind: Booking360OperationalFeedback["kind"]) {
  if (kind === "success") return "success" as const;
  if (kind === "network" || kind === "validation") return "destructive" as const;
  if (kind === "feature") return "info" as const;
  return "warning" as const;
}

function feedbackMessage(
  feedback: Booking360OperationalFeedback,
  t: Props["t"]
): string {
  if (feedback.kind === "success") {
    return t(`booking360.operations.feedback.success.${feedback.action}`);
  }
  if (feedback.kind === "invalidState" || feedback.kind === "permission") {
    return t(`booking360.operations.feedback.${feedback.kind}.${feedback.action}`, {
      status: feedback.status ? t(`booking360.status.${feedback.status}`) : "",
    });
  }
  return t(`booking360.operations.feedback.${feedback.kind}`, {
    status: feedback.status ? t(`booking360.status.${feedback.status}`) : "",
  });
}

export function BookingOperationalActions(props: Props) {
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [changeResourceOpen, setChangeResourceOpen] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const normalizedReason = noShowReason.trim();
  const reasonMissing = normalizedReason.length === 0;
  const reasonTooLong = normalizedReason.length > NO_SHOW_REASON_MAX_LENGTH;
  const reasonInvalid = reasonMissing || reasonTooLong;
  const confirmed = props.status === "Confirmed";
  const checkedIn = props.status === "CheckedIn";
  const cancellable = ["Draft", "Requested", "Held", "PendingApproval", "Confirmed"].includes(props.status);
  const hasAction = (confirmed && (props.canCheckIn || props.canMarkNoShow || props.canCancel || props.canReschedule || props.canChangeResource)) ||
    (checkedIn && props.canComplete) || (cancellable && props.canCancel);

  useEffect(() => {
    if (props.feedback) regionRef.current?.focus();
  }, [props.feedback]);

  if (!hasAction && !props.feedback) return null;

  const changeDialog = (open: boolean) => {
    setNoShowOpen(open);
    if (!open) {
      setNoShowReason("");
      setReasonTouched(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.t("booking360.operations.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={regionRef}
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          aria-label={props.t("booking360.operations.title")}
          className="space-y-4 outline-none focus-visible:rounded-nx-sm focus-visible:shadow-nx-focus"
          data-testid="booking-operational-actions"
        >
          {props.feedback && (
            <Alert variant={feedbackVariant(props.feedback.kind)} role="status">
              <AlertDescription>{feedbackMessage(props.feedback, props.t)}</AlertDescription>
            </Alert>
          )}

          {hasAction && (
            <div className="flex flex-wrap gap-3 items-center">
              {confirmed && props.canCheckIn && (
                <Button
                  type="button"
                  className="font-bold shadow-sm bg-nx-accent hover:opacity-95 text-white gap-2 px-5"
                  loading={props.activeAction === "checkIn"}
                  disabled={props.activeAction !== null}
                  onClick={props.onCheckIn}
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  {props.activeAction === "checkIn"
                    ? props.t("booking360.actions.checkingIn")
                    : props.t("booking360.actions.checkIn")}
                </Button>
              )}

              {checkedIn && props.canComplete && (
                <Button
                  type="button"
                  className="font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-5"
                  loading={props.activeAction === "complete"}
                  disabled={props.activeAction !== null}
                  onClick={props.onComplete}
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {props.activeAction === "complete"
                    ? props.t("booking360.actions.completing")
                    : props.t("booking360.actions.complete")}
                </Button>
              )}

              {confirmed && props.canReschedule && props.onReschedule && props.resourceId && props.currentStartUtc && props.currentEndUtc && (
                <BookingRescheduleDialog
                  open={rescheduleOpen}
                  onOpenChange={setRescheduleOpen}
                  resourceId={props.resourceId}
                  resourceName={props.resourceName ?? ""}
                  facilityName={props.facilityName ?? ""}
                  currentStartUtc={props.currentStartUtc}
                  currentEndUtc={props.currentEndUtc}
                  timeZoneId={props.timeZoneId ?? "UTC"}
                  quantity={props.quantity ?? 1}
                  direction={props.direction}
                  disabled={props.activeAction !== null}
                  currentTotal={props.currentTotal}
                  currencyCode={props.currencyCode}
                  t={props.t}
                  onConfirmReschedule={(input) => {
                    setRescheduleOpen(false);
                    props.onReschedule?.(input);
                  }}
                />
              )}

              {confirmed && props.canChangeResource && props.onChangeResource && props.facilityId && props.resourceId && props.currentStartUtc && props.currentEndUtc && (
                <BookingChangeResourceDialog
                  open={changeResourceOpen}
                  onOpenChange={setChangeResourceOpen}
                  facilityId={props.facilityId}
                  currentResourceId={props.resourceId}
                  currentResourceName={props.resourceName ?? ""}
                  currentFacilityName={props.facilityName ?? ""}
                  currentStartUtc={props.currentStartUtc}
                  currentEndUtc={props.currentEndUtc}
                  timeZoneId={props.timeZoneId ?? "UTC"}
                  quantity={props.quantity ?? 1}
                  direction={props.direction}
                  disabled={props.activeAction !== null}
                  currentTotal={props.currentTotal}
                  currencyCode={props.currencyCode}
                  t={props.t}
                  onConfirmChangeResource={(input) => {
                    setChangeResourceOpen(false);
                    props.onChangeResource?.(input);
                  }}
                />
              )}

              {confirmed && props.canMarkNoShow && (
                <AlertDialog open={noShowOpen} onOpenChange={changeDialog}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" disabled={props.activeAction !== null}>
                      <UserX className="size-4" aria-hidden="true" />
                      {props.t("booking360.actions.markNoShow")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={props.direction}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{props.t("booking360.noShow.title")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {props.t("booking360.noShow.description")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {(props.bookingReference || props.customerName || props.resourceName || props.scheduledTime) && (
                      <div className="mx-6 rounded-nx-sm border border-nx-line bg-nx-raised p-3 text-xs space-y-1.5" data-testid="no-show-booking-context">
                        {props.bookingReference && (
                          <div className="flex justify-between">
                            <span className="text-nx-ink-2">{props.t("booking360.schedule.reference")}:</span>
                            <span className="font-semibold text-nx-ink tabular-nums" dir="ltr">{props.bookingReference}</span>
                          </div>
                        )}
                        {props.customerName && (
                          <div className="flex justify-between">
                            <span className="text-nx-ink-2">{props.t("booking360.customer.title")}:</span>
                            <span className="font-medium text-nx-ink">{props.customerName}</span>
                          </div>
                        )}
                        {props.resourceName && (
                          <div className="flex justify-between">
                            <span className="text-nx-ink-2">{props.t("booking360.schedule.resource")}:</span>
                            <span className="font-medium text-nx-ink">{props.resourceName}</span>
                          </div>
                        )}
                        {props.scheduledTime && (
                          <div className="flex justify-between">
                            <span className="text-nx-ink-2">{props.t("booking360.schedule.time")}:</span>
                            <span className="font-medium text-nx-ink tabular-nums">{props.scheduledTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-2 px-6 py-4">
                      <Label htmlFor="booking-no-show-reason">
                        {props.t("booking360.noShow.reasonLabel")}
                      </Label>
                      <Textarea
                        id="booking-no-show-reason"
                        value={noShowReason}
                        maxLength={NO_SHOW_REASON_MAX_LENGTH}
                        required
                        aria-invalid={reasonTouched && reasonInvalid}
                        aria-describedby={reasonTouched && reasonInvalid
                          ? "booking-no-show-reason-error"
                          : "booking-no-show-reason-hint"}
                        onBlur={() => setReasonTouched(true)}
                        onChange={(event) => setNoShowReason(event.target.value)}
                      />
                      {reasonTouched && reasonInvalid ? (
                        <p id="booking-no-show-reason-error" className="text-sm text-destructive" role="alert">
                          {props.t(reasonTooLong
                            ? "booking360.noShow.reasonTooLong"
                            : "booking360.noShow.reasonRequired", { max: NO_SHOW_REASON_MAX_LENGTH })}
                        </p>
                      ) : (
                        <p id="booking-no-show-reason-hint" className="text-xs text-nx-ink-3">
                          {props.t("booking360.noShow.reasonHint", { max: NO_SHOW_REASON_MAX_LENGTH })}
                        </p>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{props.t("booking360.noShow.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={props.activeAction !== null}
                        onClick={(event) => {
                          setReasonTouched(true);
                          if (reasonInvalid) {
                            event.preventDefault();
                            return;
                          }
                          props.onMarkNoShow(normalizedReason);
                        }}
                      >
                        {props.t("booking360.noShow.confirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {cancellable && props.canCancel && props.onCancel && (
                <BookingCancelDialog
                  open={cancelOpen}
                  onOpenChange={setCancelOpen}
                  bookingReference={props.bookingReference}
                  customerName={props.customerName}
                  resourceName={props.resourceName}
                  scheduledTime={props.scheduledTime}
                  direction={props.direction}
                  disabled={props.activeAction !== null}
                  t={props.t}
                  onConfirmCancel={(reason) => {
                    setCancelOpen(false);
                    props.onCancel?.(reason);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
