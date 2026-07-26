/**
 * Analytics Event Stream View
 *
 * Read-only operator surface for the Analytics Event Foundation (2A-11).
 * This is an INTERNAL KERNEL — events are never user-authored; they are
 * recorded in-process by IAnalyticsRecorder from other modules (2B+).
 *
 * What this view shows:
 *   - The append-only metric-event stream (via AnalyticsEventViewModel)
 *
 * Permission: analytics-events.view (single read-only permission, no create/edit/delete)
 *
 * Note: The event stream will be empty until a producing module (2B Facility,
 * 2C Academy, 2D Football Intelligence) emits its first event via IAnalyticsRecorder.
 */
"use client";

import React from "react";
import { useAnalyticsEventViewModel } from "../../presentation/viewmodels/useAnalyticsEventViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { cn } from "@core/common/utils";
import { BarChart3, Activity } from "lucide-react";

export const AnalyticsEventStreamView = React.memo(function AnalyticsEventStreamView() {
  const { t, direction } = useI18n();
  const { events, totalCount, page, setPage, loading, error, pageSize } =
    useAnalyticsEventViewModel();

  return (
    <div style={{ padding: "1.5rem", direction: direction }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          {t("analyticsEvents.title")}
        </h1>
        <p style={{ color: "var(--nx-ink-2)", fontSize: "0.875rem" }}>
          {t("analyticsEvents.description")}
        </p>
      </div>

      {/* Stats bar — the shared StatCard anatomy instead of a bespoke strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t("analyticsEvents.totalEvents")}
          value={totalCount.toLocaleString()}
          icon={BarChart3}
          tone="info"
        />
        <StatCard
          label={t("analyticsEvents.statusLabel")}
          value={
            totalCount === 0
              ? t("analyticsEvents.awaitingModules")
              : t("analyticsEvents.activeStatus")
          }
          icon={Activity}
          tone={totalCount === 0 ? "neutral" : "success"}
        />
      </div>

      {/* Error — the shared error anatomy */}
      {error && <ErrorMessage size="sm" message={error} className="mb-4" />}

      {/* Loading */}
      {loading && (
        <div
          style={{ textAlign: "center", padding: "2rem", color: "var(--nx-ink-3)" }}
        >
          {t("analyticsEvents.loading")}
        </div>
      )}

      {/* Empty state — the shared EmptyState anatomy; the operator
          verification hint rides the action slot */}
      {!loading && !error && events.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title={t("analyticsEvents.emptyTitle")}
          description={t("analyticsEvents.emptyDescription")}
          action={
            <p className="max-w-[60ch] text-xs text-nx-ink-3">
              Verification: run{" "}
              <code className="rounded-nx-sm bg-nx-raised px-1 py-0.5">scripe test backend</code> →
              Analytics.Application.Tests 9/9 confirm store + projection + idempotency are working.
            </p>
          }
        />
      )}

      {/* Event table */}
      {!loading && !error && events.length > 0 && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
                textAlign: "start",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "var(--nx-raised)" }}>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.name")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.module")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.occurredAt")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.subjectType")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.subjectId")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--nx-ink)",
                      borderBottom: "1px solid var(--nx-line)",
                    }}
                  >
                    {t("analyticsEvents.columns.numericValue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid var(--nx-line)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{ev.eventName}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--nx-ink-3)" }}>
                      {ev.sourceModule}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--nx-ink-3)" }}>
                      {new Date(ev.occurredAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--nx-ink-3)" }}>
                      {ev.subjectEntityTypeKey ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "var(--nx-ink-3)",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                      }}
                    >
                      {ev.subjectEntityId ? ev.subjectEntityId.slice(0, 8) + "…" : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--nx-ink-3)" }}>
                      {ev.associatedNumericValue !== undefined && ev.associatedNumericValue !== null
                        ? ev.associatedNumericValue
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination — composed from the core pagination primitives */}
          <div className="mt-4 flex items-center justify-between text-sm text-nx-ink-3">
            <span className="tabular-nums">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount} events
            </span>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={page === 1 || undefined}
                    tabIndex={page === 1 ? -1 : undefined}
                    className={cn("h-8", page === 1 && "pointer-events-none opacity-50")}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={page * pageSize >= totalCount || undefined}
                    tabIndex={page * pageSize >= totalCount ? -1 : undefined}
                    className={cn(
                      "h-8",
                      page * pageSize >= totalCount && "pointer-events-none opacity-50"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => p + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
});
