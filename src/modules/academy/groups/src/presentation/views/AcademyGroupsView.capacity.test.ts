import { describe, it, expect } from "vitest";
import {
  evaluateGroupCapacity,
  GROUP_CAPACITY_THRESHOLDS,
  type GroupCapacityEvaluation,
} from "@modules/academy/shared";

describe("AcademyGroupsView Capacity Policy & Thresholds (DEF-006)", () => {
  it("uses unified thresholds of 90% Near Full and 100% Full", () => {
    expect(GROUP_CAPACITY_THRESHOLDS.NEAR_FULL_PERCENT).toBe(90);
    expect(GROUP_CAPACITY_THRESHOLDS.FULL_PERCENT).toBe(100);
  });

  it("calculates groupsNearCapacityCount KPI accurately matching badges", () => {
    const mockGroups = [
      { id: "g1", nameEn: "U10 Alpha", activeMemberCount: 10, maxCapacity: 20 }, // 50% -> Active
      { id: "g2", nameEn: "U12 Beta", activeMemberCount: 17, maxCapacity: 20 },  // 85% -> Active (<90%)
      { id: "g3", nameEn: "U14 Falcons", activeMemberCount: 18, maxCapacity: 20 }, // 90% -> Near Full (>=90%)
      { id: "g4", nameEn: "U16 Lions", activeMemberCount: 19, maxCapacity: 20 },  // 95% -> Near Full
      { id: "g5", nameEn: "U18 Wolves", activeMemberCount: 20, maxCapacity: 20 }, // 100% -> Full
      { id: "g6", nameEn: "U14 Eagles", activeMemberCount: 22, maxCapacity: 24 }, // 91.67% -> Near Full
      { id: "g7", nameEn: "U16 Hawks", activeMemberCount: 24, maxCapacity: 24 },  // 100% -> Full
    ];

    const evaluations = mockGroups.map(g => ({
      group: g,
      cap: evaluateGroupCapacity(g.activeMemberCount, g.maxCapacity),
    }));

    // Near Capacity KPI count (>= 90% and < 100%)
    const nearCapacityCount = evaluations.filter(e => e.cap.isNearFull).length;
    expect(nearCapacityCount).toBe(3); // g3, g4, g6

    // Full count (>= 100%)
    const fullCount = evaluations.filter(e => e.cap.isFull).length;
    expect(fullCount).toBe(2); // g5, g7

    // Active count (< 90%)
    const activeCount = evaluations.filter(e => e.cap.isActive).length;
    expect(activeCount).toBe(2); // g1, g2
  });

  it("verifies badge labels, bar colors, and full blocking flags across all states", () => {
    // 1. Below 90% (85%)
    const active = evaluateGroupCapacity(17, 20);
    expect(active.status).toBe("Active");
    expect(active.badgeLabelEn).toBe("Active");
    expect(active.badgeLabelAr).toBe("نشط");
    expect(active.isFull).toBe(false);
    expect(active.isNearFull).toBe(false);
    expect(active.barColorClass).toContain("bg-nx-accent-fill");

    // 2. Exactly 90% (18/20)
    const nearFull90 = evaluateGroupCapacity(18, 20);
    expect(nearFull90.status).toBe("NearFull");
    expect(nearFull90.badgeLabelEn).toBe("Near Full");
    expect(nearFull90.badgeLabelAr).toBe("شبه ممتلئ");
    expect(nearFull90.isFull).toBe(false);
    expect(nearFull90.isNearFull).toBe(true);
    expect(nearFull90.badgeVariantClass).toContain("warning");
    expect(nearFull90.barColorClass).toContain("warning");

    // 3. Exactly 100% (20/20) - Hard block and waitlist
    const full100 = evaluateGroupCapacity(20, 20);
    expect(full100.status).toBe("Full");
    expect(full100.badgeLabelEn).toBe("Full");
    expect(full100.badgeLabelAr).toBe("ممتلئ");
    expect(full100.isFull).toBe(true);
    expect(full100.isNearFull).toBe(false);
    expect(full100.badgeVariantClass).toContain("rose");
    expect(full100.barColorClass).toContain("rose");

    // 4. Over capacity (21/20) - Hard block and clamped bar
    const overCap = evaluateGroupCapacity(21, 20);
    expect(overCap.status).toBe("Full");
    expect(overCap.isFull).toBe(true);
    expect(overCap.clampedFillPercent).toBe(100);
  });
});
