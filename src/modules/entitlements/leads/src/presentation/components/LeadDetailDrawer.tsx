"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Copy,
  CheckCheck,
  ArrowRightCircle,
  Clock,
  Tag,
  Users,
  Zap,
  MessageSquare,
  StickyNote,
  Trash2,
  UserPlus,
  Activity,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead, LeadStatus, LeadActivity } from "../../domain/entities/PlatformLead";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string }> = {
  New: { badge: "bg-blue-500/15 text-blue-300 border-blue-500/30", dot: "bg-blue-400" },
  Contacted: { badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
  Qualified: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
  },
  Converted: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  Closed: { badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30", dot: "bg-zinc-500" },
};

// ── Copy-to-Clipboard helper ──────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0 text-zinc-500 hover:text-zinc-300"
      aria-label={t("common.copy")}
    >
      {copied ? (
        <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  copyable?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[11px] text-zinc-500">{label}</p>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-zinc-200">{value}</span>
          {copyable && <CopyButton value={copyable} />}
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface LeadDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  lead: PlatformLead | null | undefined;
  isLoading: boolean;
  onUpdateStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  isUpdatingStatus: boolean;
  /** Opens the ConvertToTenantDialog for this lead */
  onConvert?: (id: string) => void;
  /** Opens the AssignLeadDialog for this lead */
  onAssign?: (id: string) => void;
  /** Soft-delete / close lead */
  onDelete?: (id: string) => Promise<void>;
  isDeletingLead?: boolean;
  /** Activity timeline entries */
  activity?: LeadActivity[];
  isLoadingActivity?: boolean;
  /** Standalone note — appended to activity timeline without a status change */
  onAddNote?: (id: string, note: string) => Promise<void>;
  isAddingNote?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────

export function LeadDetailDrawer({
  open,
  onClose,
  lead,
  isLoading,
  onUpdateStatus,
  isUpdatingStatus,
  onConvert,
  onAssign,
  onDelete,
  isDeletingLead,
  activity,
  isLoadingActivity,
  onAddNote,
  isAddingNote,
}: LeadDetailDrawerProps) {
  const { t } = useI18n();

  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const [quickNoteSaved, setQuickNoteSaved] = useState(false);

  const pendingOrCurrent = pendingStatus ?? lead?.status ?? "New";
  const currentStatus = pendingOrCurrent;
  const hasChanges = pendingStatus !== null || noteText.trim().length > 0;

  const di = lead?.discoveryTagKeys;
  const hasDiscovery = di && (di.businessTypeKey ?? di.teamSizeKey ?? di.priority);

  const handleSaveStatus = async () => {
    if (!lead || !hasChanges) return;
    await onUpdateStatus(lead.id, currentStatus, noteText.trim() || undefined);
    setNoteText("");
    setNoteSaved(true);
    setPendingStatus(null);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleQuickNote = async () => {
    if (!lead || !quickNote.trim() || !onAddNote) return;
    await onAddNote(lead.id, quickNote.trim());
    setQuickNote("");
    setQuickNoteSaved(true);
    setTimeout(() => setQuickNoteSaved(false), 2000);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-[480px] overflow-y-auto border-s border-zinc-800 bg-zinc-950 p-0"
      >
        {/* ── Sticky header ── */}
        <SheetHeader className="sticky top-0 z-10 border-b border-zinc-800/60 bg-zinc-950/95 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg font-semibold text-white">
                {isLoading ? t("leads.drawer.loadingDetail") : (lead?.companyName ?? "")}
              </SheetTitle>
              {lead && <p className="mt-0.5 truncate text-sm text-zinc-400">{lead.contactName}</p>}
            </div>
            {lead && (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status].badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[lead.status].dot}`} />
                {t(`leads.status.${lead.status}`)}
              </span>
            )}
          </div>
          {lead?.editionKey && (
            <p className="mt-1.5 font-mono text-[11px] tracking-wide text-violet-400/80">
              🎯{" "}
              {t("leads.drawer.editionLabel", {
                edition: lead.editionKey
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()),
              })}
            </p>
          )}
        </SheetHeader>

        {/* ── Body ── */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
            {t("leads.drawer.loadingDetail")}
          </div>
        ) : !lead ? (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
            {t("leads.drawer.notFound")}
          </div>
        ) : (
          <div className="space-y-7 px-6 py-6">
            {/* ── Contact Info ── */}
            <Section title={t("leads.drawer.sections.contact")} icon={Mail}>
              <div className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
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
                  value={`${lead.relativeCreatedAt} · ${new Date(
                    lead.requestedAt
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`}
                />
              </div>
            </Section>

            {/* ── Discovery Intelligence ── */}
            {hasDiscovery && (
              <Section title={t("leads.drawer.sections.discovery")} icon={Zap}>
                <div className="space-y-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  {di?.businessTypeKey && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 shrink-0 text-violet-400/70" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.industry")}</p>
                        <p className="text-sm font-medium text-violet-200">
                          {t(di.businessTypeKey)}
                        </p>
                      </div>
                    </div>
                  )}
                  {di?.teamSizeKey && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 shrink-0 text-violet-400/70" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.teamSize")}</p>
                        <p className="text-sm font-medium text-violet-200">
                          {t(di.teamSizeKey)} {t("leads.discovery.teamSizeSuffix")}
                        </p>
                      </div>
                    </div>
                  )}
                  {di?.priority && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 shrink-0 text-violet-400/70" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.priority")}</p>
                        <p className="text-sm font-medium capitalize text-violet-200">
                          {di.priority.replace(/-/g, " ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ── Message ── */}
            {lead.message && (
              <Section title={t("leads.drawer.sections.message")} icon={MessageSquare}>
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                    {lead.message}
                  </p>
                </div>
              </Section>
            )}

            {/* ── CRM Status Management ── */}
            <Section title={t("leads.drawer.sections.crmStatus")} icon={ArrowRightCircle}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="drawer-status" className="text-xs text-zinc-400">
                    {t("leads.drawer.status.changeLabel")}
                  </Label>
                  <Select
                    value={currentStatus}
                    onValueChange={(v) => setPendingStatus(v as LeadStatus)}
                  >
                    <SelectTrigger
                      id="drawer-status"
                      className="h-9 border-zinc-700 bg-zinc-900 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-900">
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[s].dot}`} />
                            {t(`leads.status.${s}`)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="drawer-note" className="text-xs text-zinc-400">
                    {t("leads.drawer.status.noteLabel")}
                  </Label>
                  <Textarea
                    id="drawer-note"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t("leads.drawer.status.notePlaceholder")}
                    rows={3}
                    className="resize-none border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
                  />
                </div>

                <Button
                  id="drawer-save-status"
                  onClick={handleSaveStatus}
                  disabled={isUpdatingStatus || !hasChanges}
                  className="h-9 w-full bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
                >
                  {isUpdatingStatus
                    ? t("leads.drawer.status.saving")
                    : noteSaved
                      ? t("leads.drawer.status.saved")
                      : hasChanges
                        ? t("leads.drawer.status.save")
                        : t("leads.drawer.status.noChanges")}
                </Button>
              </div>
            </Section>

            {/* ── Existing Sales Notes ── */}
            {lead.notes && (
              <Section title={t("leads.drawer.sections.salesNotes")} icon={StickyNote}>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-200/80">
                    {lead.notes}
                  </p>
                </div>
              </Section>
            )}

            {/* ── Conversion Info ── */}
            {lead.isConverted && lead.convertedAt && (
              <Section title={t("leads.drawer.sections.conversion")} icon={CheckCheck}>
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm font-medium text-emerald-300">
                    {t("leads.drawer.conversion.converted")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(lead.convertedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Section>
            )}

            {/* ── Quick Add Note ── */}
            {onAddNote && (
              <Section title={t("leads.note.sectionTitle")} icon={StickyNote}>
                <div className="space-y-2">
                  <Textarea
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder={t("leads.note.placeholder")}
                    rows={3}
                    className="resize-none border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
                    disabled={isAddingNote}
                  />
                  <Button
                    onClick={handleQuickNote}
                    disabled={!quickNote.trim() || isAddingNote}
                    size="sm"
                    className="h-8 w-full bg-amber-600/90 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-40"
                  >
                    {isAddingNote
                      ? t("leads.note.saving")
                      : quickNoteSaved
                        ? t("leads.note.saved")
                        : t("leads.note.save")}
                  </Button>
                </div>
              </Section>
            )}

            {/* ── Activity Timeline ── */}
            <Section title={t("leads.activity.title")} icon={Activity}>
              {isLoadingActivity ? (
                <p className="text-xs text-zinc-500">{t("leads.loading")}</p>
              ) : !activity || activity.length === 0 ? (
                <p className="text-xs text-zinc-500">{t("leads.activity.empty")}</p>
              ) : (
                <ol className="relative space-y-4 border-s border-zinc-800 ps-4">
                  {activity.map((entry) => (
                    <li key={entry.id} className="group">
                      <div className="absolute -start-1 mt-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
                      <p className="text-xs font-medium text-zinc-300">
                        {t(`leads.activity.types.${entry.type}`)}
                      </p>
                      {entry.note && (
                        <p className="mt-0.5 text-xs italic text-zinc-500">{entry.note}</p>
                      )}
                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        {new Date(entry.occurredAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {entry.actorName
                          ? ` · ${t("leads.activity.by").replace("{actor}", entry.actorName)}`
                          : ` · ${t("leads.activity.system")}`}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {/* ── CRM Actions ── */}
            {!lead.isConverted && (
              <div className="space-y-2 border-t border-zinc-800 pt-2">
                {onConvert && (
                  <Button
                    id="drawer-convert-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => onConvert(lead.id)}
                    className="w-full gap-2 border-emerald-700 text-emerald-400 hover:bg-emerald-900/20"
                  >
                    <ArrowRightCircle className="h-4 w-4" />
                    {t("leads.actions.convert")}
                  </Button>
                )}
                {onAssign && (
                  <Button
                    id="drawer-assign-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(lead.id)}
                    className="w-full gap-2 border-indigo-700 text-indigo-400 hover:bg-indigo-900/20"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t("leads.actions.assign")}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    id="drawer-delete-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(lead.id)}
                    disabled={isDeletingLead}
                    className="w-full gap-2 border-red-900 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeletingLead ? t("leads.loading") : t("leads.actions.delete")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
