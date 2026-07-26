"use client";

import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { Skeleton } from "@core/ui/skeleton";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { StickyNote, Activity, CheckCheck } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import type { LeadActivity } from "../../../domain/entities/PlatformLead";

// ── Props ─────────────────────────────────────────────────────────────────────

interface DrawerTabActivityProps {
  activity?: LeadActivity[];
  isLoadingActivity?: boolean;
  onAddNote?: () => void;
  quickNote: string;
  onQuickNoteChange: (v: string) => void;
  isAddingNote?: boolean;
  quickNoteSaved: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the drawer tab activity.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DrawerTabActivity({
  activity,
  isLoadingActivity,
  onAddNote,
  quickNote,
  onQuickNoteChange,
  isAddingNote,
  quickNoteSaved,
}: DrawerTabActivityProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 p-4">
      {/* Quick note */}
      {onAddNote && (
        <div className="space-y-2 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_40%,transparent)] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-nx-ink-3">
            <StickyNote className="h-3.5 w-3.5" />
            {t("leads.note.sectionTitle")}
          </p>
          <Textarea
            value={quickNote}
            onChange={(e) => onQuickNoteChange(e.target.value)}
            placeholder={t("leads.note.placeholder")}
            rows={3}
            className="resize-none border-nx-line bg-nx-ground text-sm text-nx-ink placeholder:text-nx-ink-3"
            disabled={isAddingNote}
          />
          <Button
            onClick={onAddNote}
            disabled={!quickNote.trim() || isAddingNote}
            size="sm"
            className="h-8 w-full bg-warning/90 text-xs font-semibold text-warning-foreground hover:bg-warning disabled:opacity-40"
          >
            {isAddingNote ? (
              <>
                <LoadingSpinner size="inline" showText={false} className="me-1.5" />
                {t("leads.note.saving")}
              </>
            ) : quickNoteSaved ? (
              <>
                <CheckCheck className="me-1.5 h-3.5 w-3.5 text-success" />
                {t("leads.note.saved")}
              </>
            ) : (
              t("leads.note.save")
            )}
          </Button>
        </div>
      )}

      {/* Activity timeline */}
      <div className="rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_40%,transparent)] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-nx-ink-3">
          <Activity className="h-3.5 w-3.5" />
          {t("leads.activity.title")}
        </p>
        {isLoadingActivity ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton shape="circle" className="mt-1 h-2 w-2 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton shape="text" className="h-3 w-32" />
                  <Skeleton shape="text" className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !activity || activity.length === 0 ? (
          <p className="text-xs text-nx-ink-3">{t("leads.activity.empty")}</p>
        ) : (
          <ol className="relative space-y-5 border-s border-nx-line">
            {activity.map((entry) => (
              <li key={entry.id} className="relative ps-6">
                <div className="absolute start-0 top-1 -ms-[5px] h-2.5 w-2.5 rounded-full bg-info ring-4 ring-nx-ground" />
                <p className="text-xs font-semibold text-nx-ink">
                  {entry.summary || t(`leads.activity.types.${entry.type}`)}
                </p>
                {entry.note && (
                  <p className="mt-0.5 text-xs italic leading-relaxed text-nx-ink-3">
                    {entry.note}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-nx-ink-3">
                  {formatDateTimeUtc(entry.occurredAt)}
                  {entry.actorName
                    ? ` · ${t("leads.activity.by", { actor: entry.actorName })}`
                    : ` · ${t("leads.activity.system")}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
