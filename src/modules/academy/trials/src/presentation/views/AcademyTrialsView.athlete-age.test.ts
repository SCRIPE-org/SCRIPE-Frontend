import { describe, it, expect } from "vitest";
import type { AcademyTrial } from "../../domain/entities/AcademyTrial";
import { exactAge, formatExactAge } from "@modules/academy/shared";

describe("AcademyTrialsView — Dynamic Athlete Age Calculation (DEF-001)", () => {
  const asOfNov15_2026 = new Date("2026-11-15T00:00:00Z");

  it("computes dynamic athlete age from DateOfBirth using unified exactAge policy", () => {
    // Case 1: Athlete born 2016-03-20 -> age 10 in Nov 2026
    const linaTrial: AcademyTrial = {
      id: "trial-1",
      athleteId: "ath-lina",
      athleteNameEn: "Lina Khaled",
      offeringId: "off-swim",
      scheduledDate: "2026-11-10",
      status: "Evaluated",
      athleteDateOfBirth: "2016-03-20",
    };

    const ageLina = linaTrial.athleteCalculatedAge ?? exactAge(linaTrial.athleteDateOfBirth, asOfNov15_2026);
    expect(ageLina).toBe(10);
    expect(formatExactAge(linaTrial.athleteDateOfBirth, asOfNov15_2026, "en")).toBe("10 years");
    expect(formatExactAge(linaTrial.athleteDateOfBirth, asOfNov15_2026, "ar")).toBe("10 سنة");

    // Case 2: Athlete born 2014-06-15 -> age 12 in Nov 2026 (was incorrectly hardcoded to 14)
    const omarTrial: AcademyTrial = {
      id: "trial-2",
      athleteId: "ath-omar",
      athleteNameEn: "Omar Khaled",
      offeringId: "off-foot",
      scheduledDate: "2026-11-10",
      status: "Scheduled",
      athleteDateOfBirth: "2014-06-15",
    };

    const ageOmar = omarTrial.athleteCalculatedAge ?? exactAge(omarTrial.athleteDateOfBirth, asOfNov15_2026);
    expect(ageOmar).toBe(12);
    expect(formatExactAge(omarTrial.athleteDateOfBirth, asOfNov15_2026, "en")).toBe("12 years");
    expect(formatExactAge(omarTrial.athleteDateOfBirth, asOfNov15_2026, "ar")).toBe("12 سنة");
  });

  it("cross-module consistency: Directory, Trials, Enrollments, and Roster compute identical age", () => {
    const dob = "2012-05-15";

    // 1. Directory View
    const directoryAge = exactAge(dob, asOfNov15_2026);
    // 2. Trials View
    const trialsAge = exactAge(dob, asOfNov15_2026);
    // 3. Enrollments View
    const enrollmentsAge = exactAge(dob, asOfNov15_2026);
    // 4. Roster View
    const rosterAge = exactAge(dob, asOfNov15_2026);

    expect(directoryAge).toBe(14);
    expect(trialsAge).toBe(14);
    expect(enrollmentsAge).toBe(14);
    expect(rosterAge).toBe(14);
    expect(directoryAge).toBe(trialsAge);
    expect(trialsAge).toBe(enrollmentsAge);
    expect(enrollmentsAge).toBe(rosterAge);
  });

  it("null or undefined dateOfBirth returns '—' across all views", () => {
    expect(formatExactAge(null, asOfNov15_2026, "en")).toBe("—");
    expect(formatExactAge(undefined, asOfNov15_2026, "en")).toBe("—");
    expect(formatExactAge("", asOfNov15_2026, "en")).toBe("—");
    expect(formatExactAge(null, asOfNov15_2026, "ar")).toBe("—");
  });
});
