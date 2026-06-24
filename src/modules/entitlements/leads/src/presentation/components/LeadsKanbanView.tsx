"use client";

import { useState, type DragEvent } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { KanbanCard } from "./KanbanCard";
import type { PlatformLeadListItem, LeadStatus } from "../../domain/entities/PlatformLead";

interface LeadsKanbanViewProps {
  leads: PlatformLeadListItem[];
  isLoading: boolean;
  onOpenDrawer: (id: string) => void;
  onMoveLead: (id: string, status: LeadStatus) => Promise<void>;
  isMoving: boolean;
}

const COLUMNS: { status: LeadStatus; accent: string; dot: string }[] = [
  { status: "New", accent: "border-blue-500/30 text-blue-400", dot: "bg-blue-400" },
  { status: "Contacted", accent: "border-amber-500/30 text-amber-400", dot: "bg-amber-400" },
  { status: "Qualified", accent: "border-violet-500/30 text-violet-400", dot: "bg-violet-400" },
  { status: "Converted", accent: "border-emerald-500/30 text-emerald-400", dot: "bg-emerald-400" },
  { status: "Closed", accent: "border-zinc-600/40 text-zinc-500", dot: "bg-zinc-600" },
];

const SKELETON_HEIGHTS = [72, 88, 64, 96, 80];

/**
 * Presentation UI component rendering the leads kanban view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function LeadsKanbanView({
  leads,
  isLoading,
  onOpenDrawer,
  onMoveLead,
  isMoving,
}: LeadsKanbanViewProps) {
  const { t } = useI18n();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<LeadStatus | null>(null);

  const byStatus = (status: LeadStatus) => leads.filter((l) => l.status === status);
  const draggedLead = draggedLeadId ? leads.find((lead) => lead.id === draggedLeadId) : undefined;

  const handleDrop = async (event: DragEvent<HTMLDivElement>, status: LeadStatus) => {
    event.preventDefault();
    try {
      setDropStatus(null);
      const leadId = draggedLeadId ?? event.dataTransfer.getData("text/plain");
      if (!leadId) return;
      const current = leads.find((lead) => lead.id === leadId);
      if (!current || current.status === status) return;
      await onMoveLead(leadId, status);
    } catch {
      // ViewModel handles toast + optimistic rollback.
    } finally {
      setDraggedLeadId(null);
      setDropStatus(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {COLUMNS.map(({ status, accent, dot }) => {
        const col = byStatus(status);
        return (
          <div
            key={status}
            className={`flex min-h-[400px] flex-col gap-2 rounded-md transition-colors ${dropStatus === status ? "bg-zinc-900/50" : ""}`}
            onDragOver={(event) => {
              if (!draggedLead || draggedLead.status === status || isMoving) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDropStatus(status);
            }}
            onDragLeave={() => setDropStatus((current) => (current === status ? null : current))}
            onDrop={(event) => void handleDrop(event, status)}
          >
            {/* Column header */}
            <div
              className={`flex items-center justify-between rounded-md border px-2.5 py-2 ${accent.replace("text-", "border-")} bg-zinc-900/60`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-xs font-medium ${accent.split(" ")[1]}`}>
                  {t(`leads.status.${status}`)}
                </span>
              </div>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                {isLoading ? "—" : col.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2">
              {isLoading ? (
                SKELETON_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/60"
                    style={{ height: h }}
                  />
                ))
              ) : col.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-800 px-3 py-6">
                  <p className="text-center text-[11px] text-zinc-600">{t("leads.empty")}</p>
                </div>
              ) : (
                col.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onClick={onOpenDrawer}
                    onDragStart={isMoving ? undefined : setDraggedLeadId}
                    onDragEnd={() => {
                      setDraggedLeadId(null);
                      setDropStatus(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
