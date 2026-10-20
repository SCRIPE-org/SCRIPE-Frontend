"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface GuestBookingCancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationNumber: string;
  onConfirmCancel: (reason: string) => Promise<void>;
  loading: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function GuestBookingCancelModal({
  open,
  onOpenChange,
  reservationNumber,
  onConfirmCancel,
  loading,
  t,
}: GuestBookingCancelModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirmCancel(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {t("guestPortal.cancelModal.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-nx-ink-2 leading-relaxed">
            {t("guestPortal.cancelModal.description", { reservationNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-medium text-nx-ink">
              {t("guestPortal.cancelModal.reasonLabel")}
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("guestPortal.cancelModal.reasonPlaceholder")}
              rows={3}
              maxLength={500}
              className="resize-none text-sm"
              disabled={loading}
            />
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {t("guestPortal.cancelModal.warning")}
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t("guestPortal.actions.keepBooking")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto font-medium"
          >
            {loading ? t("guestPortal.actions.cancelling") : t("guestPortal.actions.confirmCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
