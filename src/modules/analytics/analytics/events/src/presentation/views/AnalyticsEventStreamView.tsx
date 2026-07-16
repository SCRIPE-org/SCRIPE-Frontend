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

export const AnalyticsEventStreamView = React.memo(function AnalyticsEventStreamView() {
  const { t, direction } = useI18n();
  const {
    events,
    totalCount,
    page,
    setPage,
    loading,
    error,
    pageSize,
  } = useAnalyticsEventViewModel();

  const isRtl = direction === "rtl";

  return (
    <div style={{ padding: "1.5rem", direction: direction }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          {t("analyticsEvents.title")}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          {t("analyticsEvents.description")}
        </p>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>
            {t("analyticsEvents.totalEvents")}
          </span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totalCount}</div>
        </div>
        <div style={{ borderLeft: "1px solid #e5e7eb", margin: "0 0.5rem" }} />
        <div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>
            {t("analyticsEvents.statusLabel")}
          </span>
          <div style={{ fontSize: "0.875rem", fontWeight: 500, color: totalCount === 0 ? "#9ca3af" : "#059669" }}>
            {totalCount === 0
              ? t("analyticsEvents.awaitingModules")
              : t("analyticsEvents.activeStatus")}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            color: "#dc2626",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          {t("analyticsEvents.loading")}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📊</div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>
            {t("analyticsEvents.emptyTitle")}
          </h3>
          <p style={{ fontSize: "0.875rem" }}>
            {t("analyticsEvents.emptyDescription")}
          </p>
          <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
            Verification: run{" "}
            <code style={{ backgroundColor: "#e5e7eb", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>
              scripe test backend
            </code>{" "}
            → Analytics.Application.Tests 9/9 confirm store + projection + idempotency are working.
          </div>
        </div>
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
                textAlign: isRtl ? "right" : "left",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.name")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.module")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.occurredAt")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.subjectType")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.subjectId")}
                  </th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                    {t("analyticsEvents.columns.numericValue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{ev.eventName}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{ev.sourceModule}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>
                      {new Date(ev.occurredAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>
                      {ev.subjectEntityTypeKey ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#6b7280",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                      }}
                    >
                      {ev.subjectEntityId ? ev.subjectEntityId.slice(0, 8) + "…" : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>
                      {ev.associatedNumericValue !== undefined && ev.associatedNumericValue !== null
                        ? ev.associatedNumericValue
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount} events
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= totalCount}
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: page * pageSize >= totalCount ? "not-allowed" : "pointer",
                  opacity: page * pageSize >= totalCount ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
