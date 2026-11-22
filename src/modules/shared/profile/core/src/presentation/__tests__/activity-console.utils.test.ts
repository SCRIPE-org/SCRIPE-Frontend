import { describe, expect, it } from "vitest";
import {
  buildActivityCsv,
  buildKnownActivityCategories,
  computeDateBounds,
  extractAuditSummary,
  isEntrySuccess,
  safeParseAuditPayload,
  toForensicEntry,
} from "../utils/activity-console.utils";
import type { SovereignAuditEntry } from "../../domain/entities/SovereignAccountEntities";

const sampleEntry: SovereignAuditEntry = {
  id: "aud-1",
  eventType: "PasswordChanged",
  category: "Security",
  outcome: "Success",
  severity: "INFO",
  timestampUtc: "2026-11-15T12:00:00.000Z",
  ipAddress: "10.0.0.5",
  correlationId: "corr-123",
  previousHashShort: "GENESIS",
  entryHashShort: "abc12345",
  payloadJson: JSON.stringify({
    details: "Administrator updated password",
    userAgent: "Edge/130",
    impersonatedBy: "root-admin",
  }),
};

describe("activity-console.utils", () => {
  it("computes deterministic UTC preset bounds", () => {
    const now = Date.UTC(2026, 10, 15, 12, 0, 0);
    expect(computeDateBounds("ALL", undefined, undefined, now)).toEqual({});
    expect(computeDateBounds("24H", undefined, undefined, now)).toEqual({
      fromUtc: "2026-11-14T12:00:00.000Z",
    });
    expect(computeDateBounds("7D", undefined, undefined, now)).toEqual({
      fromUtc: "2026-11-08T12:00:00.000Z",
    });
  });

  it("classifies entry outcomes and falls back safely on malformed JSON", () => {
    expect(isEntrySuccess(sampleEntry)).toBe(true);
    expect(
      isEntrySuccess({ outcome: "FAILURE", severity: "INFO" })
    ).toBe(false);
    expect(
      isEntrySuccess({ outcome: "Blocked", severity: "HIGH" })
    ).toBe(false);
    expect(safeParseAuditPayload("{not-json")).toEqual({ raw: "{not-json" });
    expect(extractAuditSummary(sampleEntry)).toBe(
      "Administrator updated password"
    );
  });

  it("maps SovereignAuditEntry to SecurityAuditEntry using supplied fallback actor", () => {
    const forensic = toForensicEntry(sampleEntry, "Localized Console");
    expect(forensic.userAgent).toBe("Edge/130");
    expect(forensic.impersonatedBy).toBe("root-admin");
    expect(forensic.isSuccess).toBe(true);

    const fallback = toForensicEntry(
      { ...sampleEntry, payloadJson: "{}" },
      "Localized Console"
    );
    expect(fallback.userAgent).toBe("Localized Console");
  });

  it("extracts sorted known categories and escapes CSV cells", () => {
    expect(
      buildKnownActivityCategories([
        sampleEntry,
        { category: "Governance" },
        { category: "ALL" },
        { category: "Security" },
      ])
    ).toEqual(["Governance", "Security"]);

    const csv = buildActivityCsv([sampleEntry]);
    expect(csv).toContain('"ID","Timestamp (UTC)"');
    expect(csv).toContain('"PasswordChanged"');
  });
});
