"use client";

import type React from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Send } from "lucide-react";

export interface SendCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRtl: boolean;
  t: (key: string) => string;
  commChannel: "Email" | "Proposal" | "WhatsApp";
  onChannelChange: (channel: "Email" | "Proposal" | "WhatsApp") => void;
  commRecipient: string;
  onRecipientChange: (val: string) => void;
  commSubject: string;
  onSubjectChange: (val: string) => void;
  commBody: string;
  onBodyChange: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/** Modal dialog for dispatching Email, Proposal, or WhatsApp logs into the CRM timeline. */
export function SendCommunicationDialog({
  open,
  onOpenChange,
  isRtl,
  t,
  commChannel,
  onChannelChange,
  commRecipient,
  onRecipientChange,
  commSubject,
  onSubjectChange,
  commBody,
  onBodyChange,
  isSubmitting,
  onSubmit,
}: SendCommunicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="send-communication-dialog"
        className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
              <Send className="size-4 text-nx-accent" />
              <span>{t("crmActivities.communication.dialogTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmActivities.communication.dialogDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              {(["Email", "Proposal", "WhatsApp"] as const).map((ch) => (
                <Button
                  key={ch}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChannelChange(ch)}
                  className={`h-8 text-xs ${
                    commChannel === ch
                      ? "border-primary bg-nx-surface text-nx-ink font-bold"
                      : "border-nx-line bg-nx-raised text-nx-ink-2"
                  }`}
                >
                  {t(`crmActivities.communication.channels.${ch}`)}
                </Button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comm-recipient" className="text-nx-ink font-semibold">
                {t("crmActivities.communication.recipientLabel")}
              </Label>
              <Input
                id="comm-recipient"
                data-testid="comm-recipient-input"
                value={commRecipient}
                onChange={(e) => onRecipientChange(e.target.value)}
                placeholder={t("crmActivities.communication.recipientPlaceholder")}
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comm-subject" className="text-nx-ink font-semibold">
                {t("crmActivities.communication.subjectLabel")} *
              </Label>
              <Input
                id="comm-subject"
                data-testid="comm-subject-input"
                value={commSubject}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder={t("crmActivities.communication.subjectPlaceholder")}
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comm-body" className="text-nx-ink font-semibold">
                {t("crmActivities.communication.bodyLabel")}
              </Label>
              <Textarea
                id="comm-body"
                data-testid="comm-body-textarea"
                value={commBody}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={4}
                placeholder={t("crmActivities.communication.bodyPlaceholder")}
                className="text-xs bg-nx-ground border-nx-line text-nx-ink resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line text-nx-ink-2"
            >
              {t("crmActivities.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              data-testid="submit-send-communication-btn"
              disabled={isSubmitting || !commSubject.trim()}
              className="h-8 text-xs font-bold gap-1.5"
            >
              <Send className="size-3.5" />
              <span>
                {isSubmitting
                  ? t("crmActivities.communication.dispatchingBtn")
                  : t("crmActivities.communication.sendAndLogBtn")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
