"use client";

import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { SovereignAuditEntry } from "../../../domain/entities/SovereignAccountEntities";
import { isEntrySuccess } from "../../utils/activity-console.utils";
import type { ActivityTranslateFn } from "./ActivityFilterToolbarSection";
import { ChevronRight, Clock, Code, FileText, Globe, Hash, ShieldCheck } from "lucide-react";

/**
 * Formats an ISO-8601 UTC audit timestamp for consistent monospace ledger display.
 */
export function formatActivityTimestampUtc(timestampUtc: string): string {
  const parsed = new Date(timestampUtc);
  if (Number.isNaN(parsed.getTime())) return "—";
  return `${parsed.toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

/**
 * Builds GenericCrudView column definitions for the SOC2 Account Activity ledger.
 */
export function createActivityLedgerColumns(t: ActivityTranslateFn): CrudColumn<SovereignAuditEntry>[] {
  return [
    {
      key: "eventType",
      label: t("profile.activity.sectionTitle"),
      render: (_value, entry) => {
        const ok = isEntrySuccess(entry);
        return (
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
                ok
                  ? "border-success/20 bg-success/10 text-success"
                  : "border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-bold text-nx-ink truncate">{entry.eventType}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {entry.category && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-nx-line text-nx-ink-2">
                    {entry.category}
                  </Badge>
                )}
                {entry.correlationId && (
                  <Badge
                    data-testid={`activity-correlation-${entry.id}`}
                    variant="outline"
                    className="font-mono text-[10px] py-0 px-1.5 border-nx-line text-nx-ink-3 gap-1"
                  >
                    <Hash className="h-2.5 w-2.5" aria-hidden="true" />
                    <bdi>{entry.correlationId}</bdi>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "outcome",
      label: t("common.status"),
      render: (_value, entry) => {
        const ok = isEntrySuccess(entry);
        return (
          <Badge
            variant="outline"
            className={`text-[10px] py-0.5 px-2 ${
              ok ? "border-success/30 text-success" : "border-destructive/30 text-destructive"
            }`}
          >
            {entry.outcome || (ok ? t("profile.audit.statusSuccess") : t("profile.audit.statusFailure"))}
          </Badge>
        );
      },
    },
    {
      key: "ipAddress",
      label: t("profile.audit.networkIp"),
      hideOnMobile: true,
      render: (_value, entry) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-nx-ink-2" dir="ltr">
          <Globe className="h-3 w-3 text-nx-ink-3 shrink-0" aria-hidden="true" />
          <bdi>{entry.ipAddress || "—"}</bdi>
        </span>
      ),
    },
    {
      key: "timestampUtc",
      label: t("profile.audit.timestamp"),
      render: (_value, entry) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-nx-ink-3" dir="ltr">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <bdi>{formatActivityTimestampUtc(entry.timestampUtc)}</bdi>
        </span>
      ),
    },
  ];
}

/**
 * Props for ActivityEntryCard.
 */
export interface ActivityEntryCardProps {
  entry: SovereignAuditEntry;
  t: ActivityTranslateFn;
  onInspect: (entry: SovereignAuditEntry) => void;
}

/**
 * CardGrid representation of a single forensic audit entry without nested interactive elements.
 */
export function ActivityEntryCard({ entry, t, onInspect }: ActivityEntryCardProps) {
  const ok = isEntrySuccess(entry);
  return (
    <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
            ok
              ? "border-success/20 bg-success/10 text-success"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-nx-ink truncate">{entry.eventType}</span>
            <Badge
              variant="outline"
              className={`text-[10px] py-0 px-1.5 ${
                ok ? "border-success/30 text-success" : "border-destructive/30 text-destructive"
              }`}
            >
              {entry.outcome || (ok ? t("profile.audit.statusSuccess") : t("profile.audit.statusFailure"))}
            </Badge>
            {entry.category && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-nx-line text-nx-ink-2">
                {entry.category}
              </Badge>
            )}
            {entry.correlationId && (
              <Badge
                data-testid={`activity-correlation-${entry.id}`}
                variant="outline"
                className="font-mono text-[10px] py-0 px-1.5 border-nx-line text-nx-ink-3 gap-1"
              >
                <Hash className="h-2.5 w-2.5" aria-hidden="true" />
                <bdi>{entry.correlationId}</bdi>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-nx-ink-3 font-mono flex-wrap" dir="ltr">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <bdi>{formatActivityTimestampUtc(entry.timestampUtc)}</bdi>
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" aria-hidden="true" />
              <bdi>{entry.ipAddress || "—"}</bdi>
            </span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInspect(entry)}
        className="h-8 px-2.5 text-xs text-nx-ink-2 hover:text-nx-accent gap-1 self-end sm:self-center shrink-0"
      >
        <Code className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t("profile.audit.inspectJsonBtn")}</span>
        <ChevronRight className="h-3.5 w-3.5 ms-0.5 rtl:rotate-180" aria-hidden="true" />
      </Button>
    </Card>
  );
}

/**
 * Empty state card displayed when no security activity records match active filters.
 */
export function ActivityEmptyState({ t }: { t: ActivityTranslateFn }) {
  return (
    <Card className="border border-nx-line bg-nx-surface p-6 text-center space-y-2">
      <FileText className="h-6 w-6 text-nx-accent mx-auto" aria-hidden="true" />
      <p className="text-xs font-semibold text-nx-ink">{t("profile.audit.noEntriesTitle")}</p>
      <p className="text-[11px] text-nx-ink-3">{t("profile.audit.noEntriesDesc")}</p>
    </Card>
  );
}
