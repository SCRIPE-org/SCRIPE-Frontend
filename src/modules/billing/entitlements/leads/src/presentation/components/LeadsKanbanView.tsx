"use client";

import { useState, type DragEvent } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { KanbanCard } from "./KanbanCard";
import type { PlatformLeadListItem, LeadStatus } from "../../domain/entities/PlatformLead";

interface LeadsKanbanViewProps {
  leads: PlatformLeadListItem[];
  isLoading: boolean;
  onOpenDrawer: (id: string) => void;
  onMoveLead: (id: string, status: LeadStatus) => Promise<void>;
  isMoving: boolean;
}

// Explicit literal fields, never derived from another class by string surgery —
// Tailwind statically scans source for class names, so a class built by
// concatenation/`.replace()` at runtime was never compiled and rendered unstyled.
const COLUMNS: { status: LeadStatus; text: string; border: string; dot: string }[] = [
  { status: "New", text: "text-info", border: "border-info/30", dot: "bg-info" },
  { status: "Contacted", text: "text-warning", border: "border-warning/30", dot: "bg-warning" },
  { status: "Qualified", text: "text-nx-accent", border: "border-nx-accent", dot: "bg-nx-accent" },
  { status: "Converted", text: "text-success", border: "border-success/30", dot: "bg-success" },
  { status: "Closed", text: "text-nx-ink-3", border: "border-nx-line", dot: "bg-nx-ink-3" },
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
      {COLUMNS.map(({ status, text, border, dot }) => {
        const col = byStatus(status);
        return (
          <div
            key={status}
            className={`flex min-h-[400px] flex-col gap-2 rounded-md transition-colors ${dropStatus === status ? "bg-card/50" : ""}`}
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
              className={`flex items-center justify-between rounded-md border px-2.5 py-2 ${border} bg-card/60`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-xs font-medium ${text}`}>{t(`leads.status.${status}`)}</span>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {isLoading ? "—" : col.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2">
              {isLoading ? (
                SKELETON_HEIGHTS.map((h, i) => (
                  <Skeleton key={i} shape="block" className="rounded-lg" style={{ height: h }} />
                ))
              ) : col.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-3 py-6">
                  <p className="text-center text-[11px] text-muted-foreground">
                    {t("leads.empty")}
                  </p>
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
