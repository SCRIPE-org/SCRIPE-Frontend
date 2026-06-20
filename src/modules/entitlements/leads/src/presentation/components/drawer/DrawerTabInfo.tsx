
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import {
  Mail, Phone, Globe, Clock, Tag, Users, Zap, Building2,
  MessageSquare, StickyNote, CheckCheck, ArrowRightCircle, Loader2, Info,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead, LeadStatus } from "../../../domain/entities/PlatformLead";
import { SectionCard, InfoRow, ALL_STATUSES, STATUS_STYLES } from "./DrawerShared";

// ── Props ─────────────────────────────────────────────────────────────────────

interface TabInfoProps {
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

// ── Component ─────────────────────────────────────────────────────────────────

export function DrawerTabInfo({
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
}: TabInfoProps) {
  const { t } = useI18n();

  const di = lead.discoveryTagKeys;
  const hasDiscovery = di && (di.businessTypeKey ?? di.teamSizeKey ?? di.priority);
  const hasChanges = (pendingStatus !== null && pendingStatus !== lead.status) || statusNote.trim().length > 0;

  return (
    <div className="space-y-3 p-4">
      {/* Contact */}
      <SectionCard title={t("leads.drawer.sections.contact")} icon={Mail}>
        <div className="space-y-1 divide-y divide-zinc-800/40">
          <InfoRow icon={Mail}  label={t("leads.drawer.contact.email")}   value={lead.email}     copyable={lead.email} />
          {lead.phone
            ? <InfoRow icon={Phone} label={t("leads.drawer.contact.phone")}   value={lead.phone}     copyable={lead.phone} />
            : <InfoRow icon={Phone} label={t("leads.drawer.contact.phone")}   value={<span className="text-xs italic text-zinc-600">{t("leads.drawer.contact.phoneMissing")}</span>} />}
          <InfoRow icon={Globe} label={t("leads.drawer.contact.source")}  value={t(lead.sourceKey)} />
          <InfoRow icon={Clock} label={t("leads.drawer.contact.submitted")} value={
            `${lead.relativeCreatedAt} · ${new Date(lead.requestedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
          } />
        </div>
      </SectionCard>

      {/* Discovery Intelligence */}
      {hasDiscovery && (
        <SectionCard
          title={t("leads.drawer.sections.discovery")}
          icon={Zap}
          accent="border-violet-500/20 bg-violet-500/5"
        >
          <div className="space-y-3">
            {di?.businessTypeKey && (
              <div className="flex items-center gap-3">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                <div>
                  <p className="text-[10px] text-zinc-500">{t("leads.discovery.industry")}</p>
                  <p className="text-sm font-medium text-violet-200">{t(di.businessTypeKey)}</p>
                </div>
              </div>
            )}
            {di?.teamSizeKey && (
              <div className="flex items-center gap-3">
                <Users className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                <div>
                  <p className="text-[10px] text-zinc-500">{t("leads.discovery.teamSize")}</p>
                  <p className="text-sm font-medium text-violet-200">{t(di.teamSizeKey)} {t("leads.discovery.teamSizeSuffix")}</p>
                </div>
              </div>
            )}
            {di?.priority && (
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-zinc-500">{t("leads.discovery.priority")}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {di.priority.split(",").map((p) => {
                      const clean = p.trim().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <span
                          key={p}
                          className="inline-flex items-center rounded bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-300 ring-1 ring-inset ring-violet-500/20"
                        >
                          {clean}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Message */}
      {lead.message && (
        <SectionCard title={t("leads.drawer.sections.message")} icon={MessageSquare}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{lead.message}</p>
        </SectionCard>
      )}

      {/* Sales Notes */}
      {lead.notes && (
        <SectionCard title={t("leads.drawer.sections.salesNotes")} icon={StickyNote} accent="border-amber-500/20 bg-amber-500/5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-200/80">{lead.notes}</p>
        </SectionCard>
      )}

      {/* Conversion banner */}
      {lead.isConverted && lead.convertedAt && (
        <SectionCard title={t("leads.drawer.sections.conversion")} icon={CheckCheck} accent="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-sm font-semibold text-emerald-300">{t("leads.drawer.conversion.converted")}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {new Date(lead.convertedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </SectionCard>
      )}

      {/* Status change inline */}
      {!lead.isConverted && (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <ArrowRightCircle className="h-3.5 w-3.5" />
            {t("leads.drawer.sections.crmStatus")}
          </p>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.filter(s => s !== "Converted").map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusClick(s)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all
                  ${currentStatus === s
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
                <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 mt-2 transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="send-email-status-change"
                        className="text-xs font-semibold text-zinc-200 cursor-pointer select-none"
                      >
                        {t("leads.email.sendNotificationToggle") || "Send status notification email to lead"}
                      </Label>
                      <p className="text-[10px] leading-relaxed text-zinc-500">
                        {t("leads.email.sendNotificationToggleDesc") || "Send an automated status update email to the lead."}
                      </p>
                    </div>
                    <Switch
                      id="send-email-status-change"
                      checked={sendEmailToggle}
                      onCheckedChange={onSendEmailToggleChange}
                    />
                  </div>

                  {sendEmailToggle && (
                    <div className="space-y-4 pt-4 border-t border-zinc-800/80 animate-in fade-in slide-in-from-top-1 duration-200">
                      {isFetchingPreview ? (
                        <div className="space-y-3 py-2 animate-pulse">
                          <div className="h-4 w-1/4 rounded bg-zinc-800" />
                          <div className="h-9 w-full rounded bg-zinc-800" />
                          <div className="h-4 w-1/3 rounded bg-zinc-800" />
                          <div className="h-28 w-full rounded bg-zinc-800" />
                        </div>
                      ) : (
                        <div className="space-y-4 rounded-lg border-s-2 border-indigo-500/80 bg-zinc-950/60 p-3.5">
                          <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
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
                              placeholder={t("leads.email.subjectPlaceholder") || "Enter email subject..."}
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
                              placeholder={t("leads.email.bodyPlaceholder") || "Write your message..."}
                              rows={6}
                              className="border-zinc-800 bg-zinc-900/60 text-xs text-white placeholder:text-zinc-600 resize-none font-sans leading-relaxed focus:border-zinc-700 custom-scrollbar"
                            />
                            <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-zinc-500 italic">
                              <Info className="h-3 w-3 text-indigo-500/80 shrink-0" />
                              <span>
                                {t("leads.email.bodyHint") || "The email will be formatted as paragraphs and wrapped in the branded SCRIPE template automatically."}
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
                {isUpdatingStatus
                  ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t("leads.drawer.status.saving")}</>
                  : statusNoteSaved
                  ? <><CheckCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />{t("leads.drawer.status.saved")}</>
                  : t("leads.drawer.status.save")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
