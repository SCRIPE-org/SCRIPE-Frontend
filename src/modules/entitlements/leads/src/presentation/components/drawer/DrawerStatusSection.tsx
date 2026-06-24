// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import {
  Mail,
  CheckCheck,
  ArrowRightCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead, LeadStatus } from "../../../domain/entities/PlatformLead";
import { ALL_STATUSES, STATUS_STYLES } from "./DrawerShared";

interface StatusSectionProps {
  lead: PlatformLead;
  currentStatus: LeadStatus;
  pendingStatus: LeadStatus | null;
  statusNote: string;
  showStatusNote: boolean;
  isUpdatingStatus: boolean;
  statusNoteSaved: boolean;
  onStatusClick: (s: LeadStatus) => void;
  onStatusNoteChange: (v: string) => void;
  onSaveStatus: () => Promise<void>;
  sendEmailToggle: boolean;
  onSendEmailToggleChange: (v: boolean) => void;
  emailSubject: string;
  onEmailSubjectChange: (v: string) => void;
  emailBody: string;
  onEmailBodyChange: (v: string) => void;
  isFetchingPreview: boolean;
}

/**
 * React presentation component representing the drawer status section UI element.
 */
export function DrawerStatusSection({
  lead,
  currentStatus,
  pendingStatus,
  statusNote,
  showStatusNote,
  isUpdatingStatus,
  statusNoteSaved,
  onStatusClick,
  onStatusNoteChange,
  onSaveStatus,
  sendEmailToggle,
  onSendEmailToggleChange,
  emailSubject,
  onEmailSubjectChange,
  emailBody,
  onEmailBodyChange,
  isFetchingPreview,
}: StatusSectionProps) {
  const { t } = useI18n();
  const hasChanges =
    (pendingStatus !== null && pendingStatus !== lead.status) || statusNote.trim().length > 0;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        <ArrowRightCircle className="h-3.5 w-3.5" />
        {t("leads.drawer.sections.crmStatus")}
      </p>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.filter((s) => s !== "Converted").map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusClick(s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              currentStatus === s
                ? `${STATUS_STYLES[s].badge} ring-1 ${STATUS_STYLES[s].ring}`
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[s].dot}`} />
            {t(`leads.status.${s}`)}
          </button>
        ))}
      </div>

      {/* Note textarea */}
      {(showStatusNote || hasChanges) && (
        <div className="space-y-2">
          <Textarea
            value={statusNote}
            onChange={(e) => onStatusNoteChange(e.target.value)}
            placeholder={t("leads.drawer.status.notePlaceholder")}
            rows={2}
            className="resize-none border-zinc-700 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
          />

          {/* Email Notification Toggle */}
          {pendingStatus && pendingStatus !== lead.status && pendingStatus !== "New" && (
            <div className="mt-2 space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 transition-all duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="send-email-status-change"
                    className="cursor-pointer select-none text-xs font-semibold text-zinc-200"
                  >
                    {t("leads.email.sendNotificationToggle") ||
                      "Send status notification email to lead"}
                  </Label>
                  <p className="text-[10px] leading-relaxed text-zinc-500">
                    {t("leads.email.sendNotificationToggleDesc") ||
                      "Send an automated status update email to the lead."}
                  </p>
                </div>
                <Switch
                  id="send-email-status-change"
                  checked={sendEmailToggle}
                  onCheckedChange={onSendEmailToggleChange}
                />
              </div>

              {sendEmailToggle && (
                <div className="space-y-4 border-t border-zinc-800/80 pt-4 duration-200 animate-in fade-in slide-in-from-top-1">
                  {isFetchingPreview ? (
                    <div className="animate-pulse space-y-3 py-2">
                      <div className="h-4 w-1/4 rounded bg-zinc-800" />
                      <div className="h-9 w-full rounded bg-zinc-800" />
                      <div className="h-4 w-1/3 rounded bg-zinc-800" />
                      <div className="h-28 w-full rounded bg-zinc-800" />
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-lg border-s-2 border-indigo-500/80 bg-zinc-950/60 p-3.5">
                      <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-1.5">
                        <Mail className="h-4 w-4 text-indigo-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          {t("leads.email.draftPreviewHeader") || "Notification Draft Preview"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          {t("leads.email.subject") || "Subject"}
                        </Label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => onEmailSubjectChange(e.target.value)}
                          placeholder={
                            t("leads.email.subjectPlaceholder") || "Enter email subject..."
                          }
                          className="h-9 border-zinc-800 bg-zinc-900/60 text-xs text-white placeholder:text-zinc-600 focus:border-zinc-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          {t("leads.email.body") || "Message Body"}
                        </Label>
                        <Textarea
                          value={emailBody}
                          onChange={(e) => onEmailBodyChange(e.target.value)}
                          placeholder={
                            t("leads.email.bodyPlaceholder") || "Write your message..."
                          }
                          rows={6}
                          className="custom-scrollbar resize-none border-zinc-800 bg-zinc-900/60 font-sans text-xs leading-relaxed text-white placeholder:text-zinc-600 focus:border-zinc-700"
                        />
                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] italic text-zinc-500">
                          <Info className="h-3 w-3 shrink-0 text-indigo-500/80" />
                          <span>
                            {t("leads.email.bodyHint") ||
                              "The email will be formatted as paragraphs and wrapped in the branded SCRIPE template automatically."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={onSaveStatus}
            disabled={isUpdatingStatus || !hasChanges}
            className="h-8 w-full bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t("leads.drawer.status.saving")}
              </>
            ) : statusNoteSaved ? (
              <>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                {t("leads.drawer.status.saved")}
              </>
            ) : (
              t("leads.drawer.status.save")
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
