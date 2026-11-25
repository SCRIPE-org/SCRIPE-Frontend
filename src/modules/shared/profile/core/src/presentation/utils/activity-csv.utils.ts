/**
 * Account Activity CSV Export Helpers
 *
 * Pure RFC-4180 escaping, CSV document builder, and browser download helper
 * for the SOC2 Account Activity Console.
 */
import { sanitizeCsvCell } from "@core/common/sanitize";
import type { SovereignAuditEntry } from "../../domain/entities/SovereignAccountEntities";

/**
 * Optional localized labels used when building an audit CSV export.
 */
export interface ActivityCsvLabels {
  headers?: readonly string[];
  successOutcome?: string;
  failureOutcome?: string;
  defaultCategory?: string;
}

const DEFAULT_CSV_HEADERS = [
  "ID",
  "Timestamp (UTC)",
  "Category",
  "Event Type",
  "Outcome",
  "Severity",
  "IP Address",
  "Correlation ID",
  "Entry Hash",
  "Payload JSON",
] as const;

function isCsvEntrySuccess(entry: SovereignAuditEntry): boolean {
  const outcome = entry.outcome?.toUpperCase();
  if (outcome === "SUCCESS") return true;
  if (outcome === "FAILURE" || outcome === "FAILED") return false;
  return entry.severity !== "Danger" && entry.severity !== "Warning";
}

/**
 * Neutralizes formula prefixes and RFC-4180 escapes a cell value for safe CSV serialization.
 */
export function escapeCsvCell(value: unknown): string {
  return sanitizeCsvCell(value);
}

/**
 * Serializes audit entries into a UTF-8 CSV document string.
 */
export function buildActivityCsv(
  entries: ReadonlyArray<SovereignAuditEntry>,
  labels?: ActivityCsvLabels
): string {
  const headers = labels?.headers ?? DEFAULT_CSV_HEADERS;
  const successLabel = labels?.successOutcome ?? "SUCCESS";
  const failureLabel = labels?.failureOutcome ?? "FAILURE";
  const defaultCategory = labels?.defaultCategory ?? "Security";
  const rows = entries.map((entry) => [
    entry.id,
    entry.timestampUtc,
    entry.category ?? defaultCategory,
    entry.eventType,
    entry.outcome ?? (isCsvEntrySuccess(entry) ? successLabel : failureLabel),
    entry.severity,
    entry.ipAddress,
    entry.correlationId,
    entry.entryHashShort,
    entry.payloadJson,
  ]);
  return [headers, ...rows].map((row) => row.map((c) => escapeCsvCell(c)).join(",")).join("\n");
}

/** Triggers a browser CSV download of the provided audit entries. */
export function exportActivityCsv(
  entries: ReadonlyArray<SovereignAuditEntry>,
  page: number,
  labels?: ActivityCsvLabels
): void {
  if (entries.length === 0 || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const csv = buildActivityCsv(entries, labels);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `scripe-account-activity-p${page}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
