"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
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
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";

export const CANCEL_REASON_MAX_LENGTH = 1000;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingReference?: string;
  customerName?: string;
  resourceName?: string;
  scheduledTime?: string;
  direction: "ltr" | "rtl";
  disabled: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onConfirmCancel: (reason: string) => void;
}

export function BookingCancelDialog(props: Props) {
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);

  const normalizedReason = reason.trim();
  const reasonMissing = normalizedReason.length === 0;
  const reasonTooLong = normalizedReason.length > CANCEL_REASON_MAX_LENGTH;
  const reasonInvalid = reasonMissing || reasonTooLong;

  const handleOpenChange = (open: boolean) => {
    props.onOpenChange(open);
    if (!open) {
      setReason("");
      setReasonTouched(false);
    }
  };

  return (
    <AlertDialog open={props.open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={props.disabled} className="text-destructive hover:bg-destructive/10">
          <UserX className="size-4" aria-hidden="true" />
          {props.t("booking360.actions.cancel")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir={props.direction}>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.t("booking360.cancel.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.t("booking360.cancel.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {(props.bookingReference || props.customerName || props.resourceName || props.scheduledTime) && (
          <div className="mx-6 rounded-nx-sm border border-nx-line bg-nx-raised p-3 text-xs space-y-1.5" data-testid="cancel-booking-context">
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
          <Label htmlFor="booking-cancel-reason">
            {props.t("booking360.cancel.reasonLabel")}
          </Label>
          <Textarea
            id="booking-cancel-reason"
            value={reason}
            maxLength={CANCEL_REASON_MAX_LENGTH}
            required
            aria-invalid={reasonTouched && reasonInvalid}
            aria-describedby={reasonTouched && reasonInvalid ? "booking-cancel-reason-error" : "booking-cancel-reason-hint"}
            onBlur={() => setReasonTouched(true)}
            onChange={(e) => setReason(e.target.value)}
          />
          {reasonTouched && reasonInvalid ? (
            <p id="booking-cancel-reason-error" className="text-sm text-destructive" role="alert">
              {props.t(reasonTooLong ? "booking360.cancel.reasonTooLong" : "booking360.cancel.reasonRequired", { max: CANCEL_REASON_MAX_LENGTH })}
            </p>
          ) : (
            <p id="booking-cancel-reason-hint" className="text-xs text-nx-ink-3">
              {props.t("booking360.cancel.reasonHint", { max: CANCEL_REASON_MAX_LENGTH })}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{props.t("booking360.cancel.keep")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={props.disabled}
            onClick={(event) => {
              setReasonTouched(true);
              if (reasonInvalid) {
                event.preventDefault();
                return;
              }
              props.onConfirmCancel(normalizedReason);
            }}
          >
            {props.t("booking360.cancel.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
