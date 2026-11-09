import { describe, expect, it } from "vitest";
import { buildBulkAttendance, changeAttendanceMark, markAllPresent, reconcileDraft } from "./attendance-draft";
import type { AttendanceRow } from "./entities/Attendance";

const athlete = (athleteId: string, isEligible = true, recorded = false): AttendanceRow => ({
  athleteId,
  displayNameEn: athleteId,
  displayNameAr: "",
  isEligible,
  attendance: recorded ? { athleteId, status: "Present", reason: null, version: "v1", recordedBy: "staff", recordedAtUtc: "2026-11-08T08:00:00Z" } : null,
});

describe("attendance capture draft", () => {
  it("marks only eligible unrecorded athletes without replacing exceptions", () => {
    const draft = { late: { status: "Late", reason: "Transport" } } as const;
    expect(markAllPresent(draft, [athlete("present"), athlete("late"), athlete("saved", true, true), athlete("out", false)])).toEqual({
      late: { status: "Late", reason: "Transport" },
      present: { status: "Present", reason: "" },
    });
  });

  it("requires a nonblank reason for an excused absence or medical mark", () => {
    const rows = [athlete("a"), athlete("b")];
    const draft = { a: { status: "AbsentExcused", reason: " " }, b: { status: "Medical", reason: "" } } as const;
    expect(buildBulkAttendance(draft, rows)).toEqual({ entries: [], invalidAthletes: ["a", "b"] });
  });

  it("omits untouched athletes and trims optional reasons", () => {
    const draft = { marked: { status: "Late", reason: "  Transport  " } } as const;
    expect(buildBulkAttendance(draft, [athlete("unmarked"), athlete("marked")])).toEqual({
      entries: [{ athleteId: "marked", status: "Late", reason: "Transport" }], invalidAthletes: [],
    });
  });

  it("drops only roster changes that make a pending mark ineligible after a reload", () => {
    const draft = {
      available: { status: "Late", reason: "" }, saved: { status: "Present", reason: "" },
      departed: { status: "Present", reason: "" },
    } as const;
    expect(reconcileDraft(draft, [athlete("available"), athlete("saved", true, true)])).toEqual({ available: draft.available });
  });

  it("clears a draft reason when the status changes to present", () => {
    const draft = { a: { status: "Medical", reason: "Administrative note" } } as const;
    expect(changeAttendanceMark(draft, "a", "Present")).toEqual({ a: { status: "Present", reason: "" } });
  });
});
