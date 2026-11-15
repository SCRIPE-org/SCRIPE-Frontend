import { describe, it, expect } from "vitest";
import {
  GROUP_CAPACITY_THRESHOLDS,
  evaluateGroupCapacity,
} from "./academy-capacity-policy";

describe("evaluateGroupCapacity (DEF-006)", () => {
  it("defines shared thresholds as 90% and 100%", () => {
    expect(GROUP_CAPACITY_THRESHOLDS.NEAR_FULL_PERCENT).toBe(90);
    expect(GROUP_CAPACITY_THRESHOLDS.FULL_PERCENT).toBe(100);
  });

  it("evaluates groups below 90% as Active", () => {
    const res85 = evaluateGroupCapacity(17, 20); // 85%
    expect(res85.status).toBe("Active");
    expect(res85.isNearFull).toBe(false);
    expect(res85.isFull).toBe(false);
    expect(res85.isActive).toBe(true);
    expect(res85.fillPercent).toBe(85);
    expect(res85.badgeLabelEn).toBe("Active");
    expect(res85.badgeLabelAr).toBe("نشط");
    expect(res85.barColorClass).toContain("bg-nx-accent-fill");
  });

  it("evaluates groups at exactly 90% as Near Full", () => {
    const res90 = evaluateGroupCapacity(18, 20); // 90%
    expect(res90.status).toBe("NearFull");
    expect(res90.isNearFull).toBe(true);
    expect(res90.isFull).toBe(false);
    expect(res90.isActive).toBe(false);
    expect(res90.fillPercent).toBe(90);
    expect(res90.badgeLabelEn).toBe("Near Full");
    expect(res90.badgeLabelAr).toBe("شبه ممتلئ");
    expect(res90.badgeVariantClass).toContain("warning");
    expect(res90.barColorClass).toContain("warning");
  });

  it("evaluates groups between 90% and 100% as Near Full", () => {
    const res95 = evaluateGroupCapacity(19, 20); // 95%
    expect(res95.status).toBe("NearFull");
    expect(res95.isNearFull).toBe(true);
    expect(res95.isFull).toBe(false);

    const res92 = evaluateGroupCapacity(22, 24); // 91.67% -> 92%
    expect(res92.status).toBe("NearFull");
    expect(res92.isNearFull).toBe(true);
    expect(res92.isFull).toBe(false);
  });

  it("evaluates groups at 100% capacity as Full", () => {
    const res100 = evaluateGroupCapacity(20, 20); // 100%
    expect(res100.status).toBe("Full");
    expect(res100.isNearFull).toBe(false);
    expect(res100.isFull).toBe(true);
    expect(res100.badgeLabelEn).toBe("Full");
    expect(res100.badgeLabelAr).toBe("ممتلئ");
    expect(res100.badgeVariantClass).toContain("rose");
    expect(res100.barColorClass).toContain("rose");
  });

  it("evaluates groups above 100% capacity as Full with clamped bar fill", () => {
    const resOver = evaluateGroupCapacity(25, 24);
    expect(resOver.status).toBe("Full");
    expect(resOver.isFull).toBe(true);
    expect(resOver.fillPercent).toBe(104);
    expect(resOver.clampedFillPercent).toBe(100);
  });

  it("handles zero or negative capacity gracefully without division by zero", () => {
    const resZero = evaluateGroupCapacity(0, 0);
    expect(resZero.status).toBe("Active");
    expect(resZero.fillPercent).toBe(0);
    expect(resZero.isFull).toBe(false);

    const resNeg = evaluateGroupCapacity(5, -1);
    expect(resNeg.status).toBe("Active");
    expect(resNeg.isFull).toBe(false);
  });
});
