// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { Skeleton } from "@core/ui/skeleton";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Mail, CheckCheck, ArrowRightCircle, Info } from "lucide-react";
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
 * Presentation UI component rendering the drawer status section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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
    <div className="space-y-3 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_40%,transparent)] p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-nx-ink-3">
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
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none ${
              currentStatus === s
                ? `${STATUS_STYLES[s].badge} ring-1 ${STATUS_STYLES[s].ring}`
                : "border-nx-line bg-nx-surface text-nx-ink-2 hover:border-nx-line-hi hover:text-nx-ink"
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
            className="resize-none border-nx-line bg-nx-ground text-sm text-nx-ink placeholder:text-nx-ink-3"
          />

          {/* Email Notification Toggle */}
          {pendingStatus && pendingStatus !== lead.status && pendingStatus !== "New" && (
            <div className="mt-2 space-y-4 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-ground)_40%,transparent)] p-4 transition-[background-color,border-color] duration-nx-panel ease-nx-enter motion-reduce:transition-none">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="send-email-status-change"
                    className="cursor-pointer select-none text-xs font-semibold text-nx-ink"
                  >
                    {t("leads.email.sendNotificationToggle")}
                  </Label>
                  <p className="text-[10px] leading-relaxed text-nx-ink-3">
                    {t("leads.email.sendNotificationToggleDesc")}
                  </p>
                </div>
                <Switch
                  id="send-email-status-change"
                  checked={sendEmailToggle}
                  onCheckedChange={onSendEmailToggleChange}
                />
              </div>

              {sendEmailToggle && (
                <div className="space-y-4 border-t border-nx-line pt-4 duration-nx-standard ease-nx-enter animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none">
                  {isFetchingPreview ? (
                    <div className="space-y-3 py-2">
                      <Skeleton shape="text" className="h-4 w-1/4" />
                      <Skeleton shape="control" className="h-9 w-full" />
                      <Skeleton shape="text" className="h-4 w-1/3" />
                      <Skeleton shape="block" className="h-28 w-full rounded-nx-md" />
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-nx-md border border-info/25 bg-[color:color-mix(in_srgb,var(--nx-ground)_60%,transparent)] p-3.5">
                      <div className="flex items-center gap-2 border-b border-nx-line pb-1.5">
                        <Mail className="h-4 w-4 text-info" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
                          {t("leads.email.draftPreviewHeader")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
                          {t("leads.email.subject")}
                        </Label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => onEmailSubjectChange(e.target.value)}
                          placeholder={t("leads.email.subjectPlaceholder")}
                          className="h-9 border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_60%,transparent)] text-xs text-nx-ink placeholder:text-nx-ink-3 focus:border-nx-line-hi"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-nx-ink-3">
                          {t("leads.email.body")}
                        </Label>
                        <Textarea
                          value={emailBody}
                          onChange={(e) => onEmailBodyChange(e.target.value)}
                          placeholder={t("leads.email.bodyPlaceholder")}
                          rows={6}
                          className="custom-scrollbar resize-none border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_60%,transparent)] font-sans text-xs leading-relaxed text-nx-ink placeholder:text-nx-ink-3 focus:border-nx-line-hi"
                        />
                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] italic text-nx-ink-3">
                          <Info className="h-3 w-3 shrink-0 text-info/80" aria-hidden="true" />
                          <span>{t("leads.email.bodyHint")}</span>
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
            className="h-8 w-full bg-info text-xs font-semibold text-info-foreground hover:bg-info/90 disabled:opacity-40"
          >
            {isUpdatingStatus ? (
              <>
                <LoadingSpinner size="inline" showText={false} className="me-1.5" />
                {t("leads.drawer.status.saving")}
              </>
            ) : statusNoteSaved ? (
              <>
                <CheckCheck className="me-1.5 h-3.5 w-3.5 text-success" />
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
