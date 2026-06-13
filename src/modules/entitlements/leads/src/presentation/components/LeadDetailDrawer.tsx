"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
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
  New:       { badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",        dot: "bg-blue-400"    },
  Contacted: { badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",     dot: "bg-amber-400"   },
  Qualified: { badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",  dot: "bg-violet-400"  },
  Converted: { badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  Closed:    { badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",        dot: "bg-zinc-500"    },
};

// ── Copy-to-Clipboard helper ──────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
      aria-label="Copy"
    >
      {copied
        ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
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
      <Icon className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-zinc-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-200 truncate">{value}</span>
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
}: LeadDetailDrawerProps) {
  const { t } = useI18n();

  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

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

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full max-w-[480px] bg-zinc-950 border-s border-zinc-800 p-0 overflow-y-auto"
      >
        {/* ── Sticky header ── */}
        <SheetHeader className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-white text-lg font-semibold truncate">
                {isLoading ? t("leads.drawer.loadingDetail") : (lead?.companyName ?? "")}
              </SheetTitle>
              {lead && (
                <p className="text-sm text-zinc-400 mt-0.5 truncate">{lead.contactName}</p>
              )}
            </div>
            {lead && (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-medium border ${STATUS_STYLES[lead.status].badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[lead.status].dot}`} />
                {t(`leads.status.${lead.status}`)}
              </span>
            )}
          </div>
          {lead?.editionKey && (
            <p className="text-[11px] mt-1.5 font-mono text-violet-400/80 tracking-wide">
              🎯 {t("leads.drawer.editionLabel", {
                edition: lead.editionKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              })}
            </p>
          )}
        </SheetHeader>

        {/* ── Body ── */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            {t("leads.drawer.loadingDetail")}
          </div>
        ) : !lead ? (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            {t("leads.drawer.notFound")}
          </div>
        ) : (
          <div className="px-6 py-6 space-y-7">

            {/* ── Contact Info ── */}
            <Section title={t("leads.drawer.sections.contact")} icon={Mail}>
              <div className="space-y-3 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
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
                      <span className="text-zinc-600 italic text-xs">
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
                  value={`${lead.relativeCreatedAt} · ${new Date(lead.requestedAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}`}
                />
              </div>
            </Section>

            {/* ── Discovery Intelligence ── */}
            {hasDiscovery && (
              <Section title={t("leads.drawer.sections.discovery")} icon={Zap}>
                <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-4 space-y-3">
                  {di?.businessTypeKey && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-violet-400/70 shrink-0" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.industry")}</p>
                        <p className="text-sm text-violet-200 font-medium">{t(di.businessTypeKey)}</p>
                      </div>
                    </div>
                  )}
                  {di?.teamSizeKey && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-violet-400/70 shrink-0" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.teamSize")}</p>
                        <p className="text-sm text-violet-200 font-medium">
                          {t(di.teamSizeKey)} {t("leads.discovery.teamSizeSuffix")}
                        </p>
                      </div>
                    </div>
                  )}
                  {di?.priority && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-violet-400/70 shrink-0" />
                      <div>
                        <p className="text-[11px] text-zinc-500">{t("leads.discovery.priority")}</p>
                        <p className="text-sm text-violet-200 font-medium capitalize">
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
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
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
                      className="bg-zinc-900 border-zinc-700 text-white h-9"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
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
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 text-sm resize-none"
                  />
                </div>

                <Button
                  id="drawer-save-status"
                  onClick={handleSaveStatus}
                  disabled={isUpdatingStatus || !hasChanges}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-9 text-sm font-medium disabled:opacity-40 transition-colors"
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
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                  <p className="text-sm text-amber-200/80 leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              </Section>
            )}

            {/* ── Conversion Info ── */}
            {lead.isConverted && lead.convertedAt && (
              <Section title={t("leads.drawer.sections.conversion")} icon={CheckCheck}>
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-2">
                  <p className="text-sm text-emerald-300 font-medium">
                    {t("leads.drawer.conversion.converted")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(lead.convertedAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
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
                <ol className="relative border-s border-zinc-800 space-y-4 ps-4">
                  {activity.map((entry) => (
                    <li key={entry.id} className="group">
                      <div className="absolute -start-1 mt-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
                      <p className="text-xs text-zinc-300 font-medium">
                        {t(`leads.activity.types.${entry.type}`)}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-zinc-500 mt-0.5 italic">{entry.note}</p>
                      )}
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {new Date(entry.occurredAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                        {entry.actorName
                          ? ` · ${t("leads.activity.by").replace("{actor}", entry.actorName)}`
                          : ` · ${t("leads.activity.system")}`
                        }
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {/* ── CRM Actions ── */}
            {!lead.isConverted && (
              <div className="pt-2 border-t border-zinc-800 space-y-2">
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
