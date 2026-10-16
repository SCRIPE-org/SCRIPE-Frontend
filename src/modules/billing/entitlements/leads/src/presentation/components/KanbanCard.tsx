"use client";

import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLeadListItem } from "../../domain/entities/PlatformLead";

interface KanbanCardProps {
  lead: PlatformLeadListItem;
  onClick: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

/**
 * Presentation UI component rendering the kanban card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function KanbanCard({ lead, onClick, onDragStart, onDragEnd }: KanbanCardProps) {
  const { t } = useI18n();

  return (
    <Button
      onClick={() => onClick(lead.id)}
      draggable={!!onDragStart}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", lead.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(lead.id);
      }}
      onDragEnd={onDragEnd}
      variant="ghost"
      className="group h-auto w-full flex-col items-stretch justify-start whitespace-normal rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_80%,transparent)] p-3 text-start transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-[color:color-mix(in_srgb,var(--nx-line)_90%,transparent)] hover:bg-nx-hover motion-reduce:transition-none"
    >
      {/* Company + edition */}
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-nx-ink group-hover:text-info">
          {lead.companyName}
        </p>
        {lead.editionKey && (
          <span className="shrink-0 rounded border border-info/30 bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">
            {lead.editionKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
      </div>

      {/* Contact */}
      <p className="mt-1 truncate text-xs text-nx-ink-3">{lead.contactName}</p>
      <p className="truncate text-[11px] text-nx-ink-3">{lead.email}</p>

      {/* Discovery tags */}
      {lead.discoveryTagKeys.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {lead.discoveryTagKeys.map(({ key, raw }) => (
            <span
              key={key}
              className="inline-flex items-center rounded border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash px-1.5 py-0.5 text-[10px] text-nx-accent"
            >
              {raw ? key : t(key)}
            </span>
          ))}
        </div>
      )}

      {/* Footer: relative time + source */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-nx-ink-3">{lead.relativeCreatedAt}</span>
        <span className="text-[10px] text-nx-ink-3">{t(lead.sourceKey)}</span>
      </div>
    </Button>
  );
}
