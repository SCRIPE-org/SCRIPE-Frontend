/**
 * Account Activity Console Pure Utilities
 *
 * Pure date-window computation, forensic payload parsing, outcome classification,
 * and CSV export helpers for the SOC2 Account Activity view.
 */
import type { SovereignAuditEntry } from "../../domain/entities/SovereignAccountEntities";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";

/** Re-exported CSV audit export utilities and label contract. */
export {
  escapeCsvCell,
  buildActivityCsv,
  exportActivityCsv,
  type ActivityCsvLabels,
} from "./activity-csv.utils";

/**
 * Supported time-window presets for querying account audit activity.
 */
export type DateRangePreset = "ALL" | "24H" | "7D" | "30D" | "CUSTOM";

/**
 * Outcome filter values accepted by the activity console and backend query.
 */
export type ActivityOutcomeFilter = "ALL" | "SUCCESS" | "FAILURE";

/**
 * Normalized UTC ISO-8601 date range boundaries for server activity queries.
 */
export interface ActivityDateBounds {
  fromUtc?: string;
  toUtc?: string;
}

const PRESET_OFFSETS_MS: Record<Exclude<DateRangePreset, "ALL" | "CUSTOM">, number> = {
  "24H": 24 * 60 * 60 * 1000,
  "7D": 7 * 24 * 60 * 60 * 1000,
  "30D": 30 * 24 * 60 * 60 * 1000,
};

function toValidIsoUtc(localDateTime?: string): string | undefined {
  if (!localDateTime || !localDateTime.trim()) return undefined;
  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/**
 * Converts local datetime-local input strings into UTC ISO-8601 bounds.
 */
export function computeCustomDateBounds(
  customFromLocal?: string,
  customToLocal?: string
): ActivityDateBounds {
  const fromUtc = toValidIsoUtc(customFromLocal);
  const toUtc = toValidIsoUtc(customToLocal);
  return {
    ...(fromUtc ? { fromUtc } : {}),
    ...(toUtc ? { toUtc } : {}),
  };
}

/**
 * Computes deterministic UTC ISO-8601 query bounds for a date preset or custom range.
 */
export function computeDateBounds(
  preset: DateRangePreset,
  customFromLocal?: string,
  customToLocal?: string,
  nowMs: number = Date.now()
): ActivityDateBounds {
  if (preset === "ALL") return {};
  if (preset === "CUSTOM") {
    return computeCustomDateBounds(customFromLocal, customToLocal);
  }
  const offsetMs = PRESET_OFFSETS_MS[preset];
  return {
    fromUtc: new Date(nowMs - offsetMs).toISOString(),
  };
}

/**
 * Alias for `computeDateBounds` preserving preset-bound naming compatibility.
 */
export const computePresetBounds = computeDateBounds;

/**
 * Determines whether a sovereign audit entry represents a successful operation.
 */
export function isEntrySuccess(
  entry: Pick<SovereignAuditEntry, "outcome" | "severity">
): boolean {
  const outcome = (entry.outcome ?? "").trim().toLowerCase();
  if (
    outcome === "failure" ||
    outcome === "failed" ||
    outcome === "blocked" ||
    outcome === "error" ||
    outcome === "denied"
  ) {
    return false;
  }
  if (
    outcome === "success" ||
    outcome === "succeeded" ||
    outcome === "ok" ||
    outcome === "allowed"
  ) {
    return true;
  }
  const severity = (entry.severity ?? "").trim().toLowerCase();
  return severity !== "critical" && severity !== "error";
}

/**
 * Safely parses a JSON payload string into a key-value forensic object.
 */
export function safeParseAuditPayload(
  payloadJson?: string | null
): Record<string, unknown> {
  if (!payloadJson || !payloadJson.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(payloadJson);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { rawValue: parsed };
  } catch {
    return { raw: payloadJson };
  }
}

/**
 * Extracts a human-readable summary string from an audit entry's forensic payload.
 */
export function extractAuditSummary(entry: Pick<SovereignAuditEntry, "payloadJson">): string | null {
  const parsed = safeParseAuditPayload(entry.payloadJson);
  if (typeof parsed.details === "string") return parsed.details;
  if (typeof parsed.summary === "string") return parsed.summary;
  if (typeof parsed.message === "string") return parsed.message;
  return null;
}

/**
 * Converts a `SovereignAuditEntry` into a `SecurityAuditEntry` for the forensic drawer.
 */
export function toForensicEntry(
  entry: SovereignAuditEntry,
  defaultActorLabel: string = ""
): SecurityAuditEntry {
  const parsedPayload = safeParseAuditPayload(entry.payloadJson);
  const parsedTimestamp = new Date(entry.timestampUtc);
  const timestamp = Number.isNaN(parsedTimestamp.getTime())
    ? new Date(0)
    : parsedTimestamp;
  const userAgent =
    typeof parsedPayload.userAgent === "string" && parsedPayload.userAgent
      ? parsedPayload.userAgent
      : typeof parsedPayload.actor === "string" && parsedPayload.actor
        ? parsedPayload.actor
        : defaultActorLabel;
  const details = extractAuditSummary(entry);
  const impersonatedBy =
    typeof parsedPayload.impersonatedBy === "string"
      ? parsedPayload.impersonatedBy
      : null;

  return {
    id: entry.id,
    eventType: entry.eventType,
    timestamp,
    ipAddress: entry.ipAddress,
    userAgent,
    isSuccess: isEntrySuccess(entry),
    details,
    impersonatedBy,
    rawPayload: {
      ...parsedPayload,
      correlationId: entry.correlationId,
      previousHashShort: entry.previousHashShort,
      entryHashShort: entry.entryHashShort,
      category: entry.category ?? null,
      outcome: entry.outcome ?? null,
      severity: entry.severity,
    },
  };
}

/**
 * Extracts sorted unique category names present across an activity entry slice.
 */
export function buildKnownActivityCategories(
  entries: ReadonlyArray<Pick<SovereignAuditEntry, "category">>
): string[] {
  const categories = new Set<string>();
  for (const entry of entries) {
    const category = entry.category?.trim();
    if (category && category.toUpperCase() !== "ALL") {
      categories.add(category);
    }
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
