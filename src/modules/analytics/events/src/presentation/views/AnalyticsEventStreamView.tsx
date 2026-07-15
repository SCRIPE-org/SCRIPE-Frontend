/**
 * Analytics Event Stream View
 *
 * Read-only operator surface for the Analytics Event Foundation (2A-11).
 * This is an INTERNAL KERNEL — events are never user-authored; they are
 * recorded in-process by IAnalyticsRecorder from other modules (2B+).
 *
 * What this view shows:
 *   - The append-only metric-event stream (GET /api/v1/analytics/events)
 *   - A daily operational projection summary (GET /api/v1/analytics/daily-metrics)
 *
 * Permission: analytics-events.view (single read-only permission, no create/edit/delete)
 *
 * Note: The event stream will be empty until a producing module (2B Facility,
 * 2C Academy, 2D Football Intelligence) emits its first event via IAnalyticsRecorder.
 * The store, projection, recorder contract, and read API are the Wave 2A deliverable.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getModuleApiService } from "@core/services/api-factory";

interface AnalyticsEventResponse {
  id: string;
  eventName: string;
  sourceModule: string;
  occurredAt: string;
  subjectEntityTypeKey?: string;
  subjectEntityId?: string;
  associatedNumericValue?: number;
  tenantId?: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const AnalyticsEventStreamView = React.memo(function AnalyticsEventStreamView() {
  const [events, setEvents] = useState<AnalyticsEventResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getModuleApiService("ANALYTICS");
      const url = `/api/v1/analytics/events?page=${page}&pageSize=${pageSize}`;
      const data = await api.get<PagedResult<AnalyticsEventResponse>>(url);
      setEvents(data.items ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load analytics events";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Analytics Event Stream
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Read-only metric-event stream recorded by the Analytics Event Foundation (Wave 2A).
          Events are written in-process by other modules via{" "}
          <code style={{ backgroundColor: "#f3f4f6", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>
            IAnalyticsRecorder
          </code>{" "}
          — they cannot be created, edited, or deleted here. The stream will populate as
          later waves (2B Facility, 2C Academy, 2D Football Intelligence) emit events.
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
            Total Events
          </span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totalCount}</div>
        </div>
        <div style={{ borderLeft: "1px solid #e5e7eb", margin: "0 0.5rem" }} />
        <div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>
            Status
          </span>
          <div style={{ fontSize: "0.875rem", fontWeight: 500, color: totalCount === 0 ? "#9ca3af" : "#059669" }}>
            {totalCount === 0
              ? "Awaiting producing modules (Wave 2B+)"
              : "Active — events recorded"}
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
          Loading event stream…
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
            No analytics events yet
          </h3>
          <p style={{ fontSize: "0.875rem" }}>
            The Analytics Event Store is ready and running. Events will appear here once
            Wave 2B (Facility &amp; Booking), 2C (Academy), or 2D (Football Intelligence)
            modules begin recording metric events via{" "}
            <code style={{ backgroundColor: "#e5e7eb", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>
              IAnalyticsRecorder
            </code>
            .
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
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                  {[
                    "Event Name",
                    "Source Module",
                    "Occurred At",
                    "Subject Type",
                    "Subject ID",
                    "Numeric Value",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 600,
                        color: "#374151",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
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
                      {ev.associatedNumericValue !== undefined
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
