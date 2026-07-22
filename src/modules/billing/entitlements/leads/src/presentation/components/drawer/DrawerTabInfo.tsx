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
import { formatDateTimeUtc } from "@core/common/utils";
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

/**
 * Presentation UI component rendering the drawer tab info.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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

  return (
    <div className="space-y-3 p-4">
      {/* Contact */}
      <SectionCard title={t("leads.drawer.sections.contact")} icon={Mail}>
        <div className="space-y-1 divide-y divide-border/40">
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
                <span className="text-xs italic text-muted-foreground">
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
            value={`${lead.relativeCreatedAt} · ${formatDateTimeUtc(lead.requestedAt)}`}
          />
        </div>
      </SectionCard>

      {/* Discovery Intelligence */}
      {hasDiscovery && (
        <SectionCard
          title={t("leads.drawer.sections.discovery")}
          icon={Zap}
          accent="border-primary/20 bg-primary/5"
        >
          <div className="space-y-3">
            {di?.businessTypeKey && (
              <div className="flex items-center gap-3">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{t("leads.discovery.industry")}</p>
                  <p className="text-sm font-medium text-primary">{t(di.businessTypeKey)}</p>
                </div>
              </div>
            )}
            {di?.teamSizeKey && (
              <div className="flex items-center gap-3">
                <Users className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{t("leads.discovery.teamSize")}</p>
                  <p className="text-sm font-medium text-primary">
                    {t(di.teamSizeKey)} {t("leads.discovery.teamSizeSuffix")}
                  </p>
                </div>
              </div>
            )}
            {di?.priority && (
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-3.5 w-3.5 shrink-0 text-primary/70" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground">{t("leads.discovery.priority")}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {di.priority.split(",").map((p) => {
                      const clean = p
                        .trim()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <span
                          key={p}
                          className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/20"
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
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {lead.message}
          </p>
        </SectionCard>
      )}

      {/* Sales Notes */}
      {lead.notes && (
        <SectionCard
          title={t("leads.drawer.sections.salesNotes")}
          icon={StickyNote}
          accent="border-warning/20 bg-warning/5"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-warning/80">
            {lead.notes}
          </p>
        </SectionCard>
      )}

      {/* Conversion banner */}
      {lead.isConverted && lead.convertedAt && (
        <SectionCard
          title={t("leads.drawer.sections.conversion")}
          icon={CheckCheck}
          accent="border-success/20 bg-success/5"
        >
          <p className="text-sm font-semibold text-success">
            {t("leads.drawer.conversion.converted")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateTimeUtc(lead.convertedAt)}
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
