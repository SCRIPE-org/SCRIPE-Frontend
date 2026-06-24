// UI-EXCEPTION: compact studio layout

import {
  Mail,
  Phone,
  Globe,
  Clock,
  Tag,
  Users,
  Zap,
  Building2,
  MessageSquare,
  StickyNote,
  CheckCheck,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead, LeadStatus } from "../../../domain/entities/PlatformLead";
import { SectionCard, InfoRow } from "./DrawerShared";
import { DrawerStatusSection } from "./DrawerStatusSection";

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
  const hasChanges =
    (pendingStatus !== null && pendingStatus !== lead.status) || statusNote.trim().length > 0;

  return (
    <div className="space-y-3 p-4">
      {/* Contact */}
      <SectionCard title={t("leads.drawer.sections.contact")} icon={Mail}>
        <div className="space-y-1 divide-y divide-zinc-800/40">
          <InfoRow
            icon={Mail}
            label={t("leads.drawer.contact.email")}
            value={lead.email}
            copyable={lead.email}
          />
          {lead.phone ? (
            <InfoRow
              icon={Phone}
              label={t("leads.drawer.contact.phone")}
              value={lead.phone}
              copyable={lead.phone}
            />
          ) : (
            <InfoRow
              icon={Phone}
              label={t("leads.drawer.contact.phone")}
              value={
                <span className="text-xs italic text-zinc-600">
                  {t("leads.drawer.contact.phoneMissing")}
                </span>
              }
            />
          )}
          <InfoRow
            icon={Globe}
            label={t("leads.drawer.contact.source")}
            value={t(lead.sourceKey)}
          />
          <InfoRow
            icon={Clock}
            label={t("leads.drawer.contact.submitted")}
            value={`${lead.relativeCreatedAt} · ${new Date(lead.requestedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
          />
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
                  <p className="text-sm font-medium text-violet-200">
                    {t(di.teamSizeKey)} {t("leads.discovery.teamSizeSuffix")}
                  </p>
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
                      const clean = p
                        .trim()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
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
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {lead.message}
          </p>
        </SectionCard>
      )}

      {/* Sales Notes */}
      {lead.notes && (
        <SectionCard
          title={t("leads.drawer.sections.salesNotes")}
          icon={StickyNote}
          accent="border-amber-500/20 bg-amber-500/5"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-200/80">
            {lead.notes}
          </p>
        </SectionCard>
      )}

      {/* Conversion banner */}
      {lead.isConverted && lead.convertedAt && (
        <SectionCard
          title={t("leads.drawer.sections.conversion")}
          icon={CheckCheck}
          accent="border-emerald-500/20 bg-emerald-500/5"
        >
          <p className="text-sm font-semibold text-emerald-300">
            {t("leads.drawer.conversion.converted")}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {new Date(lead.convertedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </SectionCard>
      )}

      {/* Status change inline */}
      {!lead.isConverted && (
        <DrawerStatusSection
          lead={lead}
          currentStatus={currentStatus}
          pendingStatus={pendingStatus}
          statusNote={statusNote}
          showStatusNote={showStatusNote}
          isUpdatingStatus={isUpdatingStatus}
          statusNoteSaved={statusNoteSaved}
          onStatusClick={onStatusClick}
          onStatusNoteChange={onStatusNoteChange}
          onSaveStatus={onSaveStatus}
          sendEmailToggle={sendEmailToggle}
          onSendEmailToggleChange={onSendEmailToggleChange}
          emailSubject={emailSubject}
          onEmailSubjectChange={onEmailSubjectChange}
          emailBody={emailBody}
          onEmailBodyChange={onEmailBodyChange}
          isFetchingPreview={isFetchingPreview}
        />
      )}
    </div>
  );
}
