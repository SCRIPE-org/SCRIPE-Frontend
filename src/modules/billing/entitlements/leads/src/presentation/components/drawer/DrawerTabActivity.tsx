"use client";

import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { StickyNote, Activity, Loader2, CheckCheck } from "lucide-react";
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
        <div className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            <StickyNote className="h-3.5 w-3.5" />
            {t("leads.note.sectionTitle")}
          </p>
          <Textarea
            value={quickNote}
            onChange={(e) => onQuickNoteChange(e.target.value)}
            placeholder={t("leads.note.placeholder")}
            rows={3}
            className="resize-none border-zinc-700 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
            disabled={isAddingNote}
          />
          <Button
            onClick={onAddNote}
            disabled={!quickNote.trim() || isAddingNote}
            size="sm"
            className="h-8 w-full bg-amber-600/90 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
          >
            {isAddingNote ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t("leads.note.saving")}
              </>
            ) : quickNoteSaved ? (
              <>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                {t("leads.note.saved")}
              </>
            ) : (
              t("leads.note.save")
            )}
          </Button>
        </div>
      )}

      {/* Activity timeline */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          <Activity className="h-3.5 w-3.5" />
          {t("leads.activity.title")}
        </p>
        {isLoadingActivity ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 rounded bg-zinc-800" />
                  <div className="h-2.5 w-20 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : !activity || activity.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("leads.activity.empty")}</p>
        ) : (
          <ol className="relative space-y-5 border-s border-zinc-800">
            {activity.map((entry) => (
              <li key={entry.id} className="relative ps-6">
                <div className="absolute left-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-indigo-500 ring-4 ring-zinc-950" />
                <p className="text-xs font-semibold text-zinc-300">
                  {entry.summary || t(`leads.activity.types.${entry.type}`)}
                </p>
                {entry.note && (
                  <p className="mt-0.5 text-xs italic leading-relaxed text-zinc-500">
                    {entry.note}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-zinc-600">
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
