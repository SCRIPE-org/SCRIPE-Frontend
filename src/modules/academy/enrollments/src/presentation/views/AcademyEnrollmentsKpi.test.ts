import { describe, it, expect } from "vitest";

describe("Academy Enrollments KPI Deduplication (DEF-008)", () => {
  it("counts distinct athletes for active enrollments when one athlete has multiple active enrollments", () => {
    const enrollments = [
      { id: "e1", athleteId: "ath-1", status: "Active", billingStatus: "Invoiced" },
      { id: "e2", athleteId: "ath-1", status: "Active", billingStatus: "Paid" }, // same athlete, different offering
      { id: "e3", athleteId: "ath-2", status: "Active", billingStatus: "Unbilled" },
      { id: "e4", athleteId: "ath-3", status: "Withdrawn", billingStatus: "Unbilled" }, // withdrawn
      { id: "e5", athleteId: "ath-4", status: "PendingFinance", billingStatus: "Unbilled" }, // not active
    ];

    // Invariant under DEF-008:
    // Active enrollments count = 3 (e1, e2, e3)
    // Active Enrolled Athletes (Distinct) = 2 (ath-1, ath-2)
    const activeEnrollments = enrollments.filter(e => e.status === "Active");
    const activeEnrolledAthletesCount = new Set(activeEnrollments.map(e => e.athleteId)).size;
    const totalDistinctAthletes = new Set(enrollments.map(e => e.athleteId)).size;

    expect(activeEnrollments.length).toBe(3);
    expect(activeEnrolledAthletesCount).toBe(2);
    expect(totalDistinctAthletes).toBe(4);
  });
});
