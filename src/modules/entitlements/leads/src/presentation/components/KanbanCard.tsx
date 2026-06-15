"use client";

import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLeadListItem } from "../../domain/entities/PlatformLead";

interface KanbanCardProps {
  lead: PlatformLeadListItem;
  onClick: (id: string) => void;
}

export function KanbanCard({ lead, onClick }: KanbanCardProps) {
  const { t } = useI18n();

  return (
    <button
      onClick={() => onClick(lead.id)}
      className="group w-full rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-start transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800/80 hover:shadow-md active:scale-[0.98]"
    >
      {/* Company + edition */}
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-white group-hover:text-indigo-300">
          {lead.companyName}
        </p>
        {lead.editionKey && (
          <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            {lead.editionKey}
          </span>
        )}
      </div>

      {/* Contact */}
      <p className="mt-1 truncate text-xs text-zinc-400">{lead.contactName}</p>
      <p className="truncate text-[11px] text-zinc-600">{lead.email}</p>

      {/* Discovery tags */}
      {lead.discoveryTagKeys.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {lead.discoveryTagKeys.map(({ key, raw }) => (
            <span
              key={key}
              className="inline-flex items-center rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-400"
            >
              {raw ? key : t(key)}
            </span>
          ))}
        </div>
      )}

      {/* Footer: relative time + source */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">{lead.relativeCreatedAt}</span>
        <span className="text-[10px] text-zinc-600">{t(lead.sourceKey)}</span>
      </div>
    </button>
  );
}
