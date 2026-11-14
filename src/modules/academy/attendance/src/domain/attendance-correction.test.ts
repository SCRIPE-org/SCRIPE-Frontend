import { describe, expect, it } from "vitest";
import { ATTENDANCE_REASON_LIMIT, type AttendanceCorrection, type AttendanceRecord } from "./entities/Attendance";

function validateAttendanceCorrection(correction: AttendanceCorrection): { valid: boolean; error?: string } {
  if (!correction.correctionReason || correction.correctionReason.trim().length === 0) {
    return { valid: false, error: "Correction reason is mandatory for audited attendance changes." };
  }
  if (correction.correctionReason.trim().length > ATTENDANCE_REASON_LIMIT) {
    return { valid: false, error: `Correction reason cannot exceed ${ATTENDANCE_REASON_LIMIT} characters.` };
  }
  if (!correction.expectedVersion || correction.expectedVersion.trim().length === 0) {
    return { valid: false, error: "Expected record version is required for optimistic concurrency control." };
  }
  if (!correction.expectedSessionVersion || correction.expectedSessionVersion.trim().length === 0) {
    return { valid: false, error: "Expected session version is required for optimistic concurrency control." };
  }
  return { valid: true };
}

describe("attendance correction persistence validation", () => {
  it("rejects corrections with empty or whitespace-only correction reason", () => {
    const invalid: AttendanceCorrection = {
      expectedVersion: "v1",
      expectedSessionVersion: "sv1",
      status: "Late",
      correctionReason: "   ",
    };
    const result = validateAttendanceCorrection(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("mandatory");
  });

  it("rejects corrections exceeding character limit", () => {
    const invalid: AttendanceCorrection = {
      expectedVersion: "v1",
      expectedSessionVersion: "sv1",
      status: "Late",
      correctionReason: "a".repeat(ATTENDANCE_REASON_LIMIT + 1),
    };
    const result = validateAttendanceCorrection(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("cannot exceed");
  });

  it("requires expectedVersion for optimistic concurrency control", () => {
    const invalid: AttendanceCorrection = {
      expectedVersion: "",
      expectedSessionVersion: "sv1",
      status: "Present",
      correctionReason: "Valid reason for audit",
    };
    const result = validateAttendanceCorrection(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Expected record version");
  });

  it("requires expectedSessionVersion for session-level optimistic concurrency", () => {
    const invalid: AttendanceCorrection = {
      expectedVersion: "v1",
      expectedSessionVersion: "",
      status: "Present",
      correctionReason: "Valid reason for audit",
    };
    const result = validateAttendanceCorrection(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Expected session version");
  });

  it("accepts a well-formed governed correction payload", () => {
    const valid: AttendanceCorrection = {
      expectedVersion: "6c11cedc-414f-4e56-acaf-7658e2ef3d5f",
      expectedSessionVersion: "8c12aedf-1122-3344-5566-778899aabbcc",
      status: "Late",
      reason: "Bus delay on Route 4",
      correctionReason: "Verified arrival at 17:42 by Head Coach",
    };
    const result = validateAttendanceCorrection(valid);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
